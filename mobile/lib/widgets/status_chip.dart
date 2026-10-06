import 'package:flutter/material.dart';

class StatusChip extends StatelessWidget {
  final String status;
  final bool isCompact;

  const StatusChip({
    super.key,
    required this.status,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    final bool isLost = status.toLowerCase() == 'lost';
    final Color bgColor = isLost
        ? const Color(0xFFFFEBEB)
        : const Color(0xFFE6F4EA);
    final Color textColor = isLost
        ? const Color(0xFFD93025)
        : const Color(0xFF137333);
    final IconData icon = isLost ? Icons.search_rounded : Icons.check_circle_rounded;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 8 : 12,
        vertical: isCompact ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: textColor.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: isCompact ? 12 : 16,
            color: textColor,
          ),
          const SizedBox(width: 4),
          Text(
            status.toUpperCase(),
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.bold,
              fontSize: isCompact ? 11 : 12,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
