// Shim re-export of generated declaration types for runtime import compatibility
// Next.js webpack cannot import .d.ts at runtime. Keep this file minimal.
export type { Users, Notes, Tags, ApiKeys, Comments, Extensions, Reactions, Collaborators, ActivityLog, Settings } from './appwrite.d';
// Recreate enum-like objects at runtime for client usage
export enum Status { DRAFT = 'draft', PUBLISHED = 'published', ARCHIVED = 'archived' }
export enum TargetType { NOTE = 'note', COMMENT = 'comment' }
export enum Permission { READ = 'read', WRITE = 'write', ADMIN = 'admin' }

