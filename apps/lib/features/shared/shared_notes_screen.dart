import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class SharedNotesScreen extends StatefulWidget {
  const SharedNotesScreen({super.key});

  @override
  State<SharedNotesScreen> createState() => _SharedNotesScreenState();
}

class _SharedNotesScreenState extends State<SharedNotesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _inviteEmailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _inviteEmailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shared Notes'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Shared with me'),
            Tab(text: 'Shared by me'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _SharedWithMeTab(),
          _SharedByMeTab(),
        ],
      ),
    );
  }
}

class _SharedWithMeTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 2,
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      child: Text(['AS', 'BJ'][index]),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ['Team Project Notes', 'Meeting Minutes'][index],
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          Text(
                            'Shared by ${[
                              'Alice Smith',
                              'Bob Johnson'
                            ][index]} • ${['2 days ago', 'Yesterday'][index]}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    TextButton.icon(
                      icon: const Icon(Icons.copy),
                      label: const Text('Copy'),
                      onPressed: () {
                        // TODO: Implement copy
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ).animate().fadeIn().slideX(begin: -0.2, delay: (100 * index).ms);
      },
    );
  }
}

class _SharedByMeTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 2,
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ['Project Guidelines', 'Research Notes'][index],
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Shared ${['1 week ago', '3 days ago'][index]}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.share),
                      onPressed: () {
                        // TODO: Implement share
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  children: [
                    Chip(
                      avatar: const Icon(Icons.public, size: 16),
                      label: Text(
                        index == 0 ? 'Public' : 'Private',
                        style: TextStyle(
                          color: index == 0
                              ? Theme.of(context).colorScheme.onPrimary
                              : null,
                        ),
                      ),
                      backgroundColor: index == 0
                          ? Theme.of(context).colorScheme.primary
                          : null,
                    ),
                    ...(['Team A', 'Team B'][index].split(', ')).map(
                      (team) => Chip(label: Text(team)),
                    ),
                    ActionChip(
                      avatar: const Icon(Icons.person_add, size: 16),
                      label: const Text('Invite'),
                      onPressed: () {
                        // TODO: Show invite dialog
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ).animate().fadeIn().slideX(begin: -0.2, delay: (100 * index).ms);
      },
    );
  }
}
