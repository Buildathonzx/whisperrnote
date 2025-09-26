import { Client, Users, Databases, Teams, Messaging } from 'node-appwrite';

interface SendAdminEmailOptions {
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  userIds?: string[]; // specific users
  emails?: string[]; // direct emails
  allUsers?: boolean; // broadcast
  bcc?: string[];
  topic?: string; // optional topic label
}

function getServerClient() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY; // should be server-side secret
  if (!endpoint || !project || !apiKey) throw new Error('Missing Appwrite server credentials');
  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
  return client;
}

export async function sendAdminEmail(opts: SendAdminEmailOptions) {
  const { subject, bodyHtml, bodyText, userIds = [], emails = [], allUsers = false, bcc = [], topic } = opts;
  if (!subject) throw new Error('Subject required');
  if (!bodyHtml && !bodyText) throw new Error('Body required');
  const client = getServerClient();
  const messaging = new Messaging(client);

  // Build recipients: Appwrite supports IDs for users / teams / topics (depending on version). We'll send individual user IDs or emails.
  // Fallback behavior: if allUsers, we attempt to fetch a limited batch of users (pagination not implemented here for brevity).
  let targetUserIds: string[] = [...userIds];
  let targetEmails: string[] = [...emails];

  if (allUsers) {
    try {
      const users = new Users(client);
      const list: any = await users.list();
      targetUserIds = list.users.map((u: any) => u.$id || u.id);
    } catch (e) {
      console.error('[admin messaging] failed to list users for broadcast', e);
      throw new Error('Failed to enumerate users for broadcast');
    }
  }

  if (!targetUserIds.length && !targetEmails.length) throw new Error('No recipients specified');

  // Create an email message per current Messaging API (adjust if API changes)
  // We send a single message with multiple recipients when possible.
  const recipients: any[] = [];
  for (const id of targetUserIds) recipients.push({ userId: id });
  for (const em of targetEmails) recipients.push({ email: em });
  if (bcc.length) {
    for (const b of bcc) recipients.push({ email: b, type: 'bcc' });
  }

  const payload: any = {
    subject,
    content: bodyHtml || bodyText,
    addresses: recipients,
    // metadata for future filtering
    data: { topic: topic || null }
  };

  try {
    const res = await messaging.createEmail(payload);
    return { success: true, id: (res as any).$id || (res as any).id, recipients: recipients.length };
  } catch (e: any) {
    console.error('[admin messaging] send error', e);
    throw new Error(e?.message || 'Failed to send');
  }
}
