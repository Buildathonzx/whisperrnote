import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildProfileHeader(context),
          const SizedBox(height: 24),
          _buildQuickStats(context),
          const SizedBox(height: 24),
          _buildRecentActivity(context),
          const SizedBox(height: 24),
          _buildMostUsedTags(context),
        ],
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            CircleAvatar(
              radius: 60,
              backgroundColor: Theme.of(context).colorScheme.primary,
              child: const Text(
                'JD',
                style: TextStyle(fontSize: 36),
              ),
            ).animate().scale(),
            const SizedBox(height: 16),
            Text(
              'John Doe',
              style: Theme.of(context).textTheme.headlineMedium,
            ).animate().fadeIn().slideY(begin: 0.2),
            Text(
              'john.doe@example.com',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).textTheme.bodySmall?.color,
                  ),
            ).animate().fadeIn().slideY(begin: 0.2),
            const SizedBox(height: 16),
            FilledButton.icon(
              icon: const Icon(Icons.edit),
              label: const Text('Edit Profile'),
              onPressed: () {
                // TODO: Implement edit profile
              },
            ).animate().fadeIn().slideY(begin: 0.2),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickStats(BuildContext context) {
    final stats = [
      {'value': '42', 'label': 'Total Notes'},
      {'value': '7', 'label': 'Collections'},
      {'value': '15', 'label': 'Shared Notes'},
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: stats.map((stat) {
            final index = stats.indexOf(stat);
            return Expanded(
              child: Column(
                children: [
                  Text(
                    stat['value']!,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                  Text(
                    stat['label']!,
                    style: Theme.of(context).textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ],
              ).animate().fadeIn().slideY(
                    begin: 0.2,
                    delay: Duration(milliseconds: 100 * index),
                  ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildRecentActivity(BuildContext context) {
    final activities = [
      {
        'icon': Icons.note_add,
        'title': 'Created new note "Project Ideas"',
        'time': '2 hours ago',
      },
      {
        'icon': Icons.folder,
        'title': 'Created new collection "Work"',
        'time': 'Yesterday',
      },
    ];

    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: activities.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              final activity = activities[index];
              return ListTile(
                leading: Icon(
                  activity['icon'] as IconData,
                  color: Theme.of(context).colorScheme.primary,
                ),
                title: Text(activity['title'] as String),
                subtitle: Text(activity['time'] as String),
              ).animate().fadeIn().slideX(
                    begin: -0.2,
                    delay: Duration(milliseconds: 100 * index),
                  );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMostUsedTags(BuildContext context) {
    final tags = ['work', 'ideas', 'personal', 'todo', 'projects'];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Most Used Tags',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: tags.asMap().entries.map((entry) {
                return Chip(
                  label: Text(entry.value),
                  backgroundColor:
                      Theme.of(context).colorScheme.primaryContainer,
                ).animate().fadeIn().scale(
                      delay: Duration(milliseconds: 100 * entry.key),
                    );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
