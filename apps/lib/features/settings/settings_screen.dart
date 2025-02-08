import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _newKeyNameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _newKeyNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'General'),
            Tab(text: 'API Keys'),
            Tab(text: 'Security'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _GeneralTab(ref: ref),
          _ApiKeysTab(
            newKeyNameController: _newKeyNameController,
          ),
          _SecurityTab(
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
