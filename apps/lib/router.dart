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
      ],
    ),
  ],
);

class AppShell extends StatelessWidget {
  final Widget child;

  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return child;
  }
}

// Add extension to provide current location
extension RouterLocationExt on GoRouter {
  String get location => routerDelegate.currentConfiguration.location ?? '';
}

extension on RouteMatchList {
  get location => null;
}
