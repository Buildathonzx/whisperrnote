import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

class Collection {
  final String id;
  final String name;
  final int noteCount;
  final DateTime lastUpdated;
  final IconData icon;

  Collection({
    required this.id,
    required this.name,
    required this.noteCount,
    required this.lastUpdated,
    this.icon = Icons.folder,
  });
}

class CollectionsScreen extends StatelessWidget {
  const CollectionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // Temporary data
    final collections = [
      Collection(
        id: '1',
        name: 'Work',
        noteCount: 15,
        lastUpdated: DateTime.now().subtract(const Duration(hours: 2)),
        icon: Icons.work,
      ),
      Collection(
        id: '2',
        name: 'Personal',
        noteCount: 8,
        lastUpdated: DateTime.now().subtract(const Duration(days: 1)),
        icon: Icons.person,
      ),
      Collection(
        id: '3',
        name: 'Projects',
        noteCount: 12,
        lastUpdated: DateTime.now().subtract(const Duration(days: 3)),
        icon: Icons.folder_special,
      ),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF6FFF6),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: collections.map((collection) {
          return AnimatedContainer(
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
                    Row(
                      children: [
                        Icon(collection.icon,
                            size: 32,
                            color: Theme.of(context).colorScheme.primary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            collection.name,
                            style: theme.textTheme.titleLarge?.copyWith(
                                color: Colors.green.shade800,
                                fontWeight: FontWeight.bold),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        PopupMenuButton(
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: 'rename',
                              child: Text('Rename'),
                            ),
                            const PopupMenuItem(
                              value: 'share',
                              child: Text('Share'),
                            ),
                            const PopupMenuItem(
                              value: 'delete',
                              child: Text('Delete'),
                              textStyle: TextStyle(color: Colors.red),
                            ),
                          ],
                          onSelected: (value) {
                            // TODO: Handle menu actions
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '${collection.noteCount} notes',
                      style: theme.textTheme.bodyMedium
                          ?.copyWith(color: Colors.green.shade700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Last updated: ${_formatDate(collection.lastUpdated)}',
                      style: theme.textTheme.bodySmall
                          ?.copyWith(color: Colors.green.shade700),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateCollectionDialog(context),
        child: const Icon(Icons.create_new_folder),
      ).animate().scale(delay: 500.ms),
    );
  }

  Future<void> _showCreateCollectionDialog(BuildContext context) {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Collection'),
        content: TextField(
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Collection Name',
            hintText: 'Enter collection name',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => context.pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              // TODO: Create collection
              context.pop();
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        return '${difference.inMinutes} minutes ago';
      }
      return '${difference.inHours} hours ago';
    }
    if (difference.inDays == 1) {
      return 'Yesterday';
    }
    return '${date.day}/${date.month}/${date.year}';
  }
}

class CollectionCard extends StatelessWidget {
  final Collection collection;

  const CollectionCard({super.key, required this.collection});

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push('/collections/${collection.id}'),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(collection.icon,
                      size: 32, color: Theme.of(context).colorScheme.primary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      collection.name,
                      style: Theme.of(context).textTheme.titleLarge,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  PopupMenuButton(
                    itemBuilder: (context) => [
                      const PopupMenuItem(
                        value: 'rename',
                        child: Text('Rename'),
                      ),
                      const PopupMenuItem(
                        value: 'share',
                        child: Text('Share'),
                      ),
                      const PopupMenuItem(
                        value: 'delete',
                        child: Text('Delete'),
                        textStyle: TextStyle(color: Colors.red),
                      ),
                    ],
                    onSelected: (value) {
                      // TODO: Handle menu actions
                    },
                  ),
                ],
              ),
              const Spacer(),
              Text(
                '${collection.noteCount} notes',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 4),
              Text(
                'Last updated: ${_formatDate(collection.lastUpdated)}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
