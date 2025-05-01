import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:whisperrnote_app/services/local_db_service.dart';

class Note {
  final int id;
  final String title;
  final String content;
  final DateTime createdAt;
  final DateTime updatedAt;

  Note({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Note.fromMap(Map<String, dynamic> map) {
    return Note(
      id: map['id'] as int,
      title: map['title'] ?? '',
      content: map['content'] ?? '',
      createdAt: DateTime.parse(map['created_at']),
      updatedAt: DateTime.parse(map['updated_at']),
    );
  }
}

class NotesNotifier extends StateNotifier<List<Note>> {
  NotesNotifier() : super([]) {
    loadNotes();
  }

  Future<void> loadNotes() async {
    final notesData = await LocalDbService().getNotes();
    state = notesData.map((e) => Note.fromMap(e)).toList();
  }

  Future<void> addNote(String title, String content) async {
    await LocalDbService().insertNote(title, content);
    await loadNotes();
  }

  Future<void> updateNote(int id, String title, String content) async {
    final db = LocalDbService().db;
    await db.update(
      'notes',
      {
        'title': title,
        'content': content,
        'updated_at': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [id],
    );
    await loadNotes();
  }

  Future<void> deleteNote(int id) async {
    final db = LocalDbService().db;
    await db.delete('notes', where: 'id = ?', whereArgs: [id]);
    await loadNotes();
  }

  Note? getNoteById(int id) {
    return state.firstWhere((note) => note.id == id, orElse: () => null);
  }
}

final notesProvider = StateNotifierProvider<NotesNotifier, List<Note>>((ref) {
  return NotesNotifier();
});
