import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/item.dart';

class ApiService extends ChangeNotifier {
  // Configurable base URL
  // Default for Android Emulator is http://10.0.2.2:5000
  // Default for Web/Desktop/iOS Simulator is http://localhost:5000
  static String baseUrl = kIsWeb
      ? 'http://localhost:5000/api'
      : (defaultTargetPlatform == TargetPlatform.android
          ? 'http://10.0.2.2:5000/api'
          : 'http://localhost:5000/api');

  List<Item> _items = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Item> get items => _items;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  /// GET /api/health
  Future<bool> checkHealth() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/health')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['success'] == true;
      }
      return false;
    } catch (e) {
      debugPrint('[ApiService] Health check failed: $e');
      return false;
    }
  }

  /// GET /api/items
  Future<List<Item>> getItems({String? status, String? category, String? search}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      Uri uri = Uri.parse('$baseUrl/items');
      Map<String, String> queryParams = {};
      if (status != null && status.isNotEmpty && status != 'All') {
        queryParams['status'] = status;
      }
      if (category != null && category.isNotEmpty && category != 'All') {
        queryParams['category'] = category;
      }
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      if (queryParams.isNotEmpty) {
        uri = uri.replace(queryParameters: queryParams);
      }

      final response = await http.get(uri).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['items'] != null) {
          final List rawList = data['items'];
          _items = rawList.map((jsonItem) => Item.fromJson(jsonItem)).toList();
        } else {
          _items = [];
        }
      } else {
        _errorMessage = 'Server returned status ${response.statusCode}';
      }
    } catch (e) {
      debugPrint('[ApiService] getItems error: $e');
      _errorMessage = 'Failed to connect to backend REST API: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }

    return _items;
  }

  /// GET /api/items/:id
  Future<Item?> getItem(String id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/items/$id'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['item'] != null) {
          return Item.fromJson(data['item']);
        }
      }
      return null;
    } catch (e) {
      debugPrint('[ApiService] getItem error: $e');
      return null;
    }
  }

  /// POST /api/items
  Future<Item?> createItem({
    required Item item,
    required String? idToken,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/items'),
        headers: {
          'Content-Type': 'application/json',
          if (idToken != null) 'Authorization': 'Bearer $idToken',
        },
        body: json.encode(item.toJson()),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['item'] != null) {
          final newItem = Item.fromJson(data['item']);
          _items.insert(0, newItem);
          notifyListeners();
          return newItem;
        }
      } else {
        final data = json.decode(response.body);
        throw Exception(data['message'] ?? 'Failed to create item');
      }
    } catch (e) {
      debugPrint('[ApiService] createItem error: $e');
      rethrow;
    }
    return null;
  }

  /// PUT /api/items/:id
  Future<Item?> updateItem({
    required String id,
    required Item item,
    required String? idToken,
  }) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/items/$id'),
        headers: {
          'Content-Type': 'application/json',
          if (idToken != null) 'Authorization': 'Bearer $idToken',
        },
        body: json.encode(item.toJson()),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['item'] != null) {
          final updated = Item.fromJson(data['item']);
          final index = _items.indexWhere((i) => i.id == id);
          if (index != -1) {
            _items[index] = updated;
          }
          notifyListeners();
          return updated;
        }
      } else {
        final data = json.decode(response.body);
        throw Exception(data['message'] ?? 'Failed to update item');
      }
    } catch (e) {
      debugPrint('[ApiService] updateItem error: $e');
      rethrow;
    }
    return null;
  }

  /// DELETE /api/items/:id
  Future<bool> deleteItem({
    required String id,
    required String? idToken,
  }) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/items/$id'),
        headers: {
          'Content-Type': 'application/json',
          if (idToken != null) 'Authorization': 'Bearer $idToken',
        },
      );

      if (response.statusCode == 200) {
        _items.removeWhere((item) => item.id == id);
        notifyListeners();
        return true;
      } else {
        final data = json.decode(response.body);
        throw Exception(data['message'] ?? 'Failed to delete item');
      }
    } catch (e) {
      debugPrint('[ApiService] deleteItem error: $e');
      rethrow;
    }
  }
}
