/**
 * Permissions utilities for managing extension access control
 * Handles public/private extensions and sharing functionality
 */

import { Permission, Role } from 'appwrite';
import { getCurrentUser, tablesDB, APPWRITE_DATABASE_ID, APPWRITE_TABLE_ID_EXTENSIONS } from '../../appwrite';
import type { Extensions } from '@/types/appwrite';

/**
 * Permission levels for extensions
 */
export enum ExtensionPermission {
  PRIVATE = 'private',
  PUBLIC = 'public'
}

/**
 * Check if an extension is publicly accessible
 */
export function isExtensionPublic(extension: Extensions): boolean {
  return extension.isPublic === true;
}

/**
 * Check if current user owns an extension
 */
export async function isExtensionOwner(extension: Extensions): Promise<boolean> {
  const currentUser = await getCurrentUser();
  return currentUser ? currentUser.$id === extension.authorId : false;
}

/**
 * Check if current user can read an extension
 * Public extensions can be read by anyone
 * Private extensions can only be read by the owner
 */
export async function canReadExtension(extension: Extensions): Promise<boolean> {
  // Public extensions are readable by everyone
  if (isExtensionPublic(extension)) {
    return true;
  }
  
  // Private extensions are only readable by the owner
  return await isExtensionOwner(extension);
}

/**
 * Check if current user can edit an extension
 * Only the owner can edit extensions
 */
export async function canEditExtension(extension: Extensions): Promise<boolean> {
  return await isExtensionOwner(extension);
}

/**
 * Check if current user can delete an extension
 * Only the owner can delete extensions
 */
export async function canDeleteExtension(extension: Extensions): Promise<boolean> {
  return await isExtensionOwner(extension);
}

/**
 * Get the appropriate Appwrite permissions for an extension based on its visibility
 */
export function getExtensionPermissions(isPublic: boolean, authorId: string): string[] {
  const permissions = [
    // Owner has full access
    Permission.read(Role.user(authorId)),
    Permission.update(Role.user(authorId)),
    Permission.delete(Role.user(authorId))
  ];

  // If public, add read permission for everyone
  if (isPublic) {
    permissions.push(Permission.read(Role.any()));
  }

  return permissions;
}

/**
 * Generate shareable URL for a public extension
 */
export function getExtensionShareableUrl(extensionId: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URI || 'http://localhost:3001';
  
  return `${baseUrl}/extensions/shared/${extensionId}`;
}

/**
 * Validate extension access for public sharing
 * Returns the extension if accessible, null if not found or not accessible
 */
export async function validatePublicExtensionAccess(extensionId: string): Promise<Extensions | null> {
  try {
    console.log('Attempting to access public extension:', extensionId);
    
    // Use standard client to access public extensions
    const extension = await tablesDB.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_EXTENSIONS,
      rowId: extensionId
    }) as unknown as Extensions;

    console.log('Successfully retrieved extension:', extension.name, 'isPublic:', extension.isPublic);

    // Check if extension is public
    if (!isExtensionPublic(extension)) {
      console.log('Extension is not public, denying access');
      return null;
    }

    console.log('Extension is public, granting access');
    return extension;
  } catch (error) {
    console.error('Error accessing public extension:', error);
    // Extension doesn't exist or no access
    return null;
  }
}

/**
 * Toggle extension visibility between public and private
 */
export async function toggleExtensionVisibility(extensionId: string): Promise<Extensions | null> {
  try {
    // Get current extension
    const extension = await tablesDB.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_EXTENSIONS,
      rowId: extensionId
    }) as unknown as Extensions;

    // Check if user owns the extension
    if (!(await isExtensionOwner(extension))) {
      throw new Error('Permission denied: You can only modify your own extensions');
    }

    // Ensure we have a valid authorId
    if (!extension.authorId) {
      throw new Error('Extension does not have a valid author ID');
    }

    // Toggle visibility
    const newIsPublic = !isExtensionPublic(extension);
    
    // Prepare permissions based on visibility
    let permissions;
    if (newIsPublic) {
      // Public extension: allow read access for anyone, owner can update/delete
      permissions = [
        Permission.read(Role.any()),
        Permission.read(Role.user(extension.authorId)),
        Permission.update(Role.user(extension.authorId)),
        Permission.delete(Role.user(extension.authorId))
      ];
    } else {
      // Private extension: only owner can read/update/delete
      permissions = [
        Permission.read(Role.user(extension.authorId)),
        Permission.update(Role.user(extension.authorId)),
        Permission.delete(Role.user(extension.authorId))
      ];
    }
    
    // Update the extension with new visibility and permissions
    const updatedExtension = await tablesDB.updateRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_EXTENSIONS,
      rowId: extensionId,
      data: {
        isPublic: newIsPublic,
        updatedAt: new Date().toISOString()
      },
      permissions
    }) as unknown as Extensions;

    return updatedExtension;
  } catch (error) {
    console.error('Error toggling extension visibility:', error);
    return null;
  }
}

/**
 * Make an extension public
 */
export async function makeExtensionPublic(extensionId: string): Promise<Extensions | null> {
  try {
    const extension = await tablesDB.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_EXTENSIONS,
      rowId: extensionId
    }) as unknown as Extensions;

    if (!(await isExtensionOwner(extension))) {
      throw new Error('Permission denied: You can only modify your own extensions');
    }

    // Ensure we have a valid authorId
    if (!extension.authorId) {
      throw new Error('Extension does not have a valid author ID');
    }

    // Set permissions for public access
    const permissions = [
      Permission.read(Role.any()),
      Permission.read(Role.user(extension.authorId)),
      Permission.update(Role.user(extension.authorId)),
      Permission.delete(Role.user(extension.authorId))
    ];

    const updatedExtension = await tablesDB.updateRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_EXTENSIONS,
      rowId: extensionId,
      data: {
        isPublic: true,
        updatedAt: new Date().toISOString()
      },
      permissions
    }) as unknown as Extensions;

    return updatedExtension;
  } catch (error) {
    console.error('Error making extension public:', error);
    return null;
  }
}

/**
 * Make an extension private
 */
export async function makeExtensionPrivate(extensionId: string): Promise<Extensions | null> {
  try {
    const extension = await tablesDB.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_EXTENSIONS,
      rowId: extensionId
    }) as unknown as Extensions;

    if (!(await isExtensionOwner(extension))) {
      throw new Error('Permission denied: You can only modify your own extensions');
    }

    // Ensure we have a valid authorId
    if (!extension.authorId) {
      throw new Error('Extension does not have a valid author ID');
    }

    // Set permissions for private access (only owner)
    const permissions = [
      Permission.read(Role.user(extension.authorId)),
      Permission.update(Role.user(extension.authorId)),
      Permission.delete(Role.user(extension.authorId))
    ];

    const updatedExtension = await tablesDB.updateRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_EXTENSIONS,
      rowId: extensionId,
      data: {
        isPublic: false,
        updatedAt: new Date().toISOString()
      },
      permissions
    }) as unknown as Extensions;

    return updatedExtension;
  } catch (error) {
    console.error('Error making extension private:', error);
    return null;
  }
}

/**
 * Get all public extensions (for public discovery/marketplace)
 */
export async function getPublicExtensions(limit: number = 50): Promise<{ documents: Extensions[], total: number }> {
  try {
    const response = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_TABLE_ID_EXTENSIONS,
      queries: [
        // Only public extensions
        // Query.equal('isPublic', true), // Commented out due to potential query limitations
        // Query.limit(limit),
        // Query.orderDesc('$createdAt')
      ]
    });

    // Filter public extensions on the client side for now
    const publicExtensions = response.rows.filter((doc: any) => doc.isPublic === true) as unknown as Extensions[];
    
    return {
      documents: publicExtensions.slice(0, limit),
      total: publicExtensions.length
    };
  } catch (error) {
    console.error('Error fetching public extensions:', error);
    return { documents: [], total: 0 };
  }
}