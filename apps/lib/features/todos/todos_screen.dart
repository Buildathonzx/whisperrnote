import 'package:flutter/material.dart';
import '../../search_bar.dart' as custom_search;

class TodosScreen extends StatelessWidget {
  const TodosScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          custom_search.SearchBar(
            hintText: 'Search todos...',
            onSearch: (query) {
              // TODO: Implement search logic for todos
            },
          ),
          const SizedBox(height: 8),
          Expanded(
            child: Center(
              child: Text(
                'Todos',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
