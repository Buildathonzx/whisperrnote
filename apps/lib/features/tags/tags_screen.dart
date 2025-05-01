import 'package:flutter/material.dart';

class TagsScreen extends StatelessWidget {
  const TagsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text(
          'Tags',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
      ),
    );
  }
}
