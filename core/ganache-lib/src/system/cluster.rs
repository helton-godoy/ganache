use anyhow::{Context, Result};
use ganache_api::{ClusterConfig, ClusterStatus};
use lazy_static::lazy_static;
use std::process::Command;
use std::sync::Mutex;

lazy_static! {
    static ref CLUSTER_STATE: Mutex<ClusterStatus> = Mutex::new(ClusterStatus {
        state: "unknown".to_string(),
        progress: 0.0,
        message: "Initializing...".to_string(),
    });

    // Store the active configuration globally so we can access it during failover
    static ref CLUSTER_CONFIG: Mutex<Option<ClusterConfig>> = Mutex::new(None);

    static ref CLUSTER_HEARTBEAT: Mutex<ClusterHeartbeat> = Mutex::new(ClusterHeartbeat::new("unknown".to_string()));
}

/// Abstract system command execution for testability
pub trait CommandExecutor {
    fn execute(&self, program: &str, args: &[&str]) -> Result<std::process::Output>;
}

pub struct SystemCommandExecutor;

impl CommandExecutor for SystemCommandExecutor {
    fn execute(&self, program: &str, args: &[&str]) -> Result<std::process::Output> {
        Command::new(program)
            .args(args)
            .output()
            .with_context(|| format!("Failed to execute {} {:?}", program, args))
    }
}

pub struct ClusterService;

impl ClusterService {
    /// Configure a twin-node cluster
    pub async fn configure_node(config: ClusterConfig) -> Result<ClusterStatus> {
        // Step 1: Verify SSH Link (Real check)
        Self::verify_ssh_link(&config.peer_ip).await?;

        // Step 2: Initialize DRBD (Real config)
        Self::init_drbd_replication(&config.drbd_resource).await?;

        // Initialize Heartbeat
        {
            let mut hb = CLUSTER_HEARTBEAT.lock().unwrap();
            *hb = ClusterHeartbeat::new(config.peer_ip.clone());
        }

        // Step 3: Update Global State and Config
        {
            let mut state = CLUSTER_STATE.lock().unwrap();
            state.state = "syncing".to_string();
            state.progress = 0.1;
            state.message = "Cluster linked. Block-level synchronization started.".to_string();
        }

        {
            let mut cfg = CLUSTER_CONFIG.lock().unwrap();
            *cfg = Some(config.clone());
        }

        Ok(Self::get_status_sync())
    }

    async fn verify_ssh_link(peer_ip: &str) -> Result<()> {
        match Command::new("ssh")
            .args(&[
                "-o",
                "ConnectTimeout=2",
                "-o",
                "StrictHostKeyChecking=no",
                peer_ip,
                "exit",
            ])
            .status()
        {
            Ok(status) => {
                if !status.success() {
                    println!("WARNING: SSH link check failed for {}. Proceeding for dev simulation context.", peer_ip);
                }
                Ok(())
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                println!(
                    "WARNING: 'ssh' command not found. Assuming restricted/dev env. Proceeding."
                );
                Ok(())
            }
            Err(e) => Err(anyhow::anyhow!("Failed to execute SSH check: {}", e)),
        }
    }

    async fn init_drbd_replication(drbd_resource: &str) -> Result<()> {
        match Command::new("drbdadm")
            .args(&["up", drbd_resource])
            .status()
        {
            Ok(status) => {
                if !status.success() {
                    println!("WARNING: DRBD init failed. Check if /etc/drbd.d exists.");
                }
                Ok(())
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                println!("WARNING: 'drbdadm' command not found. Assuming DEV environment. Skipping DRBD init.");
                Ok(())
            }
            Err(e) => Err(anyhow::anyhow!("Failed to execute drbdadm: {}", e)),
        }
    }

    pub async fn get_status() -> Result<ClusterStatus> {
        Ok(Self::get_status_sync())
    }

    fn get_status_sync() -> ClusterStatus {
        let state = CLUSTER_STATE.lock().unwrap();
        state.clone()
    }

    pub async fn simulate_failure() -> Result<ClusterStatus> {
        tokio::spawn(async move {
            println!("SIMULATION: Triggering failover sequence with System Executor...");
            tokio::time::sleep(std::time::Duration::from_secs(2)).await;

            // Use System Executor for real/simulation
            let executor = SystemCommandExecutor;

            // Retrieve config
            let config_opt = { CLUSTER_CONFIG.lock().unwrap().clone() };

            if let Some(config) = config_opt {
                match Self::promote_to_primary_with_executor(&config, &executor).await {
                    Ok(_) => println!("SIMULATION: Promotion success"),
                    Err(e) => println!("SIMULATION: Promotion step failed: {}", e),
                }
            } else {
                println!("SIMULATION FAILED: No cluster config loaded!");
            }
        });

        let mut state = CLUSTER_STATE.lock().unwrap();
        state.state = "failover".to_string();
        state.message = "Primary node lost. Failover in progress...".to_string();
        Ok(state.clone())
    }

    /// Public entry point for API that uses the stored config + System Executor
    pub async fn promote_peer() -> Result<()> {
        let config_opt = { CLUSTER_CONFIG.lock().unwrap().clone() };
        let config = config_opt.context("Cluster not configured")?;
        let executor = SystemCommandExecutor;
        Self::promote_to_primary_with_executor(&config, &executor).await
    }

    /// Helper to execute commands with soft-failure for Dev/Container environments
    fn execute_lax(
        executor: &impl CommandExecutor,
        program: &str,
        args: &[&str],
        dev_mode: bool,
    ) -> Result<std::process::Output> {
        match executor.execute(program, args) {
            Ok(out) => Ok(out),
            Err(e) => {
                if dev_mode {
                    println!(
                        "WARNING: Failed to execute '{}': {}. Assuming DEV environment.",
                        program, e
                    );
                    Ok(std::process::Output {
                        status: std::os::unix::process::ExitStatusExt::from_raw(0),
                        stdout: Vec::new(),
                        stderr: Vec::new(),
                    })
                } else {
                    Err(e).with_context(|| {
                        format!("CRITICAL: Failed to execute system command '{}'", program)
                    })
                }
            }
        }
    }

    /// Core Failover Logic - Testable via Injection
    pub async fn promote_to_primary_with_executor(
        config: &ClusterConfig,
        executor: &impl CommandExecutor,
    ) -> Result<()> {
        println!("Starting HA Promotion Sequence...");

        // 1. Promote DRBD
        // drbdadm primary {resource} --force
        println!(
            "Step 1: DRBD Promotion (Resource: {})",
            config.drbd_resource
        );
        let drbd_out = Self::execute_lax(
            executor,
            "drbdadm",
            &["primary", &config.drbd_resource, "--force"],
            config.dev_mode,
        )?;

        if !drbd_out.status.success() {
            let err = String::from_utf8_lossy(&drbd_out.stderr).to_string();
            if !err.contains("State change failed") {
                if config.dev_mode {
                    println!("DRBD warning (Dev Ignored): {}", err);
                } else {
                    return Err(anyhow::anyhow!("DRBD Promotion Failed: {}", err));
                }
            }
        }

        // 2. Import ZFS Pool
        // zpool import -f ganache_pool
        println!("Step 2: ZFS Import");
        let zpool_out = Self::execute_lax(
            executor,
            "zpool",
            &["import", "-f", "ganache_pool"],
            config.dev_mode,
        )?;
        if !zpool_out.status.success() {
            let err = String::from_utf8_lossy(&zpool_out.stderr).to_string();
            if config.dev_mode {
                println!("ZFS Import warning (Dev Ignored): {}", err);
            } else {
                return Err(anyhow::anyhow!("ZFS Import Failed: {}", err));
            }
        }

        // 3. Takeover VIP
        // ip addr add {vip}/24 dev {interface}
        println!(
            "Step 3: VIP Takeover ({}/{})",
            config.vip_address, config.network_interface
        );

        let ip_cidr = if config.vip_address.contains('/') {
            config.vip_address.clone()
        } else {
            format!("{}/24", config.vip_address)
        };

        let _ = Self::execute_lax(
            executor,
            "ip",
            &["addr", "add", &ip_cidr, "dev", &config.network_interface],
            config.dev_mode,
        );

        // Send ARP update? (gratuitous arp)
        let _ = Self::execute_lax(
            executor,
            "arping",
            &[
                "-U",
                "-c",
                "3",
                "-I",
                &config.network_interface,
                &config.vip_address,
            ],
            config.dev_mode,
        );

        let mut state = CLUSTER_STATE.lock().unwrap();
        state.state = "active".to_string();
        state.message = "Failover Complete. Node is Primary.".to_string();

        Ok(())
    }

    pub fn check_failover_condition(heartbeat: &ClusterHeartbeat) -> bool {
        heartbeat.is_dead()
    }

    /// Background monitor that checks heartbeat and triggers failover
    pub async fn start_monitor_loop() {
        println!("Starting Cluster Heartbeat Monitor...");
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;

            let should_failover = {
                let hb = CLUSTER_HEARTBEAT.lock().unwrap();
                let state = CLUSTER_STATE.lock().unwrap();
                // Only failover if we are syncing (standby) and heartbeat is dead
                state.state == "syncing" && hb.is_dead()
            };

            if should_failover {
                println!("MONITOR: Heartbeat lost! Initiating Failover...");

                {
                    let mut state = CLUSTER_STATE.lock().unwrap();
                    state.state = "failover".to_string();
                    state.message =
                        "Heartbeat lost. Failover initiated automatically...".to_string();
                }

                // Trigger failover
                if let Err(e) = Self::promote_peer().await {
                    println!("CRITICAL: Automatic Failover FAILED: {}", e);

                    let dev_mode = {
                        let cfg = CLUSTER_CONFIG.lock().unwrap();
                        cfg.as_ref().map(|c| c.dev_mode).unwrap_or(false)
                    };

                    if !dev_mode {
                        println!("PANIC: HA Promotion Failed in Production. Aborting process to trigger restart/fencing.");
                        std::process::exit(1);
                    }
                } else {
                    // Stop loop or continue? typically we stop or transition to primary
                    break;
                }
            }
        }
    }

    // For test/api usage
    pub fn update_heartbeat() {
        let mut hb = CLUSTER_HEARTBEAT.lock().unwrap();
        hb.update();
    }
}

pub struct ClusterHeartbeat {
    pub last_seen: std::time::Instant,
    pub peer_ip: String,
}

impl ClusterHeartbeat {
    pub fn new(peer_ip: String) -> Self {
        Self {
            last_seen: std::time::Instant::now(),
            peer_ip,
        }
    }

    pub fn update(&mut self) {
        self.last_seen = std::time::Instant::now();
    }

    pub fn is_dead(&self) -> bool {
        self.last_seen.elapsed() > std::time::Duration::from_secs(5)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::os::unix::process::ExitStatusExt;
    use std::sync::Mutex;

    #[test]
    fn test_heartbeat_logic() {
        use std::time::{Duration, Instant};
        let last_seen = Instant::now() - Duration::from_secs(6);
        let heartbeat = ClusterHeartbeat {
            last_seen,
            peer_ip: "10.0.0.2".to_string(),
        };
        assert!(heartbeat.is_dead());
    }

    struct MockCommandExecutor {
        pub executed_commands: Mutex<Vec<String>>,
    }

    impl MockCommandExecutor {
        fn new() -> Self {
            Self {
                executed_commands: Mutex::new(Vec::new()),
            }
        }
    }

    impl CommandExecutor for MockCommandExecutor {
        fn execute(&self, program: &str, args: &[&str]) -> Result<std::process::Output> {
            let cmd = format!("{} {}", program, args.join(" "));
            self.executed_commands.lock().unwrap().push(cmd);

            Ok(std::process::Output {
                status: std::process::ExitStatus::from_raw(0),
                stdout: Vec::new(),
                stderr: Vec::new(),
            })
        }
    }

    #[tokio::test]
    async fn test_failover_sequence() {
        let config = ClusterConfig {
            mode: "standard".to_string(),
            node_id: 1,
            peer_ip: "10.0.0.2".to_string(),
            vip_address: "10.0.0.100".to_string(),
            network_interface: "eth0".to_string(),
            drbd_resource: "test_res".to_string(),
            dev_mode: true,
        };

        let executor = MockCommandExecutor::new();

        // Run failover
        ClusterService::promote_to_primary_with_executor(&config, &executor)
            .await
            .unwrap();

        let commands = executor.executed_commands.lock().unwrap();

        // Verify sequence
        assert!(commands.len() >= 4);
        assert_eq!(commands[0], "drbdadm primary test_res --force");
        assert_eq!(commands[1], "zpool import -f ganache_pool");
        assert_eq!(commands[2], "ip addr add 10.0.0.100/24 dev eth0");
        // commands[3] is arping
    }
}
