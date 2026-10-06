# Practical No. 12: Web and Mobile Application Development Report

## Project Title: Campus Lost & Found Mobile Application

---

### 1. INTRODUCTION
The **Campus Lost & Found** mobile application is a comprehensive cross-platform system designed to streamline the reporting, tracking, and recovery of lost personal items across a college campus. Built using Flutter for the mobile user interface and Node.js with Express and Firebase Admin SDK for the backend REST API, the application allows students and campus personnel to register, submit lost or found item reports with images, search through posted reports, filter by item category or status, and contact item finders directly.

---

### 2. MOTIVATION
In modern educational institutions, thousands of students, faculty, and staff commute daily across lecture halls, laboratories, libraries, auditoriums, and cafeterias. Items such as smartphones, identity cards, wallets, keys, notebooks, and bags are frequently misplaced. Traditional recovery mechanisms—such as physical notice boards, verbal inquiries, or unorganized group messaging chats—lack central searching, verification, and automated item tracking. This application was developed to address these inefficiencies by offering a centralized, secure, searchable, and accessible mobile solution.

---

### 3. OBJECTIVES
1. Develop a user-friendly, responsive mobile interface using **Flutter (Material 3)**.
2. Implement secure user authentication using **Firebase Authentication** (Email/Password).
3. Build a high-performance RESTful API using **Node.js** and **Express.js** to handle item operations.
4. Integrate **Firebase Cloud Firestore** via **Firebase Admin SDK** for persistent document storage.
5. Use **Firebase Storage** for cloud hosting of item images captured from camera or gallery.
6. Enforce security middleware using Firebase ID tokens (`Authorization: Bearer <token>`) so that item creation, editing, and deletion are restricted to authenticated owners.
7. Provide real-time search, category filtering, pull-to-refresh, and full CRUD capability.
8. Prepare the backend for Render cloud deployment and generate a production-ready Release APK.

---

### 4. RESOURCES USED

#### Hardware Resources:
- Computer System (Windows 11 OS, 16 GB RAM, x64 Architecture)
- Android Physical Smartphone / Emulator (Android 10+, API Level 29+)

#### Software & Frameworks:
- **Frontend Framework**: Flutter SDK (v3.29.0), Dart SDK (v3.7.0)
- **Backend Framework**: Node.js (v24.16.0), Express.js (v5.2.1)
- **Database & Cloud Services**: Firebase Cloud Firestore, Firebase Authentication, Firebase Storage, Firebase Admin SDK (v14.5.0)
- **Development Tools**: VS Code / Android Studio, Postman API Platform, Git, PowerShell

---

### 5. ALGORITHM

#### Algorithm 1: User Authentication Flow
1. User launches application.
2. App checks Firebase Auth current state (`AuthService`).
3. If user session exists:
   - Navigate directly to `HomeScreen`.
4. If no session exists:
   - Display `LoginScreen`.
   - On selecting Register: Prompt user for Name, Email, Password. Register via `createUserWithEmailAndPassword`. Create user profile document in Firestore collection `users/{uid}`.
   - On selecting Login: Authenticate via `signInWithEmailAndPassword`. Obtain Firebase ID Token.

#### Algorithm 2: Item Reporting Flow (Add Item)
1. User navigates to `AddItemScreen`.
2. User enters Item Name, Description, Category, Status (Lost/Found), Location, Date, and Contact Info.
3. User selects image using `image_picker` (Camera/Gallery).
4. Application uploads image file to Firebase Storage under path: `items/{userId}/{fileName}`.
5. Storage returns public HTTP download URL.
6. Mobile app retrieves user's Firebase ID Token (`getIdToken()`).
7. Mobile app sends HTTP `POST` request to `/api/items` with Bearer token in header and JSON payload.
8. Express backend `authMiddleware` verifies Firebase ID Token with Firebase Admin SDK.
9. Backend saves item document into Firestore `items` collection.
10. Backend returns `201 Created` JSON response.
11. Mobile app displays success message and updates `HomeScreen` list.

---

### 6. FLOWCHART DESCRIPTION & DIAGRAM

```
                     START
                       │
             Open Application
                       │
          Check Authentication State
                       │
                 Logged In? ─────── NO ───────► Login / Register Screen
                       │                              │
                      YES ◄───────────────────────────┘
                       │
                   Home Screen
           (View / Search / Filter Items)
                       │
                Report New Item? ─── YES ───► Fill Item Details
                       │                            │
                      NO                       Select Image
                       │                            │
                       │                 Upload to Firebase Storage
                       │                            │
                       │                    Get Image Download URL
                       │                            │
                       │                   Send HTTP POST /api/items
                       │                       (Bearer Token Header)
                       │                            │
                       │                  Verify Token via Firebase Admin
                       │                            │
                       │                     Save Record to Firestore
                       │                            │
                       ├────────────────────────────┘
                       │
              Item Details & Actions
                       │
                 Edit / Delete? ─── YES ───► Verify Owner UID ──► Update/Delete Firestore
                       │
                      NO
                       │
                    Logout? ─────── YES ───► Clear Session ──► Login Screen
                       │
                      END
```

---

### 7. LIST OF OUTPUT SCREENSHOTS TO CAPTURE FOR REPORT

Include the following screenshots in your final report document:

1. **Login Screen**: Displaying email, password fields, password toggle, and Login/Register buttons.
2. **Register Screen**: Registration form with Full Name, Email, Password, and Confirm Password.
3. **Home Screen (Dashboard)**: Displaying top title bar, search bar, filter chips (All, Lost, Found), and item card feed.
4. **Search & Filter Action**: Real-time filtering results when searching for a specific item (e.g., "AirPods" or "Library").
5. **Add Item Screen**: Form input fields with Category and Status dropdowns.
6. **Image Picker & Preview**: Selecting an image from gallery/camera and showing preview box.
7. **Item Details Screen**: Large image banner, status chip, category badge, location, date, description, and contact info.
8. **Owner Edit Item Screen**: Editing an existing report with pre-filled fields.
9. **Delete Confirmation Dialog**: Dialog box prompting user before removing report.
10. **Profile Screen**: User name, email ID, My Reports button, and Logout button.
11. **My Reports Screen**: Filtered view showing items created by the logged-in user.
12. **Postman - GET /api/health**: Successful HTTP 200 response.
13. **Postman - GET /api/items**: Successful HTTP 200 JSON list of items.
14. **Postman - POST /api/items**: Creating a new report with `Authorization: Bearer <token>` header.
15. **Postman - PUT & DELETE /api/items/:id**: Updating and deleting item records via API.
16. **Firebase Console (Authentication)**: Displaying registered user entries.
17. **Firebase Console (Firestore & Storage)**: Displaying `items` collection and uploaded images in `items/` bucket.

---

### 8. CONCLUSION
The **Campus Lost & Found** mobile application successfully satisfies all requirements of Practical No. 12 for Web and Mobile Application Development. By combining Flutter's modern UI capabilities with a Node.js Express REST API and Firebase backend services (Authentication, Firestore, Storage, and Firebase Admin SDK), the application provides a scalable, secure, and user-centric platform for campus item recovery.
