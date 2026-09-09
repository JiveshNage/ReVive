class AuthorizedRecycler {
  final int id;
  final String name;
  final String licenseNo;
  final String location;
  final double rating;
  final bool verified;
  final String acceptedMaterials;
  final double offerRate;
  final String phone;

  AuthorizedRecycler({
    required this.id,
    required this.name,
    required this.licenseNo,
    required this.location,
    required this.rating,
    required this.verified,
    required this.acceptedMaterials,
    required this.offerRate,
    this.phone = '+91 98765 40003',
  });
}
