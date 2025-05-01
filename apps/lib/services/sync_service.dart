import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:appwrite/appwrite.dart';
import 'local_db_service.dart';
import 'app_config.dart';

class SyncService {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  late Client _client;
  late Databases _db;
  bool _initialized = false;

  Future<void> init() async {
    final config = AppConfig();
    if (!_initialized) {
      await config.load();
      _client = Client()
        ..setEndpoint(config.appwriteEndpoint)
        ..setProject(config.appwriteProjectId);
      _db = Databases(_client);
      _initialized = true;
    }
  }

  Future<void> trySync() async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) return;
    await init();
    // Fetch local notes
    final localNotes = await LocalDbService().getNotes();
    // TODO: Fetch remote notes, merge, resolve conflicts, push changes
    // Use _db to interact with Appwrite
    // Example:
    // await _db.createDocument(databaseId: ..., collectionId: ..., data: ...);
  }
}
