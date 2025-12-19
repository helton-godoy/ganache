use anyhow::Result;
use ganache_api::{DatasetConfig, DatasetInfo, PoolConfig, PoolInfo, StorageDevice};
use lazy_static::lazy_static;
use std::sync::Mutex;

lazy_static! {
    static ref MOCK_DATASETS: Mutex<Vec<DatasetInfo>> = Mutex::new(vec![
        DatasetInfo {
            pool: "pool".to_string(),
            name: "pool/Production".to_string(),
            used: "1.5T".to_string(),
            available: "2.1T".to_string(),
            mountpoint: "/pool/Production".to_string(),
            compression: "lz4".to_string(),
            quota: "none".to_string(),
        },
        DatasetInfo {
            pool: "pool".to_string(),
            name: "pool/Backups".to_string(),
            used: "500G".to_string(),
            available: "2.1T".to_string(),
            mountpoint: "/pool/Backups".to_string(),
            compression: "gzip".to_string(),
            quota: "none".to_string(),
        },
    ]);
}

pub struct ZpoolService;

impl ZpoolService {
    /// Lista dispositivos DRBD disponíveis no sistema
    pub async fn get_drbd_devices() -> Result<Vec<StorageDevice>> {
        // Mocking DRBD devices for development
        Ok(vec![StorageDevice {
            path: "/dev/drbd0".to_string(),
            name: "drbd0".to_string(),
            size: "500GB".to_string(),
            device_type: "drbd".to_string(),
        }])
    }

    /// Cria um novo ZFS pool no dispositivo especificado
    pub async fn create_pool(config: PoolConfig) -> Result<PoolInfo> {
        println!("Mocking 'zpool create {} {}'", config.name, config.device);

        let size = "496G";

        // Simular delay do comando
        tokio::time::sleep(std::time::Duration::from_millis(800)).await;

        let quota = match Self::calculate_90_percent(size) {
            Ok(q) => {
                let _ = Self::apply_quota(&config.name, &q).await;
                Some(q)
            }
            Err(e) => {
                eprintln!(
                    "Warning: Failed to calculate quota for {}: {}",
                    config.name, e
                );
                None
            }
        };

        Ok(PoolInfo {
            name: config.name.clone(),
            size: size.to_string(),
            alloc: "1.2M".to_string(),
            free: size.to_string(),
            health: "ONLINE".to_string(),
            mountpoint: format!("/{}", config.name),
            quota,
        })
    }

    /// Lista os pools ZFS existentes
    pub async fn list_pools() -> Result<Vec<PoolInfo>> {
        // Mocking existing pools
        let bp_size = "20G";

        Ok(vec![
            PoolInfo {
                name: "boot-pool".to_string(),
                size: bp_size.to_string(),
                alloc: "18.1G".to_string(), // Excedendo ligeiramente a quota de 18G
                free: "1.9G".to_string(),
                health: "ONLINE".to_string(),
                mountpoint: "/".to_string(),
                quota: Some("18G".to_string()),
            },
            PoolInfo {
                name: "pool".to_string(),
                size: "2.7T".to_string(),
                alloc: "1.5T".to_string(),
                free: "1.2T".to_string(),
                health: "ONLINE".to_string(),
                mountpoint: "/pool".to_string(),
                quota: None,
            },
        ])
    }

    /// Calcula o alvo ARC (Adaptive Replacement Cache) baseado na RAM do sistema
    pub fn calculate_arc_target(system_ram_bytes: u64) -> u64 {
        // Regra: Max ARC = 50% da RAM (Segurança para evitar OOM)
        // Margem de segurança: 1GB livre para o sistema operacional
        let safety_margin = 1024 * 1024 * 1024; // 1GB

        if system_ram_bytes <= safety_margin {
            // Se tem menos de 1GB, usa um mínimo seguro (ex: 64MB)
            return 64 * 1024 * 1024;
        }

        let available_for_zfs = system_ram_bytes - safety_margin;
        let target = available_for_zfs / 2;

        target
    }

    /// Calcula 90% do tamanho total (raw) para quota
    pub fn calculate_90_percent(size_str: &str) -> Result<String> {
        // Simplificação: Assume sufixo 'G' para este mock
        let size_gb: f64 = size_str
            .trim_end_matches('G')
            .parse()
            .map_err(|_| anyhow::anyhow!("Invalid size format"))?;

        let quota_gb = size_gb * 0.9;
        Ok(format!("{:.0}G", quota_gb))
    }

    pub async fn apply_quota(_pool_name: &str, _quota: &str) -> Result<()> {
        // Mocking 'zfs set quota=... pool'
        Ok(())
    }

    // --- Dataset Operations (Stateful Mock) ---

    /// Cria um novo dataset ZFS (Mock Stateful)
    pub async fn create_dataset(config: DatasetConfig) -> Result<DatasetInfo> {
        let mut datasets = MOCK_DATASETS.lock().unwrap();

        // VALIDATION: Name must start with "pool/"
        let expected_prefix = format!("{}/", config.pool_name);
        if !config.name.starts_with(&expected_prefix) {
            return Err(anyhow::anyhow!(
                "Invalid dataset name '{}'. Must start with '{}'",
                config.name,
                expected_prefix
            ));
        }

        if datasets.iter().any(|d| d.name == config.name) {
            return Err(anyhow::anyhow!("Dataset '{}' already exists", config.name));
        }

        let new_dataset = DatasetInfo {
            pool: config.pool_name,
            name: config.name.clone(),
            used: "0B".to_string(),        // Inicialmente vazio
            available: "496G".to_string(), // Herdado do pool (mock)
            mountpoint: format!("/{}", config.name.replace('/', "-")),
            compression: config.compression.unwrap_or_else(|| "off".to_string()),
            quota: config.quota.unwrap_or_else(|| "none".to_string()),
        };

        datasets.push(new_dataset.clone());
        println!("MOCK: Created dataset '{}'", config.name);

        Ok(new_dataset)
    }

    /// Destrói um dataset ZFS (Mock Stateful)
    pub async fn destroy_dataset(_pool: &str, name: &str) -> Result<()> {
        let mut datasets = MOCK_DATASETS.lock().unwrap();

        if let Some(pos) = datasets.iter().position(|d| d.name == name) {
            datasets.remove(pos);
            println!("MOCK: Destroyed dataset '{}'", name);
            Ok(())
        } else {
            Err(anyhow::anyhow!("Dataset '{}' not found", name))
        }
    }

    /// Lista os datasets ZFS existentes (Mock Stateful)
    pub async fn list_datasets(pool_name: &str) -> Result<Vec<DatasetInfo>> {
        let datasets = MOCK_DATASETS.lock().unwrap();
        Ok(datasets
            .iter()
            .filter(|d| d.pool == pool_name)
            .cloned()
            .collect())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_calculate_arc_target() {
        let ram_8gb = 8 * 1024 * 1024 * 1024;
        let target = ZpoolService::calculate_arc_target(ram_8gb);
        // 8GB - 1GB = 7GB / 2 = 3.5GB
        let expected = (3.5 * 1024.0 * 1024.0 * 1024.0) as u64;
        assert_eq!(target, expected);
    }

    #[tokio::test]
    async fn test_dataset_lifecycle() {
        // Use a UNIQUE pool name to avoid collision with other tests or default state
        let test_pool = "test_lifecycle_pool";

        let initial_count = ZpoolService::list_datasets(test_pool).await.unwrap().len();
        assert_eq!(initial_count, 0, "Should start empty for this fresh pool");

        let new_ds = DatasetConfig {
            pool_name: test_pool.to_string(),
            name: format!("{}/TestDataset", test_pool), // Correct naming
            compression: None,
            quota: None,
        };

        // Create
        let created = ZpoolService::create_dataset(new_ds.clone()).await.unwrap();
        assert_eq!(created.name, format!("{}/TestDataset", test_pool));

        let after_create = ZpoolService::list_datasets(test_pool).await.unwrap();
        assert_eq!(after_create.len(), 1);
        assert!(after_create
            .iter()
            .any(|d| d.name == format!("{}/TestDataset", test_pool)));

        // Duplicate
        let dup_err = ZpoolService::create_dataset(new_ds).await;
        assert!(dup_err.is_err());

        // Destroy
        ZpoolService::destroy_dataset(test_pool, &format!("{}/TestDataset", test_pool))
            .await
            .unwrap();

        let after_destroy = ZpoolService::list_datasets(test_pool).await.unwrap();
        assert_eq!(after_destroy.len(), 0);
    }

    #[tokio::test]
    async fn test_dataset_naming_validation() {
        let test_pool = "validation_pool";

        let invalid_ds = DatasetConfig {
            pool_name: test_pool.to_string(),
            name: "InvalidName".to_string(), // Missing pool prefix
            compression: None,
            quota: None,
        };

        let err = ZpoolService::create_dataset(invalid_ds).await;
        assert!(err.is_err());
        assert_eq!(
            err.unwrap_err().to_string(),
            format!(
                "Invalid dataset name 'InvalidName'. Must start with '{}/'",
                test_pool
            )
        );
    }
}
