'use client';
import React, { useState } from 'react';
import { useAdminGate } from '@/hooks/useAdminGate';

interface SendState { status: 'idle'|'sending'|'success'|'error'; message?: string; }

export default function AdminMessages() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [userIds, setUserIds] = useState('');
  const [emails, setEmails] = useState('');
  const [bcc, setBcc] = useState('');
  const [allUsers, setAllUsers] = useState(false);
  const [topic, setTopic] = useState('');
  const [state, setState] = useState<SendState>({ status: 'idle' });
  const [dryRun, setDryRun] = useState(true);
  const [preview, setPreview] = useState<any>(null);

  // still use hook to fetch JWT for API calls; server access already gated
  const { jwt } = useAdminGate();

  const getJwt = async () => jwt;

  const send = async () => {
    if (dryRun) return;
    if (!subject.trim() || !body.trim()) { setState({ status: 'error', message: 'Subject & body required'}); return; }
    if (subject.length > 200) { setState({ status: 'error', message: 'Subject too long'}); return; }
    setState({ status: 'sending' });
    try {
      const token = await getJwt();
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject,
          bodyHtml: body,
          userIds: userIds.split(',').map(s=>s.trim()).filter(Boolean),
          emails: emails.split(',').map(s=>s.trim()).filter(Boolean),
          bcc: bcc.split(',').map(s=>s.trim()).filter(Boolean),
          allUsers,
          topic: topic || undefined,
          dryRun: false
        })
      });
      const j = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(j.error || 'Send failed');
      setState({ status: 'success', message: `Sent to ${j.recipients || 'n/a'} recipients` });
      setSubject(''); setBody('');
    } catch (e: any) {
      setState({ status: 'error', message: e.message || 'Error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Send Message</h1>
        <a href="/admin/dashboard" className="text-sm text-accent hover:underline">Back</a>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1">Subject</label>
            <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full px-3 py-2 rounded border bg-background" placeholder="Subject" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">HTML Body</label>
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={8} className="w-full px-3 py-2 rounded border font-mono text-xs" placeholder="<p>Announcement...</p>" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">User IDs (comma)</label>
            <input value={userIds} onChange={e=>setUserIds(e.target.value)} className="w-full px-3 py-2 rounded border bg-background" placeholder="user1,user2" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Emails (comma)</label>
            <input value={emails} onChange={e=>setEmails(e.target.value)} className="w-full px-3 py-2 rounded border bg-background" placeholder="a@b.dev,c@d.dev" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">BCC (comma)</label>
            <input value={bcc} onChange={e=>setBcc(e.target.value)} className="w-full px-3 py-2 rounded border bg-background" placeholder="team@domain.dev" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Topic (optional)</label>
            <input value={topic} onChange={e=>setTopic(e.target.value)} className="w-full px-3 py-2 rounded border bg-background" placeholder="release-2025q1" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <input id="allUsers" type="checkbox" checked={allUsers} onChange={e=>setAllUsers(e.target.checked)} />
          <label htmlFor="allUsers">Broadcast to all users (overrides User IDs/Emails)</label>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <input id="dryRun" type="checkbox" checked={dryRun} onChange={e=>setDryRun(e.target.checked)} />
          <label htmlFor="dryRun">Dry Run (preview only)</label>
        </div>
        <div className="flex gap-3">
          <button onClick={async ()=>{
            setState({ status: 'sending' });
            setPreview(null);
            try {
              const token = await getJwt();
              const res = await fetch('/api/admin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  subject,
                  bodyHtml: body,
                  userIds: userIds.split(',').map(s=>s.trim()).filter(Boolean),
                  emails: emails.split(',').map(s=>s.trim()).filter(Boolean),
                  bcc: bcc.split(',').map(s=>s.trim()).filter(Boolean),
                  allUsers,
                  topic: topic || undefined,
                  dryRun: true
                })
              });
              const j = await res.json().catch(()=>({}));
              if (!res.ok) throw new Error(j.error || 'Preview failed');
              setPreview(j);
              setState({ status: 'idle', message: `Preview: ${j.recipients} recipients` });
            } catch (e: any) {
              setState({ status: 'error', message: e.message || 'Error' });
            }
          }} disabled={state.status==='sending'} className="px-4 py-2 rounded bg-secondary text-secondary-foreground hover:opacity-90 disabled:opacity-50">
            {state.status==='sending' ? 'Working...' : 'Generate Preview'}
          </button>
          <button onClick={send} disabled={state.status==='sending' || dryRun} className="px-4 py-2 rounded bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50">
            {state.status==='sending' ? 'Sending...' : 'Send Message'}
          </button>
        </div>
        {dryRun && <div className="text-[10px] text-muted-foreground">Disable Dry Run to enable final send after preview.</div>}
        {preview && (
          <div className="border rounded p-3 bg-muted/30 text-xs space-y-1">
            <div className="font-semibold">Preview</div>
            <div>Recipients: {preview.recipients}</div>
            <div>Subject: {preview.preview?.subject}</div>
            <div>Snippet: {preview.preview?.snippet}</div>
          </div>
        )}
        {state.status==='error' && <div className="text-xs text-destructive">{state.message}</div>}
        {state.status==='success' && <div className="text-xs text-green-600">{state.message}</div>}
      </div>
    </div>
  );
}
