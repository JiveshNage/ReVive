import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/lot.dart';
import '../services/geocoding_service.dart';
import '../theme/app_colors.dart';
import '../widgets/handover_payment_dialog.dart';

class LotTrackingScreen extends StatefulWidget {
  final ScrapLot lot;
  final String currentLang;
  final Function(ScrapLot, double)? onConfirmHandover;

  const LotTrackingScreen({
    super.key,
    required this.lot,
    required this.currentLang,
    this.onConfirmHandover,
  });

  @override
  State<LotTrackingScreen> createState() => _LotTrackingScreenState();
}

class _LotTrackingScreenState extends State<LotTrackingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late List<WaypointCheckpoint> waypoints;
  bool isSatelliteMode = false;
  int simulatedEta = 14;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    waypoints = GeocodingService.generateRouteCheckpoints(
      collectorAddress: widget.lot.pickupAddress,
      collectorLat: widget.lot.pickupLatitude,
      collectorLon: widget.lot.pickupLongitude,
      recyclerAddress: widget.lot.recyclerAddress,
      recyclerLat: widget.lot.recyclerLatitude,
      recyclerLon: widget.lot.recyclerLongitude,
      currentStage: widget.lot.currentTrackingStage,
    );
    simulatedEta = widget.lot.estimatedArrivalMinutes;
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _callDriver() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Calling Driver: ${widget.lot.driverName} (${widget.lot.driverPhone})'),
        backgroundColor: AppColors.primaryDark,
      ),
    );
  }

  void _showHandoverDialog() {
    HandoverPaymentDialog.show(
      context,
      lot: widget.lot,
      onComplete: (completedLot, verifiedWeight, paymentMethod, txnId) {
        widget.onConfirmHandover?.call(completedLot, verifiedWeight);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ Handover & $paymentMethod Payment Certified! Txn: $txnId'),
            backgroundColor: const Color(0xFF059669),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F1D38),
        foregroundColor: Colors.white,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Lot #${widget.lot.id} • Live Tracking',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            Text(
              widget.lot.material,
              style: const TextStyle(fontSize: 11, color: Colors.white70),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(
              isSatelliteMode ? Icons.map_outlined : Icons.satellite_alt_rounded,
              color: AppColors.accent,
            ),
            tooltip: 'Toggle Satellite / Road Map',
            onPressed: () => setState(() => isSatelliteMode = !isSatelliteMode),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. INTERACTIVE LIVE MAP ROUTE CANVAS
            Expanded(
              flex: 5,
              child: Stack(
                children: [
                  AnimatedBuilder(
                    animation: _animController,
                    builder: (context, child) {
                      return CustomPaint(
                        painter: LiveRouteMapPainter(
                          progress: _animController.value,
                          isSatellite: isSatelliteMode,
                        ),
                        child: const SizedBox.expand(),
                      );
                    },
                  ),

                  // Top Live Status Tag
                  Positioned(
                    top: 12,
                    left: 14,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(191),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'LIVE GPS TELEMETRY',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Coordinates Badge
                  Positioned(
                    top: 12,
                    right: 14,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(191),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${widget.lot.pickupLatitude.toStringAsFixed(4)}°N, ${widget.lot.pickupLongitude.toStringAsFixed(4)}°E',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 10,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                  ),

                  // Bottom ETA Overlay Banner on Map
                  Positioned(
                    bottom: 12,
                    left: 14,
                    right: 14,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xEB1C2A4A),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.cyanAccent.withAlpha(77)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(102),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.cyanAccent.withAlpha(38),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.electric_bolt_rounded, color: Colors.cyanAccent, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      'ETA: $simulatedEta MINS',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w900,
                                        fontSize: 13,
                                        letterSpacing: 0.3,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    const Text('•', style: TextStyle(color: Colors.white38)),
                                    const SizedBox(width: 6),
                                    Text(
                                      '${widget.lot.remainingDistanceKm} km away',
                                      style: const TextStyle(color: Colors.cyanAccent, fontSize: 12),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                const Text(
                                  'Speed: 28 km/h • Zero-Emission EV Pickup',
                                  style: TextStyle(color: Colors.white60, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 2. BOTTOM DETAILS & GEOCODED AUDIT TRAIL
            Expanded(
              flex: 6,
              child: Container(
                decoration: const BoxDecoration(
                  color: Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(24),
                    topRight: Radius.circular(24),
                  ),
                ),
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // DRIVER & VEHICLE CARD
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(8),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              const CircleAvatar(
                                radius: 24,
                                backgroundColor: AppColors.primaryContainer,
                                child: Text('🚛', style: TextStyle(fontSize: 22)),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          widget.lot.driverName,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                        ),
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFDCFCE7),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: const Text(
                                            'CPCB VERIFIED',
                                            style: TextStyle(
                                              fontSize: 8.5,
                                              fontWeight: FontWeight.w800,
                                              color: Color(0xFF166534),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${widget.lot.vehicleType} • ${widget.lot.vehicleNumber}',
                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                    ),
                                    const SizedBox(height: 2),
                                    const Row(
                                      children: [
                                        Icon(Icons.star_rounded, color: Colors.amber, size: 14),
                                        SizedBox(width: 2),
                                        Text('4.9 (124 successful pickups)', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                onPressed: _callDriver,
                                icon: const Icon(Icons.phone_in_talk_rounded, color: AppColors.primary),
                                style: IconButton.styleFrom(
                                  backgroundColor: AppColors.primaryContainer,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: _callDriver,
                                  icon: const Icon(Icons.chat_bubble_outline_rounded, size: 14),
                                  label: const Text('Driver Chat', style: TextStyle(fontSize: 12)),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: _showHandoverDialog,
                                  icon: const Icon(Icons.scale_rounded, size: 14),
                                  label: const Text('Scale Handover', style: TextStyle(fontSize: 12)),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    backgroundColor: AppColors.primaryDark,
                                    foregroundColor: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // PICKUP ADDRESS & GEOCODED HUB CARD
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.pin_drop_rounded, color: Colors.redAccent, size: 18),
                              SizedBox(width: 6),
                              Text('Collector Scrap Yard', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                          Padding(
                            padding: const EdgeInsets.only(left: 24, top: 2),
                            child: Text(
                              widget.lot.pickupAddress,
                              style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                            ),
                          ),
                          const Divider(height: 16),
                          const Row(
                            children: [
                              Icon(Icons.factory_rounded, color: AppColors.primary, size: 18),
                              SizedBox(width: 6),
                              Text('Destination Recycler Facility', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                          Padding(
                            padding: const EdgeInsets.only(left: 24, top: 2),
                            child: Text(
                              widget.lot.recyclerAddress,
                              style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),

                    // GEOCODED AUDIT TIMELINE
                    const Row(
                      children: [
                        Icon(Icons.history_rounded, size: 16, color: AppColors.primaryDark),
                        SizedBox(width: 6),
                        Text(
                          'Geocoded Audit Trail & Traceability',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    ...List.generate(waypoints.length, (idx) {
                      final wp = waypoints[idx];
                      final isLast = idx == waypoints.length - 1;

                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Left Icon & Line
                          Column(
                            children: [
                              Container(
                                width: 22,
                                height: 22,
                                decoration: BoxDecoration(
                                  color: wp.isCompleted
                                      ? const Color(0xFF059669)
                                      : wp.isCurrent
                                          ? Colors.cyan
                                          : Colors.grey.shade300,
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: wp.isCompleted
                                      ? const Icon(Icons.check, size: 13, color: Colors.white)
                                      : wp.isCurrent
                                          ? const Icon(Icons.sync, size: 13, color: Colors.white)
                                          : Text('${idx + 1}', style: const TextStyle(fontSize: 10, color: Colors.black54)),
                                ),
                              ),
                              if (!isLast)
                                Container(
                                  width: 2,
                                  height: 44,
                                  color: wp.isCompleted ? const Color(0xFF059669) : Colors.grey.shade300,
                                ),
                            ],
                          ),
                          const SizedBox(width: 12),
                          // Content
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(bottom: 14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          wp.title,
                                          style: TextStyle(
                                            fontSize: 12.5,
                                            fontWeight: wp.isCurrent ? FontWeight.w800 : FontWeight.bold,
                                            color: wp.isCurrent ? Colors.cyan.shade900 : AppColors.textPrimary,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        DateFormat('hh:mm a').format(wp.timestamp),
                                        style: const TextStyle(fontSize: 10, color: AppColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    wp.description,
                                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '📍 ${wp.locationName}',
                                    style: const TextStyle(fontSize: 10, color: Color(0xFF0284C7), fontWeight: FontWeight.w500),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      );
                    }),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Custom Canvas Painter for realistic road route and vehicle telemetry animation
class LiveRouteMapPainter extends CustomPainter {
  final double progress;
  final bool isSatellite;

  LiveRouteMapPainter({
    required this.progress,
    required this.isSatellite,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()
      ..color = isSatellite ? const Color(0xFF0E1A2B) : const Color(0xFF141F36);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Grid lines for geospatial authenticity
    final gridPaint = Paint()
      ..color = Colors.white.withAlpha(10)
      ..strokeWidth = 1;

    for (double x = 0; x < size.width; x += 40) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 40) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // Curving Highway route from Recycler (bottom-right) to Collector (top-left)
    final path = Path();
    final start = Offset(size.width * 0.82, size.height * 0.78); // Recycler depot
    final ctrl1 = Offset(size.width * 0.75, size.height * 0.45);
    final ctrl2 = Offset(size.width * 0.35, size.height * 0.55);
    final end = Offset(size.width * 0.22, size.height * 0.22); // Collector scrap yard

    path.moveTo(start.dx, start.dy);
    path.cubicTo(ctrl1.dx, ctrl1.dy, ctrl2.dx, ctrl2.dy, end.dx, end.dy);

    // Highway road backdrop
    final roadPaint = Paint()
      ..color = const Color(0xFF2E3D5C)
      ..strokeWidth = 10
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(path, roadPaint);

    // Route active glow line
    final routePaint = Paint()
      ..color = const Color(0xFF00E5FF)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(path, routePaint);

    // START POINT: Recycler Facility Marker
    final recyclerPinPaint = Paint()..color = const Color(0xFF10B981);
    canvas.drawCircle(start, 9, recyclerPinPaint);
    canvas.drawCircle(start, 4, Paint()..color = Colors.white);

    // END POINT: Collector Scrap Yard Pin with pulse
    final pulseRadius = 12 + (math.sin(progress * 2 * math.pi) * 4);
    final pulsePaint = Paint()
      ..color = Colors.redAccent.withAlpha(77)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawCircle(end, pulseRadius, pulsePaint);

    final collectorPinPaint = Paint()..color = Colors.redAccent;
    canvas.drawCircle(end, 9, collectorPinPaint);
    canvas.drawCircle(end, 4, Paint()..color = Colors.white);

    // MOVING VEHICLE POSITION
    // Sample curve at (0.35 + 0.35 * progress) to show moving truck
    final t = 0.30 + (progress * 0.40);
    final vehiclePos = _evaluateCubic(start, ctrl1, ctrl2, end, t);

    // Vehicle glow
    canvas.drawCircle(
      vehiclePos,
      14,
      Paint()..color = Colors.cyanAccent.withAlpha(89),
    );

    // Vehicle body
    canvas.drawCircle(
      vehiclePos,
      8,
      Paint()..color = Colors.cyanAccent,
    );
    canvas.drawCircle(
      vehiclePos,
      3,
      Paint()..color = const Color(0xFF0B132B),
    );
  }

  Offset _evaluateCubic(Offset p0, Offset p1, Offset p2, Offset p3, double t) {
    final u = 1 - t;
    final tt = t * t;
    final uu = u * u;
    final uuu = uu * u;
    final ttt = tt * t;

    final x = uuu * p0.dx + 3 * uu * t * p1.dx + 3 * u * tt * p2.dx + ttt * p3.dx;
    final y = uuu * p0.dy + 3 * uu * t * p1.dy + 3 * u * tt * p2.dy + ttt * p3.dy;
    return Offset(x, y);
  }

  @override
  bool shouldRepaint(covariant LiveRouteMapPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.isSatellite != isSatellite;
  }
}
