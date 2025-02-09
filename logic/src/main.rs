use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_sdk::env::ext::{AccountId, ProposalId};
use calimero_sdk::serde::{Deserialize, Serialize};
use calimero_sdk::types::Error;
use calimero_sdk::{app, env};
use calimero_storage::collections::{UnorderedMap, Vector};
use ic_cdk::export::{candid::{CandidType, Deserialize as CandidDeserialize}, Principal};
use std::collections::HashMap;
use serde_json;

#[app::state(emits = Event)]
#[derive(Debug, PartialEq, PartialOrd, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct AppState {
    messages: UnorderedMap<ProposalId, Vector<Message>>,
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

#[app::event]
pub enum Event {
    ProposalCreated { id: ProposalId },
    ApprovedProposal { id: ProposalId },
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "calimero_sdk::serde")]
pub struct CreateProposalRequest {
    pub action_type: String,
    pub params: serde_json::Value,
}

#[derive(CandidType, CandidDeserialize, Clone)]
pub struct Note {
    id: String,
    encrypted_content: Vec<u8>,
    encrypted_key: Vec<u8>,
    iv: Vec<u8>,
    owner_id: Principal,
    shared_with: Vec<Principal>,
    metadata: NoteMetadata,
    version: u64,
}

#[derive(CandidType, CandidDeserialize, Clone)]
pub struct NoteMetadata {
    title: String,
    tags: Vec<String>,
    created_at: u64,
    updated_at: u64,
}

#[derive(CandidType, CandidDeserialize)]
pub struct ShareRequest {
    note_id: String,
    recipient: Principal,
    encrypted_key_share: Vec<u8>,
}

thread_local! {
    static NOTES: std::cell::RefCell<HashMap<String, Note>> = std::cell::RefCell::new(HashMap::new());
    static USER_NOTES: std::cell::RefCell<HashMap<Principal, Vec<String>>> = std::cell::RefCell::new(HashMap::new());
}

#[ic_cdk::update]
fn create_note(note: Note) -> String {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous principals cannot create notes");
    }

    let note_id = note.id.clone();
    
    NOTES.with(|notes| {
        notes.borrow_mut().insert(note_id.clone(), note);
    });

    USER_NOTES.with(|user_notes| {
        user_notes
            .borrow_mut()
            .entry(caller)
            .or_insert_with(Vec::new)
            .push(note_id.clone());
    });

    note_id
}

#[ic_cdk::query]
fn get_note(note_id: String) -> Option<Note> {
    let caller = ic_cdk::caller();
    
    NOTES.with(|notes| {
        notes.borrow().get(&note_id).and_then(|note| {
            if note.owner_id == caller || note.shared_with.contains(&caller) {
                Some(note.clone())
            } else {
                None
            }
        })
    })
}

#[ic_cdk::update]
fn share_note(request: ShareRequest) {
    let caller = ic_cdk::caller();
    
    NOTES.with(|notes| {
        let mut notes = notes.borrow_mut();
        if let Some(note) = notes.get_mut(&request.note_id) {
            if note.owner_id != caller {
                ic_cdk::trap("Only the note owner can share notes");
            }
            
            if !note.shared_with.contains(&request.recipient) {
                note.shared_with.push(request.recipient);
                // Store encrypted key share for recipient
                // TODO: Implement key share storage
            }
        }
    });
}

#[ic_cdk::query]
fn list_notes() -> Vec<Note> {
    let caller = ic_cdk::caller();
    
    USER_NOTES.with(|user_notes| {
        if let Some(note_ids) = user_notes.borrow().get(&caller) {
            NOTES.with(|notes| {
                let notes = notes.borrow();
                note_ids
                    .iter()
                    .filter_map(|id| notes.get(id))
                    .cloned()
                    .collect()
            })
        } else {
            Vec::new()
        }
    })
}

#[ic_cdk::update]
fn update_note(note_id: String, encrypted_content: Vec<u8>, new_metadata: Option<NoteMetadata>) {
    let caller = ic_cdk::caller();
    
    NOTES.with(|notes| {
        let mut notes = notes.borrow_mut();
        if let Some(note) = notes.get_mut(&note_id) {
            if note.owner_id != caller && !note.shared_with.contains(&caller) {
                ic_cdk::trap("Unauthorized to update this note");
            }
            
            note.encrypted_content = encrypted_content;
            if let Some(metadata) = new_metadata {
                note.metadata = metadata;
            }
            note.version += 1;
            note.metadata.updated_at = ic_cdk::api::time();
        }
    });
}

#[ic_cdk::update]
fn delete_note(note_id: String) {
    let caller = ic_cdk::caller();
    
    NOTES.with(|notes| {
        let mut notes = notes.borrow_mut();
        if let Some(note) = notes.get(&note_id) {
            if note.owner_id != caller {
                ic_cdk::trap("Only the note owner can delete notes");
            }
            notes.remove(&note_id);
        }
    });

    USER_NOTES.with(|user_notes| {
        if let Some(user_note_ids) = user_notes.borrow_mut().get_mut(&caller) {
            user_note_ids.retain(|id| id != &note_id);
        }
    });
}

#[app::logic]
impl AppState {
    #[app::init]
    pub fn init() -> AppState {
        AppState {
            messages: UnorderedMap::new(),
        }
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
}
