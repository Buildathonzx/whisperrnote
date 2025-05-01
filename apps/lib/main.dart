import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:whisperrnote_app/router.dart';
import 'package:whisperrnote_app/services/local_db_service.dart';
import 'package:flutter_resizable_container/flutter_resizable_container.dart';
import 'modern_sidebar.dart';
import 'modern_bottom_bar.dart';
import 'search_bar.dart' as custom_search;

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

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalDbService().init();
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

class HomeScaffold extends StatefulWidget {
  const HomeScaffold({Key? key}) : super(key: key);

  @override
  State<HomeScaffold> createState() => _HomeScaffoldState();
}

class _HomeScaffoldState extends State<HomeScaffold> {
  int _selectedIndex = 0;

  void _onBottomBarTap(int index) {
    setState(() {
      _selectedIndex = index;
    });
    // TODO: Add navigation logic here if needed
  }

  void _onSidebarItemSelected(int index) {
    setState(() {
      _selectedIndex = index;
    });
    // No drawer to close, since sidebar is always visible
    // TODO: Add navigation logic here if needed
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // No AppBar, only SearchBar at the top of content
      body: ResizableContainer(
        direction: Axis.horizontal,
        children: [
          ResizableChild(
            size: const ResizableSize.pixels(220, min: 64, max: 320),
            child: ModernSidebar(
              selectedIndex: _selectedIndex,
              onItemSelected: _onSidebarItemSelected,
            ),
          ),
          ResizableChild(
            size: const ResizableSize.expand(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                custom_search.SearchBar(
                  hintText: 'Search...',
                  onSearch: (query) {
                    // TODO: Implement search logic for notes, collections, etc.
                  },
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: Center(
                    child: Text(
                      'Selected tab: $_selectedIndex',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: ModernBottomBar(
        currentIndex: _selectedIndex,
        onTap: _onBottomBarTap,
      ),
    );
  }
}
