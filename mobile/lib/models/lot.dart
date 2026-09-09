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
  });

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
}
