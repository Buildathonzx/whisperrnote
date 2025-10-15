import { Client, Databases, Query } from 'node-appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.WALLET_MAP_TABLE_ID!;

function getAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Databases(client);
}

export type WalletMapDoc = {
  $id: string;
  walletAddressLower: string;
  userId: string;
  updatedAt?: string;
};

export async function getUserIdByWallet(addrLower: string): Promise<string | null> {
  const db = getAdminClient();
  try {
    const res: any = await db.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('walletAddressLower', addrLower),
      Query.limit(1),
    ]);
    const doc = res.documents?.[0] as WalletMapDoc | undefined;
    return doc?.userId ?? null;
  } catch (_e) {
    return null;
  }
}

export async function setWalletMap(addrLower: string, userId: string): Promise<void> {
  const db = getAdminClient();
  // Upsert semantics: try find existing -> update; else create
  try {
    const res: any = await db.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('walletAddressLower', addrLower),
      Query.limit(1),
    ]);
    const doc = res.documents?.[0] as WalletMapDoc | undefined;
    if (doc) {
      await db.updateDocument(DB_ID, COLLECTION_ID, doc.$id, {
        userId,
        updatedAt: new Date().toISOString(),
      });
      return;
    }
  } catch (_) {
    // ignore and attempt create
  }
  // Create new mapping; rely on unique index to prevent dup wallet
  await db.createDocument(DB_ID, COLLECTION_ID, 'unique()', {
    walletAddressLower: addrLower,
    userId,
    updatedAt: new Date().toISOString(),
  });
}
