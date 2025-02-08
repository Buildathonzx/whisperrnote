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
      appBar: AppBar(
        title: const Text('Collections'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Implement search
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final crossAxisCount = switch (constraints.maxWidth) {
              > 1200 => 4,
              > 800 => 3,
              > 600 => 2,
              _ => 1,
            };

            return GridView.builder(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.2,
              ),
              itemCount: collections.length,
              itemBuilder: (context, index) {
                final collection = collections[index];
                return CollectionCard(collection: collection)
                    .animate()
                    .fadeIn(delay: (100 * index).ms)
                    .slideY(begin: 0.2);
              },
            );
          },
        ),
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
}

class CollectionCard extends StatelessWidget {
  final Collection collection;

  const CollectionCard({super.key, required this.collection});

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
