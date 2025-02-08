import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildWelcomeSection(context),
          const SizedBox(height: 24),
          _buildQuickStats(context),
          const SizedBox(height: 24),
          _buildRecentActivitySection(context),
        ],
      ),
    );
  }

  Widget _buildWelcomeSection(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome back, John',
              style: Theme.of(context).textTheme.headlineMedium,
            ).animate().fadeIn().slideY(begin: -0.2),
            const SizedBox(height: 8),
            Text(
              "Here's what's happening with your notes",
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).textTheme.bodySmall?.color,
                  ),
            ).animate().fadeIn().slideY(begin: -0.2, delay: 100.ms),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickStats(BuildContext context) {
    final stats = [
      {
        'title': 'Total Notes',
        'value': '42',
        'trend': '+5 this week',
        'icon': Icons.note,
      },
      {
        'title': 'Collections',
        'value': '7',
        'trend': 'Most active: Work',
        'icon': Icons.folder,
      },
      {
        'title': 'Tags',
        'value': '23',
        'trend': '3 new this month',
        'icon': Icons.label,
      },
      {
        'title': 'Storage Used',
        'value': '28%',
        'trend': '2.3 MB of 10 MB',
        'icon': Icons.storage,
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.of(context).size.width > 1200
            ? 4
            : MediaQuery.of(context).size.width > 800
                ? 3
                : MediaQuery.of(context).size.width > 600
                    ? 2
                    : 1,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.5,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final stat = stats[index];
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      stat['icon'] as IconData,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      stat['title'] as String,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      stat['value'] as String,
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    Text(
                      stat['trend'] as String,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ).animate().fadeIn().scale(delay: Duration(milliseconds: 100 * index));
      },
    );
  }

  Widget _buildRecentActivitySection(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Card(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Recent Activity'),
                      TextButton(
                        onPressed: () => context.push('/notes'),
                        child: const Text('View All Notes'),
                      ),
                    ],
                  ),
                ),
                _buildRecentActivityList(context),
              ],
            ),
          ),
        ),
        if (MediaQuery.of(context).size.width >= 1000) ...[
          const SizedBox(width: 16),
          Expanded(
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Storage'),
                    const SizedBox(height: 16),
                    const LinearProgressIndicator(value: 0.28),
                    const SizedBox(height: 8),
                    Text(
                      '2.3 MB of 10 MB used',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 16),
                    _buildQuickActions(context),
                  ],
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildRecentActivityList(BuildContext context) {
    final activities = [
      {
        'title': 'Project Ideas',
        'action': 'Created new note',
        'time': '2 hours ago',
        'icon': Icons.star,
      },
      {
        'title': 'Meeting Notes',
        'action': 'Updated note',
        'time': 'Yesterday',
        'icon': Icons.access_time,
      },
      {
        'title': 'Tasks',
        'action': 'Shared note',
        'time': '2 days ago',
        'icon': Icons.note_add,
      },
    ];

    return ListView.separated(
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
          subtitle: Text('${activity['action']} • ${activity['time']}'),
          onTap: () {},
        ).animate().fadeIn().slideX(
              begin: -0.2,
              delay: Duration(milliseconds: 100 * index),
            );
      },
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        FilledButton.icon(
          icon: const Icon(Icons.note_add),
          label: const Text('Create New Note'),
          onPressed: () => context.push('/notes/new'),
        ).animate().fadeIn().slideY(begin: 0.2),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          icon: const Icon(Icons.folder),
          label: const Text('Manage Collections'),
          onPressed: () => context.push('/collections'),
        ).animate().fadeIn().slideY(begin: 0.2, delay: 100.ms),
      ],
    );
  }
}
