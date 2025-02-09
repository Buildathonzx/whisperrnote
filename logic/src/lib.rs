use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_sdk::env::ext::{AccountId, ProposalId};
use calimero_sdk::serde::{Deserialize, Serialize};
use calimero_sdk::types::Error;
use calimero_sdk::{app, env};
use calimero_storage::collections::{UnorderedMap, Vector};

#[app::state(emits = Event)]
#[derive(Debug, PartialEq, PartialOrd, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct AppState {
    private_notes: UnorderedMap<String, Vector<PrivateNote>>,
    shared_contexts: UnorderedMap<String, SharedContext>,
}

#[derive(Clone, Debug, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct PrivateNote {
    id: String,
    owner_id: String,
    content: String,
    encrypted_key: String,
    created_at: u64,
    updated_at: u64,
}

#[derive(Clone, Debug, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct SharedContext {
    context_id: String,
    owner_id: String,
    shared_with: Vec<String>,
    encryption_keys: Vec<String>,
}

#[app::event]
pub enum Event {
    NoteCreated { id: String },
    NoteShared { id: String, with: String },
    ContextCreated { id: String },
}

#[app::logic]
impl AppState {
    #[app::init]
    pub fn init() -> AppState {
        AppState {
            private_notes: UnorderedMap::new(),
            shared_contexts: UnorderedMap::new(),
        }
    }

    pub fn create_private_note(&mut self, content: String, encrypted_key: String) -> Result<String, Error> {
        let note_id = env::random_seed().to_vec().into_iter().map(|b| format!("{:02x}", b)).collect();
        let owner_id = env::signer_account_id().to_string();
        
        let note = PrivateNote {
            id: note_id.clone(),
            owner_id: owner_id.clone(),
            content,
            encrypted_key,
            created_at: env::block_timestamp(),
            updated_at: env::block_timestamp(),
        };

        let mut notes = self.private_notes.get(&owner_id)?.unwrap_or_default();
        notes.push(note)?;
        self.private_notes.insert(owner_id, notes)?;

        env::emit(&Event::NoteCreated { id: note_id.clone() });
        
        Ok(note_id)
    }

    pub fn create_shared_context(&mut self, shared_with: Vec<String>, encryption_keys: Vec<String>) -> Result<String, Error> {
        let context_id = env::random_seed().to_vec().into_iter().map(|b| format!("{:02x}", b)).collect();
        let owner_id = env::signer_account_id().to_string();

        let context = SharedContext {
            context_id: context_id.clone(),
            owner_id,
            shared_with,
            encryption_keys,
        };

        self.shared_contexts.insert(context_id.clone(), context)?;
        env::emit(&Event::ContextCreated { id: context_id.clone() });

        Ok(context_id)
    }

    pub fn share_note(&mut self, note_id: String, with_account: String, encrypted_key: String) -> Result<(), Error> {
        let owner_id = env::signer_account_id().to_string();
        let mut notes = self.private_notes.get(&owner_id)?.ok_or(Error::msg("No notes found"))?;
        
        let note_index = notes.entries()?.position(|note| note.id == note_id)
            .ok_or(Error::msg("Note not found"))?;
        
        // Create or update shared context
        let context_id = format!("{}:{}", note_id, with_account);
        let context = SharedContext {
            context_id: context_id.clone(),
            owner_id: owner_id.clone(),
            shared_with: vec![with_account.clone()],
            encryption_keys: vec![encrypted_key],
        };
        
        self.shared_contexts.insert(context_id, context)?;
        env::emit(&Event::NoteShared { id: note_id, with: with_account });
        
        Ok(())
    }
}