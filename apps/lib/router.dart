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
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/signup',
      builder: (context, state) => const SignupScreen(),
    ),
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
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            extended: MediaQuery.of(context).size.width >= 800,
            destinations: const [
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
            ],
            selectedIndex: _getSelectedIndex(GoRouter.of(context).location),
            onDestinationSelected: (index) {
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
            },
          ),
          Expanded(child: child),
        ],
      ),
    );
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
