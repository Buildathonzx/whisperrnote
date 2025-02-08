import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:whisperrnote_app/router.dart';

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier();
});

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier() : super(ThemeMode.light) {
    _loadTheme();
  }

  void _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final isDark = prefs.getBool('isDarkMode') ?? false;
    state = isDark ? ThemeMode.dark : ThemeMode.light;
  }

  void toggleTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final isDark = state == ThemeMode.dark;
    await prefs.setBool('isDarkMode', !isDark);
    state = isDark ? ThemeMode.light : ThemeMode.dark;
  }
}

void main() {
  runApp(const ProviderScope(child: WhisperNoteApp()));
}

class WhisperNoteApp extends ConsumerWidget {
  const WhisperNoteApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);

    return MaterialApp.router(
      title: 'WhisperNote',
      themeMode: themeMode,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF3B82F6),
          secondary: const Color(0xFFEC4899),
        ),
        textTheme:
            GoogleFonts.getTextTheme('Roboto', ThemeData.light().textTheme),
        appBarTheme: const AppBarTheme(
          centerTitle: false,
          elevation: 0,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF3B82F6),
          secondary: const Color(0xFFEC4899),
          brightness: Brightness.dark,
        ),
        textTheme:
            GoogleFonts.getTextTheme('Roboto', ThemeData.dark().textTheme),
        appBarTheme: const AppBarTheme(
          centerTitle: false,
          elevation: 0,
        ),
      ),
      routerConfig: router,
    );
  }
}
