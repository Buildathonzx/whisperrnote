import 'dart:io';

class AppConfig {
  static final AppConfig _instance = AppConfig._internal();
  factory AppConfig() => _instance;
  AppConfig._internal();

  late final String appwriteEndpoint;
  late final String appwriteProjectId;
  late final String appwriteDatabaseId;
  late final String appwriteUsersCollectionId;
  late final String appwriteNotesCollectionId;
  late final String appwriteTagsCollectionId;
  late final String appwriteApiKeysCollectionId;
  late final String appwriteBlogPostsCollectionId;
  late final String appwriteNotesBucketId;
  late final String appwriteProfilePicturesBucketId;

  Future<void> load() async {
    // In Flutter, use --dart-define or a .env loader package for env vars
    appwriteEndpoint = const String.fromEnvironment('NEXT_PUBLIC_APPWRITE_ENDPOINT');
    appwriteProjectId = const String.fromEnvironment('NEXT_PUBLIC_APPWRITE_PROJECT_ID');
    appwriteDatabaseId = const String.fromEnvironment('NEXT_PUBLIC_APPWRITE_DATABASE_ID');
    appwriteUsersCollectionId = const String.fromEnvironment('NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID');
    appwriteNotesCollectionId = const String.fromEnvironment('NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID');
    appwriteTagsCollectionId = const String.fromEnvironment('NEXT_PUBLIC_APPWRITE_TAGS_COLLECTION_ID');
    appwriteApiKeysCollectionId = const String.fromEnvironment('NEXT_PUBLIC_APPWRITE_APIKEYS_COLLECTION_ID');
    appwriteBlogPostsCollectionId = const String.fromEnvironment('NEXT_PUBLIC_APPWRITE_BLOGPOSTS_COLLECTION_ID');
    appwriteNotesBucketId = const String.fromEnvironment('NEXT_PUBLIC_APPWRITE_NOTES_BUCKET_ID');
    appwriteProfilePicturesBucketId = const String.fromEnvironment('NEXT_PUBLIC_APPWRITE_PROFILE_PICTURES_BUCKET_ID');
  }
}
