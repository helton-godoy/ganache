use anyhow::Result;
use ganache_api::{DatasetConfig, DatasetInfo, PoolConfig, PoolInfo, StorageDevice};

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
        let data_size = "500G";
        Ok(vec![
            PoolInfo {
                name: "boot-pool".to_string(),
                size: bp_size.to_string(),
                alloc: "18.1G".to_string(), // Excedendo ligeiramente a quota de 18G
                free: "1.9G".to_string(),
                health: "ONLINE".to_string(),
                mountpoint: "legacy".to_string(),
                quota: Self::calculate_90_percent(bp_size).ok(),
            },
            PoolInfo {
                name: "data-pool".to_string(),
                size: data_size.to_string(),
                alloc: "50G".to_string(),
                free: "450G".to_string(),
                health: "ONLINE".to_string(),
                mountpoint: "/data".to_string(),
                quota: Self::calculate_90_percent(data_size).ok(),
            },
        ])
    }

    /// Calcula 90% do tamanho informado para a quota rígida
    pub fn calculate_90_percent(size_str: &str) -> Result<String> {
        if size_str.is_empty() {
            return Err(anyhow::anyhow!("Empty size string"));
        }

        // Encontrar onde terminam os números e começa o sufixo
        let split_idx = size_str.find(|c: char| !c.is_digit(10) && c != '.');

        let (numeric_part, suffix) = match split_idx {
            Some(idx) => (&size_str[..idx], &size_str[idx..]),
            None => (size_str, ""),
        };

        if numeric_part.is_empty() {
            return Err(anyhow::anyhow!("Invalid size format: {}", size_str));
        }

        let val: f64 = numeric_part
            .parse()
            .map_err(|_| anyhow::anyhow!("Failed to parse numeric part: {}", numeric_part))?;
        let quota_val = val * 0.9;

        // Formatar para evitar muitos decimais se possível
        if quota_val == quota_val.round() {
            Ok(format!("{}{}", quota_val as u64, suffix))
        } else {
            Ok(format!("{:.1}{}", quota_val, suffix))
        }
    }

    /// Aplica a quota no pool especificado
    pub async fn apply_quota(pool_name: &str, quota: &str) -> Result<()> {
        println!("Mocking 'zfs set quota={} {}'", quota, pool_name);
        // Simular delay
        tokio::time::sleep(std::time::Duration::from_millis(200)).await;
        Ok(())
    }
}

// Global Memory State for Datasets
lazy_static::lazy_static! {
    static ref MOCK_DATASETS: std::sync::Mutex<Vec<DatasetInfo>> = std::sync::Mutex::new(vec![
        DatasetInfo {
            name: "Marketing".to_string(),
            pool: "data-pool".to_string(),
            mountpoint: "/data-pool/Marketing".to_string(),
            compression: "lz4".to_string(),
            quota: "0".to_string().into(),
            used: "1.2G".to_string(),
            available: "400G".to_string(),
        },
        DatasetInfo {
            name: "Engineering".to_string(),
            pool: "data-pool".to_string(),
            mountpoint: "/data-pool/Engineering".to_string(),
            compression: "zstd".to_string(),
            quota: "100G".to_string().into(),
            used: "45G".to_string(),
            available: "55G".to_string(),
        },
    ]);
}

impl ZpoolService {
    /// Lista os datasets de um pool
    pub async fn list_datasets(pool_name: &str) -> Result<Vec<DatasetInfo>> {
        // Mock implementation for Dev
        let datasets = MOCK_DATASETS.lock().unwrap();
        let filtered: Vec<DatasetInfo> = datasets
            .iter()
            .filter(|d| d.pool == pool_name)
            .cloned()
            .collect();
        Ok(filtered)
    }

    /// Cria um novo dataset
    pub async fn create_dataset(config: DatasetConfig) -> Result<DatasetInfo> {
        println!("Mocking 'zfs create {}/{}'", config.pool_name, config.name);

        let new_ds = DatasetInfo {
            name: config.name.clone(),
            pool: config.pool_name.clone(),
            mountpoint: format!("/{}/{}", config.pool_name, config.name),
            compression: "lz4".to_string(), // Default mock
            quota: "0".to_string(),
            used: "0B".to_string(),
            available: "500G".to_string(), // Mock value
        };

        {
            let mut datasets = MOCK_DATASETS.lock().unwrap();
            datasets.push(new_ds.clone());
        }

        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        Ok(new_ds)
    }

    /// Remove um dataset
    pub async fn destroy_dataset(pool_name: &str, dataset_name: &str) -> Result<()> {
        println!("Mocking 'zfs destroy {}/{}'", pool_name, dataset_name);

        {
            let mut datasets = MOCK_DATASETS.lock().unwrap();
            if let Some(pos) = datasets
                .iter()
                .position(|d| d.pool == pool_name && d.name == dataset_name)
            {
                datasets.remove(pos);
            } else {
                return Err(anyhow::anyhow!("Dataset not found"));
            }
        }

        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_drbd_devices() {
        let devices = ZpoolService::get_drbd_devices().await.unwrap();
        assert_eq!(devices.len(), 1);
        assert_eq!(devices[0].path, "/dev/drbd0");
    }

    #[tokio::test]
    async fn test_create_pool() {
        let config = PoolConfig {
            name: "data".to_string(),
            device: "/dev/drbd0".to_string(),
            compression: true,
        };
        let pool = ZpoolService::create_pool(config).await.unwrap();
        assert_eq!(pool.name, "data");
        assert_eq!(pool.health, "ONLINE");
    }

    #[tokio::test]
    async fn test_calculate_90_percent() {
        assert_eq!(ZpoolService::calculate_90_percent("100G").unwrap(), "90G");
        assert_eq!(ZpoolService::calculate_90_percent("500G").unwrap(), "450G");
        assert_eq!(ZpoolService::calculate_90_percent("10.5T").unwrap(), "9.5T"); // 10.5 * 0.9 = 9.45, rounded to 9.5 due to .1 format
        assert_eq!(ZpoolService::calculate_90_percent("1000").unwrap(), "900");
        assert_eq!(ZpoolService::calculate_90_percent("2M").unwrap(), "1.8M");
    }

    #[tokio::test]
    async fn test_dataset_operations() {
        let config = DatasetConfig {
            pool_name: "data-pool".to_string(),
            name: "TestDataset".to_string(),
            compression: None,
            quota: None,
        };

        let ds: DatasetInfo = ZpoolService::create_dataset(config).await.unwrap();
        assert_eq!(ds.name, "TestDataset");
        assert_eq!(ds.pool, "data-pool");

        let list: Vec<DatasetInfo> = ZpoolService::list_datasets("data-pool").await.unwrap();
        assert!(list.len() >= 2);

        let result: Result<()> = ZpoolService::destroy_dataset("data-pool", "TestDataset").await;
        assert!(result.is_ok());
    }
}
