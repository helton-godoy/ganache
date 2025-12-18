use anyhow::Result;
use ganache_api::{ClusterConfig, ClusterStatus};

pub struct ClusterService;

impl ClusterService {
    /// Mock configuration of a twin-node cluster
    pub async fn configure_node(config: ClusterConfig) -> Result<ClusterStatus> {
        // Step 1: Verify SSH Link
        Self::verify_ssh_link(&config.peer_ip).await?;

        // Step 2: Initialize DRBD
        Self::init_drbd_replication(&config.peer_ip).await?;

        Ok(ClusterStatus {
            state: "syncing".to_string(),
            progress: 0.1,
            message: "Cluster linked. Block-level synchronization started.".to_string(),
        })
    }

    async fn verify_ssh_link(peer_ip: &str) -> Result<()> {
        println!("Mocking SSH key exchange with {}", peer_ip);
        tokio::time::sleep(std::time::Duration::from_millis(300)).await;
        Ok(())
    }

    async fn init_drbd_replication(peer_ip: &str) -> Result<()> {
        println!("Mocking DRBD resource configuration for peer {}", peer_ip);
        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        Ok(())
    }

    pub async fn get_status() -> Result<ClusterStatus> {
        // Mocking a status check
        Ok(ClusterStatus {
            state: "syncing".to_string(),
            progress: 0.45,
            message: "DRBD syncing: 45% complete".to_string(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_configure_node_flow() {
        let config = ClusterConfig {
            mode: "compatibility".to_string(),
            node_id: 1,
            peer_ip: "10.0.0.2".to_string(),
        };

        let result = ClusterService::configure_node(config).await;
        assert!(result.is_ok());
        let status = result.unwrap();
        assert_eq!(status.state, "syncing");
    }
}
