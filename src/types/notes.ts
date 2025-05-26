// Core types based on schema.md
export interface User {
  _id: string;
  username: string;
  email: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
  settings: UserSettings;
  extensions: string[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  preferences: {
    autoSave: boolean;
    syncEnabled: boolean;
    showAnalytics: boolean;
    enableAI: boolean;
  };
}

export interface Notebook {
  _id: string;
  owner_id: string;
  title: string;
  description: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  shared_with: string[];
  is_encrypted: boolean;
  metadata: Record<string, any>;
}

export interface Note {
  _id: string;
  notebook_id?: string;
  owner_id: string;
  title: string;
  content: string;
  type: 'text' | 'scribble' | 'audio' | 'image' | 'file' | 'math';
  attachments: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  is_encrypted: boolean;
  shared_with: string[];
  ai_metadata: AIMetadata;
  extension_data: Record<string, any>;
  analytics: NoteAnalytics;
}

export interface AIMetadata {
  summary?: string;
  topics?: string[];
  sentiment?: string;
  readingTime?: number;
  keyPoints?: string[];
  suggestions?: string[];
}

export interface NoteAnalytics {
  view_count: number;
  last_accessed: string;
  edit_count: number;
  share_count: number;
  search_count?: number;
  export_count?: number;
  time_spent?: number;
}

export interface ToDo {
  _id: string;
  owner_id: string;
  title: string;
  description: string;
  due_date?: string;
  reminder?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  tags: string[];
  created_at: string;
  updated_at: string;
  is_encrypted: boolean;
  shared_with: string[];
  recurrence?: RecurrencePattern;
  linked_notes: string[];
  extension_data: Record<string, any>;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  days_of_week?: number[];
  end_date?: string;
  occurrences?: number;
}

export interface Sharing {
  _id: string;
  resource_id: string;
  resource_type: 'note' | 'notebook' | 'todo';
  shared_by: string;
  shared_with: string[];
  permission: 'view' | 'edit' | 'admin';
  created_at: string;
  expires_at?: string;
  is_public: boolean;
  access_link?: string;
  permissions: {
    can_edit: boolean;
    can_share: boolean;
    can_delete: boolean;
    can_comment?: boolean;
    can_download?: boolean;
  };
}

export interface Extension {
  _id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  is_enabled: boolean;
  settings: Record<string, any>;
  permissions: string[];
  install_date: string;
  update_date: string;
}

export interface Analytics {
  _id: string;
  user_id: string;
  resource_id: string;
  resource_type: 'note' | 'notebook' | 'todo';
  event_type: 'view' | 'edit' | 'share' | 'delete' | 'create' | 'export';
  event_data: Record<string, any>;
  timestamp: string;
  session_id: string;
  device_info?: {
    platform: string;
    browser: string;
    version: string;
  };
}

export interface FileAttachment {
  _id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  file_url: string;
  thumbnail_url?: string;
  uploaded_by: string;
  uploaded_at: string;
  is_encrypted: boolean;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  members: string[];
  created_at: string;
  updated_at: string;
  permissions: {
    can_invite: boolean;
    can_remove: boolean;
    can_edit_settings: boolean;
  };
}

// Legacy interfaces for backward compatibility
export interface NoteCollection extends Notebook {}

export interface ShareRequest {
  resource_id: string;
  resource_type: 'note' | 'notebook' | 'todo';
  recipient_email: string;
  permission: 'view' | 'edit' | 'admin';
  message?: string;
  expires_at?: string;
}

export interface EncryptedKeyShare {
  share_id: string;
  encrypted_key: string;
  recipient_id: string;
  note_id: string;
}

export interface NoteMetadata {
  word_count: number;
  character_count: number;
  estimated_reading_time: number;
  last_modified_by: string;
  version: number;
  checksum: string;
}
