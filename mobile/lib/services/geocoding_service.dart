import 'dart:math' as math;
import '../models/lot.dart';

class GeoPoint {
  final double latitude;
  final double longitude;
  final String label;

  const GeoPoint({
    required this.latitude,
    required this.longitude,
    required this.label,
  });
}

class GeocodingService {
  // Common e-waste industrial clusters & scrap yards across key hubs
  static const Map<String, GeoPoint> knownHubs = {
    'Bhopal Collector Yard': GeoPoint(
      latitude: 23.2599,
      longitude: 77.4126,
      label: 'Shop #4, Karond Mandi, Bhopal, MP 462038',
    ),
    'EcoCycle Mandideep': GeoPoint(
      latitude: 23.0760,
      longitude: 77.5250,
      label: 'Plot 18-A, Mandideep Industrial Area Phase 2, MP',
    ),
    'Pune MIDC Recycler': GeoPoint(
      latitude: 18.6298,
      longitude: 73.7997,
      label: 'EcoCycle Pune Hub, Bhosari MIDC Sector 7, Pune, MH',
    ),
    'Pune Collector Hub': GeoPoint(
      latitude: 18.5204,
      longitude: 73.8567,
      label: 'Kasba Peth Scrap Aggregation Centre, Pune, MH',
    ),
  };

  /// Calculates real-world Haversine distance in kilometers between two GPS coordinates
  static double calculateDistanceKm(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const earthRadiusKm = 6371.0;
    final dLat = _degreesToRadians(lat2 - lat1);
    final dLon = _degreesToRadians(lon2 - lon1);

    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_degreesToRadians(lat1)) *
            math.cos(_degreesToRadians(lat2)) *
            math.sin(dLon / 2) *
            math.sin(dLon / 2);

    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  static double _degreesToRadians(double degrees) {
    return degrees * (math.pi / 180.0);
  }

  /// Generates authentic realistic route checkpoints for live vehicle simulation
  static List<WaypointCheckpoint> generateRouteCheckpoints({
    required String collectorAddress,
    required double collectorLat,
    required double collectorLon,
    required String recyclerAddress,
    required double recyclerLat,
    required double recyclerLon,
    required String currentStage,
  }) {
    final now = DateTime.now();

    return [
      WaypointCheckpoint(
        title: 'Lot Catalogued & Geotagged',
        description: 'E-Waste lot catalogued with AI camera vision verification',
        timestamp: now.subtract(const Duration(minutes: 95)),
        latitude: collectorLat,
        longitude: collectorLon,
        locationName: collectorAddress,
        isCompleted: true,
      ),
      WaypointCheckpoint(
        title: 'Recycler Matched & Offer Locked',
        description: 'Authorized CPCB recycler accepted lot at verified MSP rate',
        timestamp: now.subtract(const Duration(minutes: 60)),
        latitude: recyclerLat,
        longitude: recyclerLon,
        locationName: recyclerAddress,
        isCompleted: true,
      ),
      WaypointCheckpoint(
        title: 'EV Pickup Vehicle Dispatched',
        description: 'Tata Ace Electric cargo van en-route from regional recycling depot',
        timestamp: now.subtract(const Duration(minutes: 25)),
        latitude: (recyclerLat * 0.7) + (collectorLat * 0.3),
        longitude: (recyclerLon * 0.7) + (collectorLon * 0.3),
        locationName: 'Bhopal-Hoshangabad Highway Toll Point',
        isCompleted: true,
      ),
      WaypointCheckpoint(
        title: 'Vehicle In Transit (Live GPS)',
        description: 'Driver approaching collector scrap yard (Speed: 28 km/h)',
        timestamp: now.subtract(const Duration(minutes: 5)),
        latitude: (recyclerLat * 0.25) + (collectorLat * 0.75),
        longitude: (recyclerLon * 0.25) + (collectorLon * 0.75),
        locationName: 'Berasia Road / Karond Junction (3.4 km away)',
        isCompleted: currentStage == 'in_transit' || currentStage == 'arrived' || currentStage == 'settled',
        isCurrent: currentStage == 'in_transit',
      ),
      WaypointCheckpoint(
        title: 'Scale Handover & Digital Weighing',
        description: 'IoT Bluetooth Scale verification & biometric sign-off',
        timestamp: now.add(const Duration(minutes: 14)),
        latitude: collectorLat,
        longitude: collectorLon,
        locationName: collectorAddress,
        isCompleted: currentStage == 'weighed' || currentStage == 'settled',
        isCurrent: currentStage == 'arrived',
      ),
      WaypointCheckpoint(
        title: 'Depot Receipt & CPCB Digital Passport',
        description: 'Certified safe dismantling and EPR credit ledger minting',
        timestamp: now.add(const Duration(minutes: 75)),
        latitude: recyclerLat,
        longitude: recyclerLon,
        locationName: recyclerAddress,
        isCompleted: currentStage == 'settled',
        isCurrent: currentStage == 'weighed',
      ),
    ];
  }
}
