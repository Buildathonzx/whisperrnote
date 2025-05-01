import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: const Color(0xFFF6FFF6),
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: const Color(0xFF22C55E),
        elevation: 8,
        shadowColor: Colors.green.withOpacity(0.4),
        centerTitle: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
        ),
      ),
      body: Center(
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeOutCubic,
          margin: const EdgeInsets.all(24),
          child: Material(
            elevation: 16,
            shadowColor: Colors.greenAccent.withOpacity(0.25),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              width: 400,
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
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircleAvatar(
                    radius: 48,
                    backgroundColor: Colors.green.shade100,
                    child: const Icon(Icons.person,
                        size: 56, color: Color(0xFF22C55E)),
                  ),
                  const SizedBox(height: 18),
                  Text('Your Name',
                      style: theme.textTheme.titleLarge?.copyWith(
                          color: Colors.green.shade800,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('your.email@example.com',
                      style: theme.textTheme.bodyMedium
                          ?.copyWith(color: Colors.green.shade700)),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF22C55E),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      elevation: 6,
                    ),
                    onPressed: () {},
                    icon: const Icon(Icons.edit, color: Colors.white),
                    label: const Text('Edit Profile',
                        style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
