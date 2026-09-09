import 'package:flutter/material.dart';
import '../models/recycler.dart';
import '../theme/app_colors.dart';

class RecyclersScreen extends StatefulWidget {
  final String currentLang;
  final List<AuthorizedRecycler> recyclers;
  final VoidCallback onOpenScanner;

  const RecyclersScreen({
    super.key,
    required this.currentLang,
    required this.recyclers,
    required this.onOpenScanner,
  });

  @override
  State<RecyclersScreen> createState() => _RecyclersScreenState();
}

class _RecyclersScreenState extends State<RecyclersScreen> {
  String selectedFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final filtered = selectedFilter == 'all'
        ? widget.recyclers
        : widget.recyclers.where((r) => r.acceptedMaterials.toLowerCase().contains(selectedFilter.toLowerCase())).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Authorized CPCB Recyclers',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const Text(
            'Government registered e-waste recycling & dismantling centers',
            style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
          ),

          const SizedBox(height: 14),

          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _filterChip('All Facilities', 'all'),
                _filterChip('PCB Boards', 'pcb'),
                _filterChip('Li-Ion Batteries', 'batteries'),
                _filterChip('Copper & Wire', 'copper'),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Recycler Cards List
          ...filtered.map((r) => _recyclerCard(r)),
        ],
      ),
    );
  }

  Widget _filterChip(String label, String key) {
    final bool isSelected = selectedFilter == key;
    return GestureDetector(
      onTap: () => setState(() => selectedFilter = key),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _recyclerCard(AuthorizedRecycler r) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  r.name,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.verified, size: 13, color: AppColors.primary),
                    SizedBox(width: 4),
                    Text('CPCB Verified', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text('📍 ${r.location}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 4),
          Text('License: ${r.licenseNo}', style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: AppColors.textMuted)),

          const SizedBox(height: 10),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.inventory_2_outlined, size: 14, color: AppColors.primary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Accepts: ${r.acceptedMaterials}',
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Calling ${r.name} (${r.phone})...')),
                    );
                  },
                  icon: const Icon(Icons.phone_rounded, size: 16),
                  label: const Text('Call Facility'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: widget.onOpenScanner,
                  icon: const Icon(Icons.bolt_rounded, size: 16),
                  label: const Text('Send Lot'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
