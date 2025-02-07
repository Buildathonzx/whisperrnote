import { Note } from "../../../../types/notes";

export default function NoteComponent({ note }: { note: Note }) {
  return (
    <div className="note-card">
      <h2>{note.title}</h2>
      <p>{note.content}</p>
      <small>Created at: {note.createdAt.toLocaleDateString()}</small>
    </div>
  );
}
