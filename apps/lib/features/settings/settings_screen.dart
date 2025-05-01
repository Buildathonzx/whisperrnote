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
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Account', style: theme.textTheme.titleLarge?.copyWith(color: Colors.green.shade800, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    ListTile(
                      leading: const Icon(Icons.login, color: Colors.green),
            currentPasswordController: _currentPasswordController,
            newPasswordController: _newPasswordController,
            confirmPasswordController: _confirmPasswordController,
          ),
        ],
      ),
    );
  }
}

class _GeneralTab extends ConsumerWidget {
  final WidgetRef ref;

  const _GeneralTab({required this.ref});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Column(
            children: [
              ListTile(
                title: const Text('Dark Mode'),
                subtitle: const Text('Toggle dark mode theme'),
                trailing: Switch(
                  value: themeMode == ThemeMode.dark,
                  onChanged: (value) {
                    ref.read(themeProvider.notifier).toggleTheme();
                  },
                ),
              ).animate().fadeIn().slideX(begin: -0.2),
              const Divider(),
              ListTile(
                title: const Text('Email Notifications'),
                subtitle: const Text(
                    'Receive email notifications for important updates'),
                trailing: Switch(
                  value: true, // TODO: Implement email notifications state
                  onChanged: (value) {
                    // TODO: Implement email notifications toggle
                  },
                ),
              ).animate().fadeIn().slideX(begin: -0.2, delay: 100.ms),
            ],
          ),
        ),
      ],
    );
  }
}

class _ApiKeysTab extends StatelessWidget {
  final TextEditingController newKeyNameController;

  const _ApiKeysTab({required this.newKeyNameController});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        FilledButton.icon(
          icon: const Icon(Icons.add),
          label: const Text('Generate New API Key'),
          onPressed: () => _showGenerateKeyDialog(context),
        ).animate().fadeIn().slideY(begin: -0.2),
        const SizedBox(height: 16),
        Card(
          child: Column(
            children: [
              ListTile(
                title: const Text('Mobile App Key'),
                subtitle: const Text('Last used: 2 days ago'),
                trailing: IconButton(
                  icon: const Icon(Icons.delete),
                  onPressed: () {
                    // TODO: Implement delete API key
                  },
                ),
              ).animate().fadeIn().slideX(begin: -0.2),
              const Divider(),
              ListTile(
                title: const Text('Desktop App Key'),
                subtitle: const Text('Last used: 5 minutes ago'),
                trailing: IconButton(
                  icon: const Icon(Icons.delete),
                  onPressed: () {
                    // TODO: Implement delete API key
                  },
                ),
              ).animate().fadeIn().slideX(begin: -0.2, delay: 100.ms),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _showGenerateKeyDialog(BuildContext context) {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Generate New API Key'),
        content: TextField(
          controller: newKeyNameController,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Key Name',
            hintText: 'e.g., Mobile App Key',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              // TODO: Implement API key generation
              Navigator.pop(context);
            },
            child: const Text('Generate'),
          ),
        ],
      ),
    );
  }
}

class _SecurityTab extends StatelessWidget {
  final TextEditingController currentPasswordController;
  final TextEditingController newPasswordController;
  final TextEditingController confirmPasswordController;

  const _SecurityTab({
    required this.currentPasswordController,
    required this.newPasswordController,
    required this.confirmPasswordController,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Change Password',
                  style: Theme.of(context).textTheme.titleLarge,
                ).animate().fadeIn().slideY(begin: -0.2),
                const SizedBox(height: 16),
                TextField(
                  controller: currentPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Current Password',
                  ),
                ).animate().fadeIn().slideX(begin: -0.2, delay: 100.ms),
                const SizedBox(height: 16),
                TextField(
                  controller: newPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'New Password',
                  ),
                ).animate().fadeIn().slideX(begin: -0.2, delay: 200.ms),
                const SizedBox(height: 16),
                TextField(
                  controller: confirmPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Confirm New Password',
                  ),
                ).animate().fadeIn().slideX(begin: -0.2, delay: 300.ms),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () {
                    // TODO: Implement password change
                  },
                  child: const Text('Update Password'),
                ).animate().fadeIn().slideY(begin: 0.2, delay: 400.ms),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Danger Zone',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Theme.of(context).colorScheme.error,
                      ),
                ).animate().fadeIn().slideY(begin: -0.2, delay: 500.ms),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  icon: const Icon(Icons.delete_forever),
                  label: const Text('Delete Account'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Theme.of(context).colorScheme.error,
                  ),
                  onPressed: () => _showDeleteAccountDialog(context),
                ).animate().fadeIn().slideY(begin: 0.2, delay: 600.ms),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _showDeleteAccountDialog(BuildContext context) {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Account'),
        content: const Text(
          'Are you sure you want to delete your account? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              // TODO: Implement account deletion
              Navigator.pop(context);
            },
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
