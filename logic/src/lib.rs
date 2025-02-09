use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_sdk::env::ext::{AccountId, ProposalId};
use calimero_sdk::serde::{Deserialize, Serialize};
use calimero_sdk::types::Error;
use calimero_sdk::{app, env};
use calimero_storage::collections::{UnorderedMap, Vector};
use std::cmp::Ordering;

#[app::state(emits = Event)]
#[derive(Debug, PartialEq, PartialOrd, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct AppState {
    messages: UnorderedMap<ProposalId, Vector<Message>>,
    notes: UnorderedMap<String, EncryptedNote>,
    user_permissions: UnorderedMap<String, Vec<String>>,
    version_history: UnorderedMap<String, Vector<NoteVersion>>,
}

#[derive(
    Clone, Debug, PartialEq, PartialOrd, BorshSerialize, BorshDeserialize, Serialize, Deserialize,
)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct Message {
    id: String,
    proposal_id: String,
    author: String,
    text: String,
    created_at: String,
}

#[derive(Clone, Debug, PartialEq, PartialOrd, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct EncryptedNote {
    id: String,
    encrypted_content: Vec<u8>,
    metadata: NoteMetadata,
    owner: String,
    shared_with: Vec<String>,
    created_at: u64,
    updated_at: u64,
}

#[derive(Clone, Debug, PartialEq, PartialOrd, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct NoteMetadata {
    title: String,
    tags: Vec<String>,
    is_pinned: bool,
    encryption_version: u32,
}

#[derive(Clone, Debug, PartialEq, PartialOrd, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct NoteVersion {
    version_id: String,
    encrypted_content: Vec<u8>,
    metadata: NoteMetadata,
    timestamp: u64,
}

#[app::event]
pub enum Event {
    ProposalCreated { id: ProposalId },
    ApprovedProposal { id: ProposalId },
    NoteCreated { id: String },
    NoteUpdated { id: String },
    NoteShared { id: String, with: String },
    NoteDeleted { id: String },
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "calimero_sdk::serde")]
pub struct CreateProposalRequest {
    pub action_type: String,
    pub params: serde_json::Value,
}

impl CreateProposalRequest {
    pub fn new_note_action(note: EncryptedNote) -> Self {
        CreateProposalRequest {
            action_type: "CreateNote".to_string(),
            params: serde_json::json!({
                "note": note
            })
        }
    }

    pub fn new_share_action(note_id: String, recipient: String) -> Self {
        CreateProposalRequest {
            action_type: "ShareNote".to_string(),
            params: serde_json::json!({
                "note_id": note_id,
                "recipient": recipient
            })
        }
    }
}

#[app::logic]
impl AppState {
    #[app::init]
    pub fn init() -> AppState {
        AppState {
            messages: UnorderedMap::new(),
            notes: UnorderedMap::new(),
            user_permissions: UnorderedMap::new(),
            version_history: UnorderedMap::new(),
        }
    }

    // Add this helper function
    fn get_timestamp() -> u64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    }

    pub fn create_new_proposal(
        &mut self,
        request: CreateProposalRequest,
    ) -> Result<ProposalId, Error> {
        env::log("Starting create_new_proposal");
        env::log(&format!("Request type: {}", request.action_type));

        let proposal_id = match request.action_type.as_str() {
            "ExternalFunctionCall" => {
                env::log("Processing ExternalFunctionCall");
                let receiver_id = request.params["receiver_id"]
                    .as_str()
                    .ok_or_else(|| Error::msg("receiver_id is required"))?;
                let method_name = request.params["method_name"]
                    .as_str()
                    .ok_or_else(|| Error::msg("method_name is required"))?;
                let args = request.params["args"]
                    .as_str()
                    .ok_or_else(|| Error::msg("args is required"))?;
                let deposit = request.params["deposit"]
                    .as_str()
                    .ok_or_else(|| Error::msg("deposit is required"))?
                    .parse::<u128>()?;

                env::log(&format!(
                    "Parsed values: receiver_id={}, method_name={}, args={}, deposit={}",
                    receiver_id, method_name, args, deposit
                ));

                Self::external()
                    .propose()
                    .external_function_call(
                        receiver_id.to_string(),
                        method_name.to_string(),
                        args.to_string(),
                        deposit,
                    )
                    .send()
            }
            "Transfer" => {
                env::log("Processing Transfer");
                let receiver_id = request.params["receiver_id"]
                    .as_str()
                    .ok_or_else(|| Error::msg("receiver_id is required"))?;
                let amount = request.params["amount"]
                    .as_str()
                    .ok_or_else(|| Error::msg("amount is required"))?
                    .parse::<u128>()?;

                Self::external()
                    .propose()
                    .transfer(AccountId(receiver_id.to_string()), amount)
                    .send()
            }
            "SetContextValue" => {
                env::log("Processing SetContextValue");
                let key = request.params["key"]
                    .as_str()
                    .ok_or_else(|| Error::msg("key is required"))?
                    .as_bytes()
                    .to_vec()
                    .into_boxed_slice();
                let value = request.params["value"]
                    .as_str()
                    .ok_or_else(|| Error::msg("value is required"))?
                    .as_bytes()
                    .to_vec()
                    .into_boxed_slice();

                Self::external()
                    .propose()
                    .set_context_value(key, value)
                    .send()
            }
            "SetNumApprovals" => Self::external()
                .propose()
                .set_num_approvals(
                    request.params["num_approvals"]
                        .as_u64()
                        .ok_or(Error::msg("num_approvals is required"))? as u32,
                )
                .send(),
            "SetActiveProposalsLimit" => Self::external()
                .propose()
                .set_active_proposals_limit(
                    request.params["active_proposals_limit"]
                        .as_u64()
                        .ok_or(Error::msg("active_proposals_limit is required"))?
                        as u32,
                )
                .send(),
            "DeleteProposal" => Self::external()
                .propose()
                .delete(ProposalId(
                    hex::decode(
                        request.params["proposal_id"]
                            .as_str()
                            .ok_or_else(|| Error::msg("proposal_id is required"))?,
                    )?
                    .try_into()
                    .map_err(|_| Error::msg("Invalid proposal ID length"))?,
                ))
                .send(),
            "CreateNote" => {
                let note: EncryptedNote = serde_json::from_value(request.params["note"].clone())
                    .map_err(|_| Error::msg("invalid note data"))?;
                
                Self::external()
                    .propose()
                    .external_function_call(
                        "note_storage".to_string(),
                        "store_note".to_string(),
                        serde_json::to_string(&note).unwrap(),
                        0,
                    )
                    .send()
            },
            
            "ShareNote" => {
                let note_id = request.params["note_id"]
                    .as_str()
                    .ok_or_else(|| Error::msg("note_id is required"))?;
                let recipient = request.params["recipient"]
                    .as_str()
                    .ok_or_else(|| Error::msg("recipient is required"))?;

                Self::external()
                    .propose()
                    .external_function_call(
                        "note_storage".to_string(),
                        "share_note".to_string(),
                        serde_json::to_string(&(note_id, recipient)).unwrap(),
                        0,
                    )
                    .send()
            },
            _ => return Err(Error::msg("Invalid action type")),
        };

        env::emit(&Event::ProposalCreated { id: proposal_id });

        let old = self.messages.insert(proposal_id, Vector::new())?;
        if old.is_some() {
            return Err(Error::msg("proposal already exists"));
        }

        Ok(proposal_id)
    }

    pub fn approve_proposal(&self, proposal_id: ProposalId) -> Result<(), Error> {
        // fixme: should we need to check this?
        // self.messages
        //     .get(&proposal_id)?
        //     .ok_or(Error::msg("proposal not found"))?;

        Self::external().approve(proposal_id);

        env::emit(&Event::ApprovedProposal { id: proposal_id });

        Ok(())
    }

    pub fn get_proposal_messages(&self, proposal_id: ProposalId) -> Result<Vec<Message>, Error> {
        let Some(msgs) = self.messages.get(&proposal_id)? else {
            return Ok(vec![]);
        };

        let entries = msgs.entries()?;

        Ok(entries.collect())
    }

    pub fn send_proposal_messages(
        &mut self,
        proposal_id: ProposalId,
        message: Message,
    ) -> Result<(), Error> {
        let mut messages = self.messages.get(&proposal_id)?.unwrap_or_default();

        messages.push(message)?;

        self.messages.insert(proposal_id, messages)?;

        Ok(())
    }

    pub fn create_note(&mut self, note: EncryptedNote) -> Result<(), Error> {
        if self.notes.get(&note.id)?.is_some() {
            return Err(Error::msg("note already exists"));
        }

        self.notes.insert(note.id.clone(), note.clone())?;
        self.version_history.insert(note.id.clone(), Vector::new())?;
        
        env::emit(&Event::NoteCreated { id: note.id });
        Ok(())
    }

    pub fn update_note(&mut self, id: String, content: Vec<u8>, metadata: Option<NoteMetadata>) -> Result<(), Error> {
        let mut note = self.notes.get(&id)?.ok_or(Error::msg("note not found"))?;
        let mut versions = self.version_history.get(&id)?.unwrap_or_default();

        let timestamp = Self::get_timestamp();
        
        // Create version from current state
        let version = NoteVersion {
            version_id: format!("{}_{}", id, timestamp),
            encrypted_content: note.encrypted_content.clone(),
            metadata: note.metadata.clone(),
            timestamp,
        };
        versions.push(version)?;

        // Update note
        note.encrypted_content = content;
        if let Some(meta) = metadata {
            note.metadata = meta;
        }
        note.updated_at = timestamp;

        self.notes.insert(id.clone(), note)?;
        self.version_history.insert(id.clone(), versions)?;

        env::emit(&Event::NoteUpdated { id });
        Ok(())
    }

    pub fn share_note(&mut self, id: String, with_account: String) -> Result<(), Error> {
        let mut note = self.notes.get(&id)?.ok_or(Error::msg("note not found"))?;
        
        if note.shared_with.contains(&with_account) {
            return Err(Error::msg("note already shared with this account"));
        }

        note.shared_with.push(with_account.clone());
        self.notes.insert(id.clone(), note)?;

        // Update permissions
        let mut permissions = self.user_permissions.get(&with_account)?.unwrap_or_default();
        permissions.push(id.clone());
        self.user_permissions.insert(with_account.clone(), permissions)?;

        env::emit(&Event::NoteShared { id, with: with_account });
        Ok(())
    }

    pub fn delete_note(&mut self, id: String) -> Result<(), Error> {
        let note = self.notes.get(&id)?.ok_or(Error::msg("note not found"))?;
        
        // Remove from all shared users' permissions
        for user in note.shared_with.iter() {
            if let Some(mut permissions) = self.user_permissions.get(user)? {
                permissions.retain(|x| x != &id);
                self.user_permissions.insert(user.to_string(), permissions)?;
            }
        }

        self.notes.remove(&id)?;
        self.version_history.remove(&id)?;

        env::emit(&Event::NoteDeleted { id });
        Ok(())
    }

    pub fn list_user_notes(&self, user: String) -> Result<Vec<String>, Error> {
        Ok(self.user_permissions.get(&user)?.unwrap_or_default())
    }

    pub fn get_note_versions(&self, id: String) -> Result<Vec<NoteVersion>, Error> {
        let versions = self.version_history.get(&id)?.ok_or(Error::msg("note not found"))?;
        let entries = versions.entries()?;
        Ok(entries.collect())
    }
}
