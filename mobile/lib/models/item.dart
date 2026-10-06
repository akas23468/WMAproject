class Item {
  final String id;
  final String name;
  final String description;
  final String category;
  final String status; // 'Lost' or 'Found'
  final String location;
  final String date;
  final String contact;
  final String imageUrl;
  final String userId;
  final String createdAt;
  final String updatedAt;

  Item({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.status,
    required this.location,
    required this.date,
    required this.contact,
    required this.imageUrl,
    required this.userId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Item.fromJson(Map<String, dynamic> json, {String? docId}) {
    return Item(
      id: docId ?? json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'Other',
      status: json['status'] ?? 'Lost',
      location: json['location'] ?? '',
      date: json['date'] ?? '',
      contact: json['contact'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      userId: json['userId'] ?? '',
      createdAt: json['createdAt'] ?? '',
      updatedAt: json['updatedAt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'status': status,
      'location': location,
      'date': date,
      'contact': contact,
      'imageUrl': imageUrl,
      'userId': userId,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  Item copyWith({
    String? id,
    String? name,
    String? description,
    String? category,
    String? status,
    String? location,
    String? date,
    String? contact,
    String? imageUrl,
    String? userId,
    String? createdAt,
    String? updatedAt,
  }) {
    return Item(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      category: category ?? this.category,
      status: status ?? this.status,
      location: location ?? this.location,
      date: date ?? this.date,
      contact: contact ?? this.contact,
      imageUrl: imageUrl ?? this.imageUrl,
      userId: userId ?? this.userId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
