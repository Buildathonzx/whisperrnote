import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:whisperrnote_app/main.dart'; // Added to access themeProvider

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: const Color(0xFFF6FFF6),
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: const Color(0xFF22C55E),
        elevation: 8,
        shadowColor: Colors.green.withOpacity(0.4),
        centerTitle: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeOutCubic,
            margin: const EdgeInsets.only(bottom: 20),
            child: Material(
              elevation: 16,
              shadowColor: Colors.greenAccent.withOpacity(0.25),
              borderRadius: BorderRadius.circular(20),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: LinearGradient(
                    colors: [Colors.white, Colors.green.shade50],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.green.shade200.withOpacity(0.25),
                      blurRadius: 18,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Account',
                        style: theme.textTheme.titleLarge?.copyWith(
                            color: Colors.green.shade800,
                            fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    ListTile(
                      leading: const Icon(Icons.login, color: Colors.green),
                      title: const Text('Login'),
                      onTap: () =>
                          Navigator.of(context).pushNamed('/settings/login'),
                    ),
                    ListTile(
                      leading:
                          const Icon(Icons.person_add, color: Colors.green),
                      title: const Text('Sign Up'),
                      onTap: () =>
                          Navigator.of(context).pushNamed('/settings/signup'),
                    ),
                  ],
                ),
              ),
            ),
          ),
          AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeOutCubic,
            margin: const EdgeInsets.only(bottom: 20),
            child: Material(
              elevation: 16,
              shadowColor: Colors.greenAccent.withOpacity(0.25),
              borderRadius: BorderRadius.circular(20),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: LinearGradient(
                    colors: [Colors.white, Colors.green.shade50],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.green.shade200.withOpacity(0.25),
                      blurRadius: 18,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Preferences',
                        style: theme.textTheme.titleLarge?.copyWith(
                            color: Colors.green.shade800,
                            fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    SwitchListTile(
                      value: theme.brightness == Brightness.dark,
                      onChanged: (val) {},
                      title: const Text('Dark Mode'),
                      activeColor: Colors.green,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
