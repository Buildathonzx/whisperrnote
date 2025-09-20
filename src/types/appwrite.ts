// Shim re-export of generated declaration types for runtime import compatibility
// Next.js webpack cannot import .d.ts at runtime. Keep this file minimal.
export type { Users, Notes, Tags, ApiKeys, Comments, Extensions, Reactions, Collaborators, ActivityLog, Settings } from './appwrite.d';
// Recreate enum-like objects at runtime for client usage
export enum Status { DRAFT = 'draft', PUBLISHED = 'published', ARCHIVED = 'archived' }
export enum TargetType { NOTE = 'note', COMMENT = 'comment' }
export enum Permission { READ = 'read', WRITE = 'write', ADMIN = 'admin' }

// Extended runtime-only types (not present in generated appwrite.d.ts)
// Lightweight interfaces so application code can be typed against new backend attributes
export interface NoteRevision {
  $id: string;
  noteId: string;
  revision: number;
  userId: string | null;
  createdAt: string;
  title: string | null;
  content: string | null;
  diff: string | null;
  diffFormat: 'json' | null;
  fullSnapshot: boolean | null;
  cause: string | null; // e.g. manual | ai | collab
}

export interface NoteTagPivot {
  $id: string;
  noteId: string;
  tagId: string | null; // may be null pre-migration
  tag: string | null;
  userId: string | null;
  createdAt: string | null;
}

export type SubscriptionPlan = 'free' | 'pro' | 'org';
export type SubscriptionStatus = 'active' | 'canceled' | 'trialing';

export interface Subscription {
  $id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  seats: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}
