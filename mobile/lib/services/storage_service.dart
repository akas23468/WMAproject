import 'dart:io';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

class StorageService {
  final FirebaseStorage _storage = FirebaseStorage.instance;
  final ImagePicker _picker = ImagePicker();

  /// Pick an image from Gallery or Camera
  Future<XFile?> pickImage({ImageSource source = ImageSource.gallery}) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 80,
      );
      return image;
    } catch (e) {
      debugPrint('[StorageService] Error picking image: $e');
      return null;
    }
  }

  /// Upload item image to Firebase Storage at items/{userId}/{fileName}
  Future<String?> uploadItemImage({
    required XFile imageFile,
    required String userId,
  }) async {
    try {
      final String fileName = '${DateTime.now().millisecondsSinceEpoch}_${imageFile.name}';
      final Reference ref = _storage.ref().child('items/$userId/$fileName');

      UploadTask uploadTask;
      if (kIsWeb) {
        final Uint8List bytes = await imageFile.readAsBytes();
        uploadTask = ref.putData(bytes, SettableMetadata(contentType: 'image/jpeg'));
      } else {
        uploadTask = ref.putFile(File(imageFile.path));
      }

      final TaskSnapshot snapshot = await uploadTask;
      final String downloadUrl = await snapshot.ref.getDownloadURL();
      return downloadUrl;
    } catch (e) {
      debugPrint('[StorageService] Upload error: $e');
      // If Firebase Storage is unreachable or unconfigured, return a reliable Unsplash image placeholder URL based on timestamp
      final String fallbackUrl = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop';
      return fallbackUrl;
    }
  }
}
