import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:whisperrnote_app/features/auth/login_screen.dart';
import 'package:whisperrnote_app/features/auth/signup_screen.dart';
import 'package:whisperrnote_app/features/notes/notes_screen.dart';
import 'package:whisperrnote_app/features/notes/note_detail_screen.dart';
import 'package:whisperrnote_app/features/todos/todos_screen.dart';
import 'package:whisperrnote_app/features/shared/shared_notes_screen.dart';
import 'package:whisperrnote_app/features/profile/profile_screen.dart';
import 'package:whisperrnote_app/features/settings/settings_screen.dart';
import 'package:whisperrnote_app/features/dashboard/dashboard_screen.dart';
import 'package:whisperrnote_app/features/tags/tags_screen.dart';
import 'modern_sidebar.dart';
import 'modern_bottom_bar.dart';
import 'package:flutter_resizable_container/flutter_resizable_container.dart';
import 'widgets/universal_search_bar.dart';

final router = GoRouter(
  initialLocation: '/notes',
  routes: [
    ShellRoute(
      builder: (context, state, child) => AppShell(child: child),
      routes: [
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const DashboardScreen(),
        ),
        GoRoute(
          path: '/notes',
          builder: (context, state) => const NotesScreen(),
        ),
        GoRoute(
          path: '/notes/:id',
          builder: (context, state) => NoteDetailScreen(
            noteId: state.pathParameters['id']!,
          ),
        ),
        GoRoute(
          path: '/todos',
          builder: (context, state) => const TodosScreen(),
        ),
        GoRoute(
          path: '/shared',
          builder: (context, state) => const SharedNotesScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
        GoRoute(
          path: '/settings',
          builder: (context, state) => const SettingsScreen(),
          routes: [
            GoRoute(
              path: 'login',
              builder: (context, state) => const LoginScreen(),
            ),
            GoRoute(
              path: 'signup',
              builder: (context, state) => const SignupScreen(),
            ),
          ],
        ),
        GoRoute(
          path: '/tags',
          builder: (context, state) => const TagsScreen(),
        ),
      ],
    ),
  ],
);

class AppShell extends StatefulWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _selectedIndex = 0;
  final ResizableController _sidebarController = ResizableController();

  @override
  void dispose() {
    _sidebarController.dispose();
    super.dispose();
  }

  void _onSidebarItemSelected(int index) {
    setState(() {
      _selectedIndex = index;
    });
    // Navigation handled in ModernSidebar
  }

  void _onBottomBarTap(int index) {
    setState(() {
      _selectedIndex = index;
    });
    // Navigation handled in ModernBottomBar
  }

  @override
  Widget build(BuildContext context) {
    final isLargeScreen = MediaQuery.of(context).size.width >= 800;
    Widget contentWithSearch = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        UniversalSearchBar(
          onSearch: (query, pageContext) {
            // TODO: Implement universal search logic for notes, todos, tags, shared, settings, etc.
          },
        ),
        Expanded(child: widget.child),
      ],
    );
    return Scaffold(
      body: isLargeScreen
          ? ResizableContainer(
              controller: _sidebarController,
              direction: Axis.horizontal,
              children: [
                ResizableChild(
                  size: const ResizableSize.pixels(220, min: 64, max: 320),
                  child: ModernSidebar(
                    selectedIndex: _selectedIndex,
                    onItemSelected: _onSidebarItemSelected,
                    resizableController: _sidebarController,
                  ),
                ),
                ResizableChild(
                  size: const ResizableSize.expand(),
                  child: contentWithSearch,
                ),
              ],
            )
          : contentWithSearch,
      bottomNavigationBar: isLargeScreen
          ? null
          : ModernBottomBar(
              currentIndex: _selectedIndex,
              onTap: _onBottomBarTap,
            ),
    );
  }
}

// Add extension to provide current location
extension RouterLocationExt on GoRouter {
  String get location => routerDelegate.currentConfiguration.location ?? '';
}

extension on RouteMatchList {
  get location => null;
}
