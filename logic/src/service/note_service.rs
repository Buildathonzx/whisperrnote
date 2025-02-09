use crate::utils::encryption::{EncryptedNote, create_encrypted_note};
use ic_cdk::export::Principal;
use calimero_sdk::types::Error;
use crate::blockchain::{ProposalAction, ProposalParams};

pub struct NoteService {
    notes_canister: Principal,
    private_context: Principal,
}

impl NoteService {
    pub fn new(notes_canister: Principal, private_context: Principal) -> Self {
        Self {
            notes_canister,
            private_context,
        }
    }

    pub async fn create_note(
        &self,
        content: String,
        title: String,
        share_with: Option<Vec<String>>,
    ) -> Result<String, Error> {
        // Create encrypted note
        let encrypted_note = create_encrypted_note(&content, &title).await?;

        // Store note in ICP
        let note_id = ic_cdk::call(
            self.notes_canister,
            "create_note",
            (encrypted_note.content,)
        ).await?;

        // If sharing enabled, create proposal
        if let Some(recipients) = share_with {
            let action = ProposalAction {
                scope: "share_note".to_string(),
                params: ProposalParams {
                    receiver_id: Some(recipients[0].clone()),
                    method_name: Some("share_note".to_string()),
                    args: Some(note_id.clone()),
                    amount: None,
                    deposit: None,
                }
            };

            ic_cdk::call(
                self.private_context,
                "create_proposal",
                (action,)
            ).await?;
        }

        Ok(note_id)
    }

    pub async fn share_note(
        &self,
        note_id: String, 
        with_user: String
    ) -> Result<(), Error> {
        // Create share proposal
        let action = ProposalAction {
            scope: "share_note".to_string(),
            params: ProposalParams {
                receiver_id: Some(with_user),
                method_name: Some("share_note".to_string()),
                args: Some(note_id),
                amount: None,
                deposit: None,
            }
        };

        ic_cdk::call(
            self.private_context,
            "create_proposal",
            (action,)
        ).await?;

        Ok(())
    }

    pub async fn get_note(&self, note_id: String) -> Result<EncryptedNote, Error> {
        // Get note from ICP
        let note: EncryptedNote = ic_cdk::call(
            self.notes_canister,
            "get_note", 
            (note_id.clone(),)
        ).await?;

        // Check sharing context
        let shared_with: Vec<String> = ic_cdk::call(
            self.private_context,
            "get_shared_context",
            (note_id,)
        ).await?;

        if !shared_with.is_empty() {
            note.metadata.insert("shared_with".to_string(), shared_with);
        }

        Ok(note)
    }
}