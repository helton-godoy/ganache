use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct ConfigChange {
    pub id: String,
    pub timestamp: String,
    pub user: String,
    pub action: String,
    pub resource: String,
    pub details: Option<String>,
}
