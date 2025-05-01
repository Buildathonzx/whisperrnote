import 'dart:io';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';

class LocalDbService {
  static final LocalDbService _instance = LocalDbService._internal();
  factory LocalDbService() => _instance;
  LocalDbService._internal();

  Database? _db;
  String? _dbPath;

  Future<void> init() async {
    final home = Platform.isWindows
        ? Platform.environment['USERPROFILE']
        : Platform.environment['HOME'];
    final whisperrDir = Directory(p.join(home!, '.whisperrnote'));
    if (!await whisperrDir.exists()) {
      await whisperrDir.create(recursive: true);
    }
    _dbPath = p.join(whisperrDir.path, 'whisperrnote.db');
    _db = await openDatabase(
      _dbPath!,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            created_at TEXT,
            updated_at TEXT
          )
        ''');
        // Add more tables as needed
      },
    );
  }

  Database get db {
    if (_db == null) {
      throw Exception('Database not initialized. Call init() first.');
    }
    return _db!;
  }

  // Example: insert a note
  Future<int> insertNote(String title, String content) async {
    return await db.insert('notes', {
      'title': title,
      'content': content,
      'created_at': DateTime.now().toIso8601String(),
      'updated_at': DateTime.now().toIso8601String(),
    });
  }

  // Example: fetch all notes
  Future<List<Map<String, dynamic>>> getNotes() async {
    return await db.query('notes', orderBy: 'updated_at DESC');
  }
}
