class WaypointCheckpoint {
  final String title;
  final String description;
  final DateTime timestamp;
  final double latitude;
  final double longitude;
  final String locationName;
  final bool isCompleted;
  final bool isCurrent;

  const WaypointCheckpoint({
    required this.title,
    required this.description,
    required this.timestamp,
    required this.latitude,
    required this.longitude,
    required this.locationName,
    this.isCompleted = false,
    this.isCurrent = false,
  });
}

class ScrapLot {
  final int id;
  final String material;
  final String category;
  final double quantityKg;
  final double estimatedValue;
  String status; // 'created' | 'offers' | 'pickup' | 'handover' | 'paid'
  String syncStatus; // 'SYNCED' | 'PENDING_SYNC' | 'LOCAL_CREATED'
  final DateTime createdAt;
  String? recyclerName;
  double? finalWeightKg;
  String? passportId;
  String? certificateHash;

  // Photo integration
  String? imagePath;

  // Geocoding & Real-time Live Tracking fields
  String pickupAddress;
  double pickupLatitude;
  double pickupLongitude;
  String recyclerAddress;
  double recyclerLatitude;
  double recyclerLongitude;
  String driverName;
  String driverPhone;
  String vehicleNumber;
  String vehicleType;
  String currentTrackingStage; // 'catalogued' | 'dispatched' | 'in_transit' | 'arrived' | 'weighed' | 'settled'
  int estimatedArrivalMinutes;
  double remainingDistanceKm;
  List<WaypointCheckpoint> geocodedWaypoints;

  ScrapLot({
    required this.id,
    required this.material,
    required this.category,
    required this.quantityKg,
    required this.estimatedValue,
    this.status = 'created',
    this.syncStatus = 'SYNCED',
    required this.createdAt,
    this.recyclerName,
    this.finalWeightKg,
    this.passportId,
    this.certificateHash,
    this.imagePath,
    this.pickupAddress = 'Shop #4, Karond Mandi, Bhopal, MP 462038',
    this.pickupLatitude = 23.2599,
    this.pickupLongitude = 77.4126,
    this.recyclerAddress = 'EcoCycle Processing Unit 3, Mandideep Industrial Area, MP',
    this.recyclerLatitude = 23.0760,
    this.recyclerLongitude = 77.5250,
    this.driverName = 'Sunil Kumar (सुनील कुमार)',
    this.driverPhone = '+91 98261 44521',
    this.vehicleNumber = 'MP 04 GA 8821',
    this.vehicleType = 'Tata Ace Electric (E-Cargo)',
    this.currentTrackingStage = 'in_transit',
    this.estimatedArrivalMinutes = 14,
    this.remainingDistanceKm = 3.4,
    List<WaypointCheckpoint>? geocodedWaypoints,
  }) : geocodedWaypoints = geocodedWaypoints ?? [];

  String get displayStatus {
    switch (status) {
      case 'created':
        return 'Catalogued';
      case 'offers':
        return 'Recycler Offers';
      case 'pickup':
        return 'Pickup Scheduled';
      case 'handover':
        return 'Scale Handover';
      case 'paid':
        return 'Settled & Certified';
      default:
        return status;
    }
  }

  bool get isInTransit => status == 'pickup' || (status == 'offers' && recyclerName != null);

  factory ScrapLot.fromBackendJson(Map<String, dynamic> json) {
    final materialMap = json['material'] as Map<String, dynamic>?;
    final handoverMap = json['handover'] as Map<String, dynamic>?;
    final recyclerMap = json['recycler'] as Map<String, dynamic>?;

    final id = json['id'] as int? ?? 0;
    final materialName = materialMap != null
        ? (materialMap['name'] as String? ?? 'E-Waste Item')
        : 'E-Waste Lot #$id';
    final category = materialMap != null
        ? (materialMap['category'] as String? ?? 'Electronic')
        : 'Electronic';

    final quantityKg = (json['quantity_kg'] as num?)?.toDouble() ?? 0.0;
    final estimatedVal = (json['estimated_value'] as num?)?.toDouble() ?? (quantityKg * 400.0);
    final statusStr = json['status'] as String? ?? 'created';

    return ScrapLot(
      id: id,
      material: materialName,
      category: category,
      quantityKg: quantityKg,
      estimatedValue: estimatedVal,
      status: statusStr,
      syncStatus: 'SYNCED',
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ?? DateTime.now(),
      recyclerName: recyclerMap?['name'] as String?,
      finalWeightKg: (handoverMap?['final_weight_kg'] as num?)?.toDouble(),
      passportId: json['lot_reference'] as String? ?? 'REV-2026-LOT-${id.toString().padLeft(4, '0')}',
      imagePath: json['photo_url'] as String?,
    );
  }
}
