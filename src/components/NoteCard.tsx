import React, { useState } from 'react';
import { Note } from '@/types/note';
import { useBlockchain } from './providers/BlockchainProvider';

interface NoteCardProps {
  note: Note;
  onShare?: (noteId: string, recipient: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onShare, ...props }) => {
  const { sharing } = useBlockchain();
  const [isSharing, setIsSharing] = useState(false);
  const [recipient, setRecipient] = useState('');

  const handleShare = async () => {
    if (!recipient) return;
    setIsSharing(true);
    try {
      await sharing.shareNote(
        note.id,
        recipient,
        new TextEncoder().encode(note.encryptionKey)
      );
      onShare?.(note.id, recipient);
    } catch (error) {
      console.error('Failed to share note:', error);
    } finally {
      setIsSharing(false);
      setRecipient('');
    }
  };

  return (
    <div className="border rounded p-4" {...props}>
      <h3>{note.title}</h3>
      <p>{note.content.substring(0, 50)}...</p>
      <div className="mt-4">
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter recipient's address"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleShare}
          disabled={isSharing || !recipient}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isSharing ? 'Sharing...' : 'Share Note'}
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
