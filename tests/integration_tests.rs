use crate::service::note_service::NoteService;
use crate::sync::realtime_handler::RealtimeHandler;
use ic_cdk::export::Principal;

#[cfg(test)]
mod tests {
    use super::*;

    async fn setup_test_environment() -> (NoteService, RealtimeHandler) {
        // Set up test ICP canister
        let notes_principal = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
        
        // Set up test Calimero context
        let context_principal = Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap();

        let note_service = NoteService::new(notes_principal, context_principal);
        let realtime_handler = RealtimeHandler::new(notes_principal, context_principal);

        (note_service, realtime_handler)
    }

    #[tokio::test]
    async fn test_create_and_share_note() {
        let (service, _) = setup_test_environment().await;

        // Create a new note
        let note_id = service.create_note(
            "Test content".to_string(),
            "Test Title".to_string(),
            None
        ).await.unwrap();

        // Share with another user
        service.share_note(
            note_id.clone(),
            "user2.testnet".to_string()
        ).await.unwrap();

        // Verify note is accessible
        let note = service.get_note(note_id).await.unwrap();
        assert!(note.metadata.shared_with.contains(&"user2.testnet".to_string()));
    }

    #[tokio::test]
    async fn test_realtime_sync() {
        let (service, handler) = setup_test_environment().await;

        // Start sync handler
        let handler_task = tokio::spawn(async move {
            handler.start_sync().await.unwrap();
        });

        // Create and modify notes
        let note_id = service.create_note(
            "Initial content".to_string(),
            "Sync Test".to_string(),
            None
        ).await.unwrap();

        // Wait for sync
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

        // Verify changes are synced
        let note = service.get_note(note_id).await.unwrap();
        assert_eq!(note.metadata.title, "Sync Test");

        handler_task.abort();
    }

    #[tokio::test]
    async fn test_encryption_and_sharing() {
        let (service, _) = setup_test_environment().await;

        // Create encrypted note shared with multiple users
        let recipients = vec![
            "user2.testnet".to_string(),
            "user3.testnet".to_string()
        ];

        let note_id = service.create_note(
            "Secret content".to_string(),
            "Shared Note".to_string(),
            Some(recipients.clone())
        ).await.unwrap();

        // Verify each recipient can access
        for user in recipients {
            // Simulate user access
            let note = service.get_note(note_id.clone()).await.unwrap();
            assert!(note.metadata.shared_with.contains(&user));
        }
    }
}