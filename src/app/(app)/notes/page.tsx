import { Note } from "../../../../types/notes";
import NoteComponent from "./Note";

const dummyNotes: Note[] = [
  {
    id: "1",
    title: "First Note",
    content: "This is the content of the first note.",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Second Note",
    content: "This is the content of the second note.",
    createdAt: new Date(),
  },
];

export default function NotesPage() {
  return (
    <div className="container">
      <h1>Your Notes</h1>
      {dummyNotes.map((note) => (
        <NoteComponent key={note.id} note={note} />
      ))}
    </div>
  );
}
