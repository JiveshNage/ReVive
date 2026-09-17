import 'package:flutter/material.dart';
import '../models/lot.dart';
import '../models/recycler.dart';
import '../theme/app_colors.dart';
import '../services/speech_service.dart';

class RecyclersScreen extends StatefulWidget {
  final String currentLang;
  final List<AuthorizedRecycler> recyclers;
  final List<ScrapLot> lots;
  final VoidCallback onOpenScanner;
  final Function(ScrapLot lot, AuthorizedRecycler recycler)? onSendLotToRecycler;

  const RecyclersScreen({
    super.key,
    required this.currentLang,
    required this.recyclers,
    this.lots = const [],
    required this.onOpenScanner,
    this.onSendLotToRecycler,
  });

  @override
  State<RecyclersScreen> createState() => _RecyclersScreenState();
}

class _RecyclersScreenState extends State<RecyclersScreen> {
  String selectedFilter = 'all';
  final TextEditingController searchController = TextEditingController();
  String searchQuery = '';

  @override
  void dispose() {
    SpeechService().stop();
    searchController.dispose();
    super.dispose();
  }


  void _openSendLotSheet(AuthorizedRecycler recycler) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.outbox_rounded, color: AppColors.primary, size: 22),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Send Lot to Recycler',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      Text(
                        'Destination: ${recycler.name}',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Select an already-created lot from your scrap yard to send:',
              style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 12),

            // Existing Lots List
            if (widget.lots.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Text('No catalogued lots found in your scrap inventory.'),
                ),
              )
            else
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.4,
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: widget.lots.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, idx) {
                    final lot = widget.lots[idx];
                    final isAlreadyAssigned = lot.recyclerName == recycler.name;

                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isAlreadyAssigned ? const Color(0xFFF0FDF4) : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isAlreadyAssigned ? const Color(0xFF86EFAC) : AppColors.border,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: AppColors.surfaceMuted,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Center(child: Text('📦', style: TextStyle(fontSize: 18))),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      'Lot #${lot.id} · ${lot.category}',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                    ),
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: AppColors.surfaceMuted,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        lot.displayStatus,
                                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${lot.quantityKg} kg · ₹ ${lot.estimatedValue.toStringAsFixed(0)}',
                                  style: const TextStyle(fontSize: 11.5, color: AppColors.primary, fontWeight: FontWeight.bold),
                                ),
                                if (lot.recyclerName != null)
                                  Text(
                                    'Currently with: ${lot.recyclerName}',
                                    style: const TextStyle(fontSize: 10, color: Color(0xFF0284C7)),
                                  ),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.of(ctx).pop();
                              widget.onSendLotToRecycler?.call(lot, recycler);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('✓ Lot #${lot.id} assigned & sent to ${recycler.name}!'),
                                  backgroundColor: const Color(0xFF059669),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF059669),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                            child: Text(isAlreadyAssigned ? 'Resend' : 'Send This Lot'),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () {
                Navigator.of(ctx).pop();
                widget.onOpenScanner();
              },
              icon: const Icon(Icons.add_a_photo_rounded, size: 16),
              label: const Text('+ Scan & Create New Scrap Lot'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Filter by both Category and Search Query
    final filtered = widget.recyclers.where((r) {
      final matchesCategory = selectedFilter == 'all' ||
          r.acceptedMaterials.toLowerCase().contains(selectedFilter.toLowerCase());

      final query = searchQuery.trim().toLowerCase();
      final matchesQuery = query.isEmpty ||
          r.name.toLowerCase().contains(query) ||
          r.location.toLowerCase().contains(query) ||
          r.licenseNo.toLowerCase().contains(query) ||
          r.acceptedMaterials.toLowerCase().contains(query);

      return matchesCategory && matchesQuery;
    }).toList();

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

          // SEARCH BAR (Requested feature)
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(8),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextField(
              controller: searchController,
              decoration: InputDecoration(
                hintText: 'Search recycler by name, city, license, or scrap type...',
                hintStyle: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 20),
                suffixIcon: searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18, color: Colors.grey),
                        onPressed: () {
                          searchController.clear();
                          setState(() => searchQuery = '');
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
              onChanged: (val) => setState(() => searchQuery = val),
            ),
          ),

          const SizedBox(height: 12),

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

          const SizedBox(height: 14),

          // Results count header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Showing ${filtered.length} of ${widget.recyclers.length} Recyclers',
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
              ),
              if (searchQuery.isNotEmpty || selectedFilter != 'all')
                GestureDetector(
                  onTap: () {
                    searchController.clear();
                    setState(() {
                      searchQuery = '';
                      selectedFilter = 'all';
                    });
                  },
                  child: const Text(
                    'Reset Filters',
                    style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 12),

          if (filtered.isEmpty)
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Center(
                child: Column(
                  children: [
                    const Text('🔍', style: TextStyle(fontSize: 32)),
                    const SizedBox(height: 8),
                    const Text(
                      'No matching recyclers found',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Try searching for "Pune", "Bhopal", "EcoCycle", or "PCB"',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                  ],
                ),
              ),
            )
          else
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
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
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
                  onPressed: () => _openSendLotSheet(r),
                  icon: const Icon(Icons.bolt_rounded, size: 16),
                  label: const Text('Send Lot'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
