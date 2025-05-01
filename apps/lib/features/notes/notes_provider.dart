import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:whisperrnote_app/services/local_db_service.dart';
import 'package:uuid/uuid.dart';

class Note {
  final String id;
  final String title;
  final String content;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? userId;
  final bool isPublic;
  final List<String> tags;

  Note({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
    this.userId,
    this.isPublic = false,
    this.tags = const [],
  });

  factory Note.fromMap(Map<String, dynamic> map) {
    return Note(
      id: map['id'] as String,
      title: map['title'] ?? '',
      content: map['content'] ?? '',
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
      userId: map['userId'],
      isPublic: (map['isPublic'] ?? 0) == 1,
      tags: map['tags'] != null && map['tags'] != ''
          ? (map['tags'] as String).split(',')
          : [],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'userId': userId,
      'isPublic': isPublic ? 1 : 0,
      'tags': tags.join(','),
    };
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

  Future<void> addNote({
    required String title,
    required String content,
    String? userId,
    bool isPublic = false,
    List<String> tags = const [],
  }) async {
    final now = DateTime.now();
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    final newNote = Note(
      id: id,
      title: title,
      content: content,
      createdAt: now,
      updatedAt: now,
      userId: userId,
      isPublic: isPublic,
      tags: tags,
    );
    state = [newNote, ...state]; // Optimistically update UI
    await LocalDbService().insertNote(
      id: id,
      title: title,
      content: content,
      createdAt: now.toIso8601String(),
      updatedAt: now.toIso8601String(),
      userId: userId,
      isPublic: isPublic,
      tags: tags,
    );
    await loadNotes();
  }

  Future<void> updateNote({
    required String id,
    required String title,
    required String content,
    String? userId,
    bool? isPublic,
    List<String>? tags,
  }) async {
    final idx = state.indexWhere((note) => note.id == id);
    if (idx != -1) {
      final updatedNote = state[idx].copyWith(
        title: title,
        content: content,
        updatedAt: DateTime.now(),
        userId: userId,
        isPublic: isPublic ?? state[idx].isPublic,
        tags: tags ?? state[idx].tags,
      );
      state = [
        ...state.sublist(0, idx),
        updatedNote,
        ...state.sublist(idx + 1),
      ];
    }
    await LocalDbService().updateNote(
      id: id,
      title: title,
      content: content,
      updatedAt: DateTime.now().toIso8601String(),
      userId: userId,
      isPublic: isPublic,
      tags: tags,
    );
    await loadNotes();
  }

  Future<void> deleteNote(String id) async {
    state = state
        .where((note) => note.id != id)
        .toList(); // Optimistically update UI
    await LocalDbService().deleteNote(id);
    await loadNotes();
  }

  Note? getNoteById(String id) {
    try {
      return state.firstWhere((note) => note.id == id);
    } catch (_) {
      return null;
    }
  }
}

final notesProvider = StateNotifierProvider<NotesNotifier, List<Note>>((ref) {
  return NotesNotifier();
});

extension NoteCopyWith on Note {
  Note copyWith({
    String? title,
    String? content,
    DateTime? updatedAt,
    String? userId,
    bool? isPublic,
    List<String>? tags,
  }) {
    return Note(
      id: id,
      title: title ?? this.title,
      content: content ?? this.content,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      userId: userId ?? this.userId,
      isPublic: isPublic ?? this.isPublic,
      tags: tags ?? this.tags,
    );
  }
}
