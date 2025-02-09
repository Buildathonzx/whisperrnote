use ic_cdk::export::Principal;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct CanisterConfig {
    pub notes_canister: Principal,
    pub context_canister: Principal,
    pub sync_enabled: bool,
    pub encryption_settings: EncryptionSettings,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct EncryptionSettings {
    pub key_size: usize,
    pub min_shares: usize,
    pub total_shares: usize,
}

impl Default for CanisterConfig {
    fn default() -> Self {
        Self {
            notes_canister: Principal::anonymous(),
            context_canister: Principal::anonymous(),
            sync_enabled: true,
            encryption_settings: EncryptionSettings {
                key_size: 256,
                min_shares: 2,
                total_shares: 5,
            },
        }
    }
}

impl CanisterConfig {
    pub fn new(notes: Principal, context: Principal) -> Self {
        Self {
            notes_canister: notes,
            context_canister: context,
            ..Default::default()
        }
    }

    pub fn with_encryption_settings(mut self, settings: EncryptionSettings) -> Self {
        self.encryption_settings = settings;
        self
    }

    pub fn disable_sync(mut self) -> Self {
        self.sync_enabled = false;
        self
    }
}