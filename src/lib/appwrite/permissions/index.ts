/**
 * Main permissions index file
 * Re-exports all permission utilities from dedicated files
 */

// Note permissions
export * from './notes';

// Extension permissions  
export * from './extensions';

// Common permission utilities
export { Permission, Role } from 'appwrite';