import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Login to WhisperNote',
                    style: Theme.of(context).textTheme.headlineMedium,
                    textAlign: TextAlign.center,
                  ).animate().fadeIn().slideY(begin: -0.2),
                  const SizedBox(height: 32),
                  const TextField(
                    decoration: InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email),
                    ),
                  ).animate().fadeIn().slideX(begin: -0.2, delay: 200.ms),
                  const SizedBox(height: 16),
                  const TextField(
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: Icon(Icons.lock),
                    ),
                  ).animate().fadeIn().slideX(begin: -0.2, delay: 300.ms),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: () => context.go('/dashboard'),
                    child: const Text('Sign In'),
                  ).animate().fadeIn().slideY(begin: 0.2, delay: 400.ms),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => context.go('/signup'),
                    child: const Text('Create Account'),
                  ).animate().fadeIn(delay: 500.ms),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
