import { Client, Account, Databases, Storage, Functions, ID, Query, Permission, Role } from 'appwrite';

// Centralized Appwrite client + exported service instances and env IDs.
// This isolates raw SDK usage from higher-level domain modules.

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

// Expose application public URI (for redirects, email templates, etc.)
export const APP_URI = process.env.NEXT_PUBLIC_APP_URI!;

// Database & Collection IDs
export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const APPWRITE_COLLECTION_ID_USERS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_USERS!;
export const APPWRITE_COLLECTION_ID_NOTES = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_NOTES!;
export const APPWRITE_COLLECTION_ID_TAGS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_TAGS!;
export const APPWRITE_COLLECTION_ID_APIKEYS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_APIKEYS!;
export const APPWRITE_COLLECTION_ID_COMMENTS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_COMMENTS!;
export const APPWRITE_COLLECTION_ID_EXTENSIONS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_EXTENSIONS!;
export const APPWRITE_COLLECTION_ID_REACTIONS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_REACTIONS!;
export const APPWRITE_COLLECTION_ID_COLLABORATORS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_COLLABORATORS!;
export const APPWRITE_COLLECTION_ID_ACTIVITYLOG = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_ACTIVITYLOG!;
export const APPWRITE_COLLECTION_ID_SETTINGS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SETTINGS!;
export const APPWRITE_COLLECTION_ID_SUBSCRIPTIONS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SUBSCRIPTIONS!;

// Buckets
export const APPWRITE_BUCKET_PROFILE_PICTURES = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_PICTURES!;
export const APPWRITE_BUCKET_NOTES_ATTACHMENTS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_NOTES_ATTACHMENTS!;
export const APPWRITE_BUCKET_EXTENSION_ASSETS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_EXTENSION_ASSETS!;
export const APPWRITE_BUCKET_BACKUPS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_BACKUPS!;
export const APPWRITE_BUCKET_TEMP_UPLOADS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_TEMP_UPLOADS!;

export {
  client,
  account,
  databases,
  storage,
  functions,
  ID,
  Query,
  Permission,
  Role,
};
