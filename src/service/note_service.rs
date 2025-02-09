use crate::utils::encryption::{EncryptedNote, create_encrypted_note};
use ic_cdk::export::Principal;
use calimero_sdk::types::Error;

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
        // Create encrypted note with optional sharing
        let recipients = share_with.unwrap_or_default();
        let encrypted_note = create_encrypted_note(&content, &title, &recipients).await?;

        // Store main note data in ICP
        let note_id = ic_cdk::call(
            self.notes_canister,
            "create_note",
            (title, encrypted_note.content, true)
        ).await?;

        // If sharing enabled, set up private context in Calimero
        if let Some(context_id) = encrypted_note.metadata.context_id {
            ic_cdk::call(
                self.private_context,
                "create_shared_context",
                (recipients, encrypted_note.key_shares)
            ).await?;
        }

        Ok(note_id)
    }

    pub async fn share_note(
        &self,
        note_id: String,
        with_user: String
    ) -> Result<(), Error> {
        // Get note from ICP
        let note = ic_cdk::call(
            self.notes_canister,
            "get_note",
            (note_id.clone(),)
        ).await?;

        // Generate new key share for user
        let encrypted_key = generate_key_share_for_user(&with_user)?;

        // Update sharing in Calimero
        ic_cdk::call(
            self.private_context,
            "share_note",
            (note_id, with_user, encrypted_key)
        ).await?;

        Ok(())
    }

    pub async fn get_note(&self, note_id: String) -> Result<EncryptedNote, Error> {
        // Fetch from both ICP and Calimero in parallel
        let (note, context) = futures::join!(
            ic_cdk::call(self.notes_canister, "get_note", (note_id.clone(),)),
            ic_cdk::call(self.private_context, "get_shared_context", (note_id,))
        );

        // Combine results
        create_decrypted_note(note?, context?).await
    }
}

fn generate_key_share_for_user(user: &str) -> Result<String, Error> {
    // Implementation for generating new key share
    todo!()
}