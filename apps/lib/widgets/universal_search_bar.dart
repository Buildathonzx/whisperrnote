import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../router.dart'; // Import the extension for GoRouter.location

class UniversalSearchBar extends StatefulWidget {
  final void Function(String query, String pageContext)? onSearch;

  const UniversalSearchBar({Key? key, this.onSearch}) : super(key: key);

  @override
  State<UniversalSearchBar> createState() => _UniversalSearchBarState();
}

class _UniversalSearchBarState extends State<UniversalSearchBar> {
  final TextEditingController _controller = TextEditingController();

  String _getHint(BuildContext context) {
    final location = GoRouter.of(context).location;
    if (location.startsWith('/notes')) return 'Search notes...';
    if (location.startsWith('/todos')) return 'Search todos...';
    if (location.startsWith('/tags')) return 'Search tags...';
    if (location.startsWith('/shared')) return 'Search shared notes...';
    if (location.startsWith('/settings')) return 'Search settings...';
    return 'Search...';
  }

  void _onChanged(String value) {
    final location = GoRouter.of(context).location;
    widget.onSearch?.call(value, location);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Material(
        elevation: 2,
        borderRadius: BorderRadius.circular(12),
        child: TextField(
          controller: _controller,
          onChanged: _onChanged,
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.search),
            hintText: _getHint(context),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 14),
          ),
        ),
      ),
    );
  }
}
