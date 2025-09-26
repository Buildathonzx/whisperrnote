import { Client, Users, Messaging } from 'node-appwrite';

interface SendAdminEmailOptions {
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  userIds?: string[]; // specific users
  emails?: string[]; // direct emails
  allUsers?: boolean; // broadcast
  bcc?: string[];
  topic?: string; // optional topic label
  dryRun?: boolean; // if true, do not send, just return summary
  maxRecipients?: number; // override default cap
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
  const { subject, bodyHtml, bodyText, userIds = [], emails = [], allUsers = false, bcc = [], topic, dryRun = false, maxRecipients } = opts;
  if (!subject) throw new Error('Subject required');
  if (!bodyHtml && !bodyText) throw new Error('Body required');
  if (subject.length > 200) throw new Error('Subject too long (200 char max)');
  const html = bodyHtml || '';
  if (html.length > 100_000) throw new Error('Body too large (100k char max)');

  const client = getServerClient();
  const messaging = new Messaging(client);

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

  // Normalize & dedupe
  targetUserIds = Array.from(new Set(targetUserIds.filter(Boolean)));
  targetEmails = Array.from(new Set(targetEmails.filter(Boolean)));

  if (!targetUserIds.length && !targetEmails.length) throw new Error('No recipients specified');

  const cap = typeof maxRecipients === 'number' && maxRecipients > 0 ? maxRecipients : 5000;
  const totalIntended = targetUserIds.length + targetEmails.length + bcc.length;
  if (totalIntended > cap) throw new Error(`Recipient count ${totalIntended} exceeds cap ${cap}`);

  const recipients: any[] = [];
  for (const id of targetUserIds) recipients.push({ userId: id });
  for (const em of targetEmails) recipients.push({ email: em });
  if (bcc.length) {
    for (const b of bcc) recipients.push({ email: b, type: 'bcc' });
  }

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      recipients: recipients.length,
      preview: {
        subject,
        snippet: (html.replace(/<[^>]+>/g, '').slice(0, 140))
      }
    };
  }

  const payload: any = {
    subject,
    content: html || bodyText,
    addresses: recipients,
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
