import 'package:flutter/material.dart';

class ModernSidebar extends StatefulWidget {
  final int selectedIndex;
  final ValueChanged<int> onItemSelected;

  const ModernSidebar({
    Key? key,
    required this.selectedIndex,
    required this.onItemSelected,
  }) : super(key: key);

  @override
  State<ModernSidebar> createState() => _ModernSidebarState();
}

class _ModernSidebarState extends State<ModernSidebar> {
  bool _expanded = true;

  void _toggleSidebar() {
    setState(() {
      _expanded = !_expanded;
    });
  }

  @override
  Widget build(BuildContext context) {
    final items = [
      _SidebarItem(icon: Icons.home_rounded, label: 'Home'),
      _SidebarItem(icon: Icons.note_rounded, label: 'Notes'),
      _SidebarItem(icon: Icons.add_circle_outline_rounded, label: 'New Note'),
      _SidebarItem(icon: Icons.tag_rounded, label: 'Tags'),
      _SidebarItem(icon: Icons.settings_rounded, label: 'Settings'),
    ];
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: _expanded ? 220 : 72,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(2, 0),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding:
                  const EdgeInsets.symmetric(vertical: 24.0, horizontal: 12),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    child:
                        const Icon(Icons.person, size: 28, color: Colors.white),
                  ),
                  if (_expanded) ...[
                    const SizedBox(width: 12),
                    Text(
                      'WhisperNote',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ]
                ],
              ),
            ),
            IconButton(
              icon: Icon(_expanded ? Icons.chevron_left : Icons.chevron_right),
              onPressed: _toggleSidebar,
              tooltip: _expanded ? 'Collapse' : 'Expand',
            ),
            const SizedBox(height: 8),
            for (int i = 0; i < items.length; i++)
              _SidebarTile(
                icon: items[i].icon,
                label: items[i].label,
                selected: widget.selectedIndex == i,
                expanded: _expanded,
                onTap: () => widget.onItemSelected(i),
              ),
            const Spacer(),
            _SidebarTile(
              icon: Icons.logout_rounded,
              label: 'Logout',
              selected: false,
              expanded: _expanded,
              onTap: () {},
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _SidebarItem {
  final IconData icon;
  final String label;
  const _SidebarItem({required this.icon, required this.label});
}

class _SidebarTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final bool expanded;
  final VoidCallback onTap;

  const _SidebarTile({
    required this.icon,
    required this.label,
    required this.selected,
    required this.expanded,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected
          ? Theme.of(context).colorScheme.primary.withOpacity(0.12)
          : Colors.transparent,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            children: [
              Icon(icon,
                  color:
                      selected ? Theme.of(context).colorScheme.primary : null),
              if (expanded) ...[
                const SizedBox(width: 16),
                Text(
                  label,
                  style: selected
                      ? TextStyle(color: Theme.of(context).colorScheme.primary)
                      : null,
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }
}
