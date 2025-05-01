import 'package:flutter/material.dart';
import 'package:flutter_resizable_container/flutter_resizable_container.dart';
import 'package:go_router/go_router.dart';
import 'dart:convert';
import 'dart:io';
import 'package:path_provider/path_provider.dart';

class ModernSidebar extends StatefulWidget {
  final int selectedIndex;
  final ValueChanged<int> onItemSelected;
  final ResizableController? resizableController;

  const ModernSidebar({
    Key? key,
    required this.selectedIndex,
    required this.onItemSelected,
    this.resizableController,
  }) : super(key: key);

  @override
  State<ModernSidebar> createState() => _ModernSidebarState();
}

class _ModernSidebarState extends State<ModernSidebar> {
  double _lastExpandedWidth = 220;
  String _username = 'guest';

  @override
  void initState() {
    super.initState();
    _loadLastExpandedWidth();
  }

  Future<String> _getConfigPath() async {
    final home = Platform.isWindows
        ? Platform.environment['USERPROFILE']
        : Platform.environment['HOME'];
    final configDir = Directory('$home/.whisperrnote/user/$_username');
    if (!await configDir.exists()) {
      await configDir.create(recursive: true);
    }
    return '${configDir.path}/config.json';
  }

  Future<void> _loadLastExpandedWidth() async {
    try {
      final configPath = await _getConfigPath();
      final file = File(configPath);
      if (await file.exists()) {
        final jsonData = jsonDecode(await file.readAsString());
        setState(() {
          _lastExpandedWidth =
              (jsonData['sidebarWidth'] as num?)?.toDouble() ?? 220;
        });
      }
    } catch (_) {}
  }

  Future<void> _saveLastExpandedWidth(double width) async {
    try {
      final configPath = await _getConfigPath();
      final file = File(configPath);
      Map<String, dynamic> jsonData = {};
      if (await file.exists()) {
        jsonData = jsonDecode(await file.readAsString());
      }
      jsonData['sidebarWidth'] = width;
      await file.writeAsString(jsonEncode(jsonData));
    } catch (_) {}
  }

  void _toggleSidebar(double currentWidth) async {
    if (widget.resizableController != null) {
      final isMin = currentWidth <= 64;
      if (isMin) {
        // Expand to last expanded width
        widget.resizableController!.setSizes([
          ResizableSize.pixels(_lastExpandedWidth, min: 64, max: 320),
          const ResizableSize.expand(),
        ]);
      } else {
        // Save current width before collapsing
        await _saveLastExpandedWidth(currentWidth);
        widget.resizableController!.setSizes([
          const ResizableSize.pixels(64, min: 64, max: 320),
          const ResizableSize.expand(),
        ]);
      }
    }
  }

  void _onNavTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/notes');
        break;
      case 1:
        context.go('/todos');
        break;
      case 2:
        context.go('/tags');
        break;
      case 3:
        context.go('/shared');
        break;
      case 4:
        context.go('/settings');
        break;
    }
    widget.onItemSelected(index);
  }

  @override
  Widget build(BuildContext context) {
    final items = [
      _SidebarItem(icon: Icons.note_rounded, label: 'Notes'),
      _SidebarItem(icon: Icons.check_circle_outline_rounded, label: 'Todos'),
      _SidebarItem(icon: Icons.tag_rounded, label: 'Tags'),
      _SidebarItem(icon: Icons.share, label: 'Shared'),
      _SidebarItem(icon: Icons.settings_rounded, label: 'Settings'),
    ];
    return Container(
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
        child: LayoutBuilder(
          builder: (context, constraints) {
            final currentWidth = constraints.maxWidth;
            final isCollapsed = currentWidth <= 120;
            // Save width on manual resize (if not collapsed)
            if (!isCollapsed && (currentWidth - _lastExpandedWidth).abs() > 1) {
              _lastExpandedWidth = currentWidth;
              _saveLastExpandedWidth(currentWidth);
            }
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(
                      vertical: 24.0, horizontal: 12),
                  child: Row(
                    mainAxisAlignment: isCollapsed
                        ? MainAxisAlignment.center
                        : MainAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        child: const Icon(Icons.person,
                            size: 28, color: Colors.white),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: Icon(currentWidth <= 64
                      ? Icons.chevron_right
                      : Icons.chevron_left),
                  onPressed: () => _toggleSidebar(currentWidth),
                  tooltip: currentWidth <= 64 ? 'Expand' : 'Collapse',
                ),
                const SizedBox(height: 8),
                for (int i = 0; i < items.length; i++)
                  _SidebarTile(
                    icon: items[i].icon,
                    label: items[i].label,
                    selected: widget.selectedIndex == i,
                    expanded: !isCollapsed,
                    onTap: () => _onNavTap(context, i),
                  ),
                const Spacer(),
                _SidebarTile(
                  icon: Icons.logout_rounded,
                  label: 'Logout',
                  selected: false,
                  expanded: !isCollapsed,
                  onTap: () {},
                ),
                const SizedBox(height: 16),
              ],
            );
          },
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
