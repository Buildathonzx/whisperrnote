import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:go_router/go_router.dart';

class NoteDetailScreen extends StatefulWidget {
  final String noteId;

  const NoteDetailScreen({super.key, required this.noteId});

  @override
  State<NoteDetailScreen> createState() => _NoteDetailScreenState();
}

class _NoteDetailScreenState extends State<NoteDetailScreen> {
  bool _isEditing = false;
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _tagController = TextEditingController();
  List<String> _tags = [];

  @override
  void initState() {
    super.initState();
    // TODO: Load note data
    _titleController.text = 'Sample Note';
    _contentController.text =
        '# Sample Note\n\nThis is a sample note content...';
    _tags = ['sample', 'demo'];
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _tagController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: _isEditing
            ? TextField(
                controller: _titleController,
                style: Theme.of(context).textTheme.titleLarge,
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  hintText: 'Note Title',
                ),
              )
            : Text(_titleController.text),
        actions: [
          IconButton(
            icon: Icon(_isEditing ? Icons.save : Icons.edit),
            onPressed: () => setState(() => _isEditing = !_isEditing),
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // TODO: Implement share
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: () {
              // TODO: Implement delete
              context.pop();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Tags Section
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Tags', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    ..._tags.map((tag) => Chip(
                          label: Text(tag),
                          onDeleted: _isEditing
                              ? () {
                                  setState(() => _tags.remove(tag));
                                }
                              : null,
                        )),
                    if (_isEditing)
                      SizedBox(
                        width: 120,
                        child: TextField(
                          controller: _tagController,
                          decoration: const InputDecoration(
                            hintText: 'Add tag',
                            isDense: true,
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 8,
                            ),
                          ),
                          onSubmitted: (value) {
                            if (value.isNotEmpty && !_tags.contains(value)) {
                              setState(() {
                                _tags.add(value);
                                _tagController.clear();
                              });
                            }
                          },
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ).animate().slideY(begin: -0.2).fadeIn(),

          // Content Section
          Expanded(
            child: _isEditing
                ? Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: TextField(
                      controller: _contentController,
                      maxLines: null,
                      expands: true,
                      textAlignVertical: TextAlignVertical.top,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: 'Start writing...',
                      ),
                    ),
                  )
                : Markdown(
                    data: _contentController.text,
                    selectable: true,
                    padding: const EdgeInsets.all(16.0),
                  ),
          ).animate().slideY(begin: 0.2).fadeIn(),
        ],
      ),
      floatingActionButton: _isEditing
          ? FloatingActionButton(
              onPressed: () {
                // TODO: Save note
                setState(() => _isEditing = false);
              },
              child: const Icon(Icons.save),
            ).animate().scale()
          : null,
    );
  }
}
