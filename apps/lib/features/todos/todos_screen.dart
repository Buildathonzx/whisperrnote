import 'package:flutter/material.dart';
import '../../modern_sidebar.dart';
import '../../modern_bottom_bar.dart';
import '../../search_bar.dart' as custom_search;

class TodosScreen extends StatefulWidget {
  const TodosScreen({Key? key}) : super(key: key);

  @override
  State<TodosScreen> createState() => _TodosScreenState();
}

class _TodosScreenState extends State<TodosScreen> {
  int _selectedIndex = 1; // 1 for Todos

  void _onSidebarItemSelected(int index) {
    setState(() {
      _selectedIndex = index;
    });
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
