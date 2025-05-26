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
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  end_date?: string;
  days_of_week?: number[];
  day_of_month?: number;
}

export interface Sharing {
  _id: string;
  resource_id: string;
  resource_type: 'note' | 'todo' | 'notebook';
  shared_by: string;
  shared_with: string;
  permission: 'read' | 'write' | 'admin';
  created_at: string;
  expires_at?: string;
}

export interface Extension {
  _id: string;
  name: string;
  description: string;
  type: 'ai' | 'analytics' | 'theme' | 'integration';
  config_schema: Record<string, any>;
  enabled_by_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  _id: string;
  user_id: string;
  resource_id: string;
  resource_type: 'note' | 'todo' | 'notebook';
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
}

export interface FileAttachment {
  _id: string;
  owner_id: string;
  file_url: string;
  file_type: string;
  created_at: string;
  linked_resource: string;
}

export interface Group {
  _id: string;
  name: string;
  owner_id: string;
  members: string[];
  created_at: string;
}

// Legacy interfaces for backward compatibility
export interface NoteCollection extends Notebook {}

export interface ShareRequest {
  noteId: string;
  recipientEmail: string;
  permission: 'read' | 'write';
  message?: string;
}

export interface EncryptedKeyShare {
  noteId: string;
  recipientId: string;
  encryptedKey: string;
  keyVersion: number;
}

export interface NoteMetadata {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  lastModified: string;
  version: number;
}
