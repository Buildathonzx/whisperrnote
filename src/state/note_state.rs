use std::collections::HashMap;
use ic_cdk::export::candid::Principal;
use calimero_sdk::types::Error;

#[derive(Debug, Clone)]
pub struct NoteState {
    // Track note versions across ICP and Calimero
    version_map: HashMap<String, NoteVersion>,
    // Track pending sync operations
    pending_syncs: HashMap<String, SyncOperation>,
}

#[derive(Debug, Clone)]
struct NoteVersion {
    icp_version: u64,
    calimero_version: u64,
    last_sync: u64,
}

#[derive(Debug, Clone)]
enum SyncOperation {
    ICPToCalimero {
        note_id: String,
        content: Vec<u8>,
        timestamp: u64,
    },
    CalimeroToICP {
        note_id: String,
        context_id: String,
        timestamp: u64,
    },
}

impl NoteState {
    pub fn new() -> Self {
        Self {
            version_map: HashMap::new(),
            pending_syncs: HashMap::new(),
        }
    }

    pub fn register_icp_update(&mut self, note_id: &str, timestamp: u64) -> Result<(), Error> {
        let version = self.version_map.entry(note_id.to_string())
            .or_insert(NoteVersion {
                icp_version: 0,
                calimero_version: 0,
                last_sync: 0,
            });
        
        version.icp_version = timestamp;
        self.schedule_sync(note_id, timestamp)
    }

    pub fn register_calimero_update(&mut self, note_id: &str, timestamp: u64) -> Result<(), Error> {
        let version = self.version_map.entry(note_id.to_string())
            .or_insert(NoteVersion {
                icp_version: 0,
                calimero_version: 0,
                last_sync: 0,
            });
        
        version.calimero_version = timestamp;
        self.schedule_sync(note_id, timestamp)
    }

    fn schedule_sync(&mut self, note_id: &str, timestamp: u64) -> Result<(), Error> {
        let version = self.version_map.get(note_id)
            .ok_or_else(|| Error::msg("Version not found"))?;

        if version.icp_version > version.calimero_version {
            self.pending_syncs.insert(
                note_id.to_string(),
                SyncOperation::ICPToCalimero {
                    note_id: note_id.to_string(),
                    content: vec![],  // Will be populated during sync
                    timestamp,
                },
            );
        } else if version.calimero_version > version.icp_version {
            self.pending_syncs.insert(
                note_id.to_string(),
                SyncOperation::CalimeroToICP {
                    note_id: note_id.to_string(),
                    context_id: "".to_string(),  // Will be populated during sync
                    timestamp,
                },
            );
        }

        Ok(())
    }

    pub fn get_pending_syncs(&self) -> Vec<&SyncOperation> {
        self.pending_syncs.values().collect()
    }

    pub fn mark_sync_complete(&mut self, note_id: &str, timestamp: u64) {
        if let Some(version) = self.version_map.get_mut(note_id) {
            version.last_sync = timestamp;
            version.icp_version = timestamp;
            version.calimero_version = timestamp;
        }
        self.pending_syncs.remove(note_id);
    }
}