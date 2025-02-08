import { Container, Typography, Fab, Box } from '@mui/material';
import { Add } from '@mui/icons-material';
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Your Notes
        </Typography>
      </Box>
      {dummyNotes.map((note) => (
        <NoteComponent key={note.id} note={note} />
      ))}
      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <Add />
      </Fab>
    </Container>
  );
}
