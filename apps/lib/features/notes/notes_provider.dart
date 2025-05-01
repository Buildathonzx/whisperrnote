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
    final id = DateTime.now()
        .millisecondsSinceEpoch
        .toString(); // fallback if uuid not available
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
