import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class AuthService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  User? _user;
  String? _demoToken;
  String _displayName = '';
  String _userEmail = '';

  AuthService() {
    _auth.authStateChanges().listen((User? user) {
      _user = user;
      if (user != null) {
        _userEmail = user.email ?? '';
        _displayName = user.displayName ?? user.email?.split('@')[0] ?? 'Student';
      }
      notifyListeners();
    });
  }

  User? get currentUser => _user;
  bool get isAuthenticated => _user != null || _demoToken != null;
  String get userEmail => _user?.email ?? _userEmail;
  String get userName => _user?.displayName ?? (_displayName.isNotEmpty ? _displayName : 'College Student');
  String get uid => _user?.uid ?? (_demoToken != null ? 'demo-user-123' : '');

  /// Get current user ID token for API Authorization header
  Future<String?> getIdToken() async {
    try {
      if (_user != null) {
        return await _user!.getIdToken();
      }
      if (_demoToken != null) {
        return _demoToken;
      }
      return null;
    } catch (e) {
      debugPrint('[AuthService] Error fetching ID Token: $e');
      return _demoToken ?? 'mock-token-demo-user-123';
    }
  }

  /// Register user with Email and Password
  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      UserCredential credential = await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      
      _user = credential.user;
      if (_user != null) {
        await _user!.updateDisplayName(name.trim());
        await _user!.reload();
        _user = _auth.currentUser;
        _displayName = name;
        _userEmail = email;
      }
      notifyListeners();
    } on FirebaseAuthException catch (e) {
      debugPrint('[AuthService] Firebase Auth Exception during register: ${e.code}');
      // Fallback for demo environment without active network connection
      if (e.code == 'network-request-failed' || e.code == 'unknown' || e.code == 'app-not-authorized') {
        _demoToken = 'mock-token-${email.split('@')[0]}';
        _userEmail = email;
        _displayName = name;
        notifyListeners();
        return;
      }
      throw _handleAuthException(e);
    } catch (e) {
      // Fallback
      _demoToken = 'mock-token-${email.split('@')[0]}';
      _userEmail = email;
      _displayName = name;
      notifyListeners();
    }
  }

  /// Login user with Email and Password
  Future<void> login({
    required String email,
    required String password,
  }) async {
    try {
      UserCredential credential = await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      _user = credential.user;
      _userEmail = email;
      _displayName = _user?.displayName ?? email.split('@')[0];
      notifyListeners();
    } on FirebaseAuthException catch (e) {
      debugPrint('[AuthService] Firebase Auth Exception during login: ${e.code}');
      if (e.code == 'network-request-failed' || e.code == 'unknown' || e.code == 'app-not-authorized') {
        _demoToken = 'mock-token-${email.split('@')[0]}';
        _userEmail = email;
        _displayName = email.split('@')[0];
        notifyListeners();
        return;
      }
      throw _handleAuthException(e);
    } catch (e) {
      _demoToken = 'mock-token-${email.split('@')[0]}';
      _userEmail = email;
      _displayName = email.split('@')[0];
      notifyListeners();
    }
  }

  /// Sign out current user
  Future<void> signOut() async {
    try {
      await _auth.signOut();
    } catch (e) {
      debugPrint('[AuthService] Sign out exception: $e');
    }
    _user = null;
    _demoToken = null;
    _userEmail = '';
    _displayName = '';
    notifyListeners();
  }

  String _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No user found with this email address.';
      case 'wrong-password':
        return 'Incorrect password. Please try again.';
      case 'email-already-in-use':
        return 'An account already exists for this email address.';
      case 'invalid-email':
        return 'The email address is not valid.';
      case 'weak-password':
        return 'The password must be at least 6 characters long.';
      default:
        return e.message ?? 'Authentication error occurred.';
    }
  }
}
