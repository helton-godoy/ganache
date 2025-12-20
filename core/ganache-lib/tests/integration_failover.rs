use anyhow::Result;
use ganache_api::ClusterConfig;
use ganache_lib::system::cluster::{ClusterService, CommandExecutor};
use std::sync::{Arc, Mutex};

/// Mock Executor to capture commands
#[derive(Clone)]
struct MockCommandExecutor {
    pub calls: Arc<Mutex<Vec<(String, Vec<String>)>>>,
}

impl MockCommandExecutor {
    fn new() -> Self {
        Self {
            calls: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

impl CommandExecutor for MockCommandExecutor {
    fn execute(&self, program: &str, args: &[&str]) -> Result<std::process::Output> {
        let mut calls = self.calls.lock().unwrap();
        calls.push((
            program.to_string(),
            args.iter().map(|s| s.to_string()).collect(),
        ));

        // Return success
        Ok(std::process::Output {
            status: std::os::unix::process::ExitStatusExt::from_raw(0),
            stdout: Vec::new(),
            stderr: Vec::new(),
        })
    }
}

#[tokio::test]
async fn test_failover_sequence_order() {
    // 1. Setup
    let config = ClusterConfig {
        mode: "standard".to_string(),
        node_id: 1,
        peer_ip: "10.0.0.2".to_string(),
        vip_address: "10.0.0.100/24".to_string(),
        network_interface: "eth1".to_string(),
        drbd_resource: "test_res".to_string(),
        dev_mode: true,
    };

    let mock_executor = MockCommandExecutor::new();

    // 2. Action
    ClusterService::promote_to_primary_with_executor(&config, &mock_executor)
        .await
        .expect("Promotion failed");

    // 3. Asset
    let calls = mock_executor.calls.lock().unwrap();
    assert_eq!(calls.len(), 4, "Expected 4 system calls");

    // Step 1: DRBD
    assert_eq!(calls[0].0, "drbdadm");
    assert_eq!(calls[0].1, vec!["primary", "test_res", "--force"]);

    // Step 2: ZFS (Not yet strictly ordered vis-a-vis external executor if using ZpoolService,
    // but we invoked it via executor in ClusterService for this test)
    assert_eq!(calls[1].0, "zpool");
    assert_eq!(calls[1].1, vec!["import", "-f", "ganache_pool"]);

    // Step 3: IP
    assert_eq!(calls[2].0, "ip");
    assert_eq!(
        calls[2].1,
        vec!["addr", "add", "10.0.0.100/24", "dev", "eth1"]
    );

    // Step 4: Arping
    assert_eq!(calls[3].0, "arping");
}
