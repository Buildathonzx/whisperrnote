use ic_cdk::*;
use ic_cdk::export::candid;
use serde::{Deserialize, Serialize};

#[derive(candid::CandidType, Serialize, Deserialize, Clone)]
struct Note {
    id: String,
    title: String,
    content: String,
    owner: String,
    shared_with: Vec<String>,
    created_at: u64,
    updated_at: u64,
    encrypted: bool,
}

#[derive(candid::CandidType, Serialize, Deserialize)]
struct NoteUpdateRequest {
    id: String,
    title: Option<String>,
    content: Option<String>,
    shared_with: Option<Vec<String>>,
}

static mut NOTES: Option<std::collections::HashMap<String, Note>> = None;

#[init]
fn init() {
    unsafe {
        NOTES = Some(std::collections::HashMap::new());
    }
}

#[update]
fn create_note(title: String, content: String, encrypted: bool) -> String {
    let id = ic_cdk::api::caller().to_string();
    let timestamp = ic_cdk::api::time();
    
    let note = Note {
        id: id.clone(),
        title,
        content,
        owner: id,
        shared_with: Vec::new(),
        created_at: timestamp,
        updated_at: timestamp,
        encrypted,
    };

    unsafe {
        if let Some(ref mut notes) = NOTES {
            notes.insert(note.id.clone(), note);
        }
    }

    id
}

#[update]
fn update_note(request: NoteUpdateRequest) -> Result<(), String> {
    unsafe {
        if let Some(ref mut notes) = NOTES {
            if let Some(note) = notes.get_mut(&request.id) {
                if note.owner != ic_cdk::api::caller().to_string() {
                    return Err("Unauthorized".to_string());
                }

                if let Some(title) = request.title {
                    note.title = title;
                }
                if let Some(content) = request.content {
                    note.content = content;
                }
                if let Some(shared_with) = request.shared_with {
                    note.shared_with = shared_with;
                }
                note.updated_at = ic_cdk::api::time();
                Ok(())
            } else {
                Err("Note not found".to_string())
            }
        } else {
            Err("Storage not initialized".to_string())
        }
    }
}

#[query]
fn get_note(id: String) -> Result<Note, String> {
    let caller = ic_cdk::api::caller().to_string();
    
    unsafe {
        if let Some(ref notes) = NOTES {
            if let Some(note) = notes.get(&id) {
                if note.owner == caller || note.shared_with.contains(&caller) {
                    Ok(note.clone())
                } else {
                    Err("Unauthorized".to_string())
                }
            } else {
                Err("Note not found".to_string())
            }
        } else {
            Err("Storage not initialized".to_string())
        }
    }
}

#[pre_upgrade]
fn pre_upgrade() {
    // Add state preservation logic
}

#[post_upgrade]
fn post_upgrade() {
    // Add state restoration logic
}

// Export Candid interface
ic_cdk::export_candid!();