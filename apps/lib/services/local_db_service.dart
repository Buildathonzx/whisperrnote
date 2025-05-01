import 'dart:io';
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:flutter/foundation.dart';

class LocalDbService {
  static final LocalDbService _instance = LocalDbService._internal();
  factory LocalDbService() => _instance;
  LocalDbService._internal();

  Database? _db;
  String? _dbPath;

  Future<void> init() async {
    if (!kIsWeb &&
        (Platform.isWindows || Platform.isLinux || Platform.isMacOS)) {
      databaseFactory = databaseFactoryFfi;
    }
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
      version: 2,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            userId TEXT,
            isPublic INTEGER NOT NULL DEFAULT 0,
            tags TEXT
          )
        ''');
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        // Handle migrations if needed
      },
    );
  }

  Database get db {
    if (_db == null) {
      throw Exception('Database not initialized. Call init() first.');
    }
    return _db!;
  }

  Future<int> insertNote({
    required String id,
    required String title,
    required String content,
    required String createdAt,
    required String updatedAt,
    String? userId,
    bool isPublic = false,
    List<String>? tags,
  }) async {
    return await db.insert('notes', {
      'id': id,
      'title': title,
      'content': content,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'userId': userId,
      'isPublic': isPublic ? 1 : 0,
      'tags': tags != null ? tags.join(',') : null,
    });
  }

  Future<List<Map<String, dynamic>>> getNotes() async {
    return await db.query('notes', orderBy: 'updatedAt DESC');
  }

  Future<int> updateNote({
    required String id,
    required String title,
    required String content,
    required String updatedAt,
    String? userId,
    bool? isPublic,
    List<String>? tags,
  }) async {
    return await db.update(
      'notes',
      {
        'title': title,
        'content': content,
        'updatedAt': updatedAt,
        if (userId != null) 'userId': userId,
        if (isPublic != null) 'isPublic': isPublic ? 1 : 0,
        if (tags != null) 'tags': tags.join(','),
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<int> deleteNote(String id) async {
    return await db.delete('notes', where: 'id = ?', whereArgs: [id]);
  }

  Future<Map<String, dynamic>?> getNoteById(String id) async {
    final result = await db.query('notes', where: 'id = ?', whereArgs: [id]);
    if (result.isNotEmpty) return result.first;
    return null;
  }
}
