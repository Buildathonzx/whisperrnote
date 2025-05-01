import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:whisperrnote_app/features/auth/login_screen.dart';
import 'package:whisperrnote_app/features/auth/signup_screen.dart';
import 'package:whisperrnote_app/features/notes/notes_screen.dart';
import 'package:whisperrnote_app/features/notes/note_detail_screen.dart';
import 'package:whisperrnote_app/features/collections/collections_screen.dart';
import 'package:whisperrnote_app/features/shared/shared_notes_screen.dart';
import 'package:whisperrnote_app/features/profile/profile_screen.dart';
import 'package:whisperrnote_app/features/settings/settings_screen.dart';
import 'package:whisperrnote_app/features/dashboard/dashboard_screen.dart';

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
          path: '/collections',
          builder: (context, state) => const CollectionsScreen(),
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
      ],
    ),
  ],
);

class AppShell extends StatelessWidget {
  final Widget child;

  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    final selectedIndex = _getSelectedIndex(GoRouter.of(context).location);
    final destinations = const [
      NavigationRailDestination(
        icon: Icon(Icons.dashboard),
        label: Text('Dashboard'),
      ),
      NavigationRailDestination(
        icon: Icon(Icons.note),
        label: Text('Notes'),
      ),
      NavigationRailDestination(
        icon: Icon(Icons.folder),
        label: Text('Collections'),
      ),
      NavigationRailDestination(
        icon: Icon(Icons.share),
        label: Text('Shared'),
      ),
      NavigationRailDestination(
        icon: Icon(Icons.person),
        label: Text('Profile'),
      ),
      NavigationRailDestination(
        icon: Icon(Icons.settings),
        label: Text('Settings'),
      ),
    ];
    final navColors = [
      const Color(0xFF22C55E),
      Colors.green.shade700,
      Colors.green.shade400,
      Colors.green.shade200,
    ];
    return Scaffold(
      backgroundColor: const Color(0xFFF6FFF6),
      body: isMobile
          ? Stack(
              children: [
                Positioned.fill(child: child),
                Align(
                  alignment: Alignment.bottomCenter,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [navColors[0], navColors[2]],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: navColors[1].withOpacity(0.18),
                          blurRadius: 18,
                          offset: const Offset(0, -4),
                        ),
                      ],
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(24)),
                    ),
                    child: BottomNavigationBar(
                      backgroundColor: Colors.transparent,
                      elevation: 0,
                      type: BottomNavigationBarType.fixed,
                      selectedItemColor: navColors[0],
                      unselectedItemColor: navColors[1],
                      currentIndex: selectedIndex,
                      onTap: (index) => _onNavTap(context, index),
                      items: const [
                        BottomNavigationBarItem(
                            icon: Icon(Icons.dashboard), label: 'Dashboard'),
                        BottomNavigationBarItem(
                            icon: Icon(Icons.note), label: 'Notes'),
                        BottomNavigationBarItem(
                            icon: Icon(Icons.folder), label: 'Collections'),
                        BottomNavigationBarItem(
                            icon: Icon(Icons.share), label: 'Shared'),
                        BottomNavigationBarItem(
                            icon: Icon(Icons.person), label: 'Profile'),
                        BottomNavigationBarItem(
                            icon: Icon(Icons.settings), label: 'Settings'),
                      ],
                      showUnselectedLabels: true,
                    ),
                  ),
                ),
              ],
            )
          : Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [navColors[0], navColors[2]],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: navColors[1].withOpacity(0.18),
                        blurRadius: 18,
                        offset: const Offset(4, 0),
                      ),
                    ],
                  ),
                  child: NavigationRail(
                    backgroundColor: Colors.transparent,
                    extended: MediaQuery.of(context).size.width >= 800,
                    selectedIndex: selectedIndex,
                    onDestinationSelected: (index) => _onNavTap(context, index),
                    destinations: destinations,
                    selectedIconTheme: IconThemeData(
                      color: navColors[0],
                      shadows: [
                        Shadow(color: navColors[2], blurRadius: 8),
                      ],
                    ),
                    unselectedIconTheme: IconThemeData(
                      color: navColors[1],
                    ),
                    selectedLabelTextStyle: TextStyle(
                      color: navColors[0],
                      fontWeight: FontWeight.bold,
                      shadows: [Shadow(color: navColors[2], blurRadius: 8)],
                    ),
                    unselectedLabelTextStyle: TextStyle(
                      color: navColors[1],
                    ),
                  ),
                ),
                Expanded(child: child),
              ],
            ),
    );
  }

  void _onNavTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/dashboard');
        break;
      case 1:
        context.go('/notes');
        break;
      case 2:
        context.go('/collections');
        break;
      case 3:
        context.go('/shared');
        break;
      case 4:
        context.go('/profile');
        break;
      case 5:
        context.go('/settings');
        break;
    }
  }

  int _getSelectedIndex(String location) {
    if (location.startsWith('/dashboard')) return 0;
    if (location.startsWith('/notes')) return 1;
    if (location.startsWith('/collections')) return 2;
    if (location.startsWith('/shared')) return 3;
    if (location.startsWith('/profile')) return 4;
    if (location.startsWith('/settings')) return 5;
    return 0;
  }
}

// Add extension to provide current location
extension RouterLocationExt on GoRouter {
  String get location => routerDelegate.currentConfiguration.location ?? '';
}

extension on RouteMatchList {
  get location => null;
}
