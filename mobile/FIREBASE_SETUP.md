# Firebase Mobile Setup Guide for ReVive

Your Firebase Project is configured with:
- **Project ID**: `revive-e6e3f`
- **Project Number / Sender ID**: `583199476446`
- **Storage Bucket**: `revive-e6e3f.firebasestorage.app`

---

## 1. Register Android App in Firebase Console

1. Open the [Firebase Console](https://console.firebase.google.com/project/revive-e6e3f/overview).
2. Click **Add App** (or the **Android** icon).
3. Set the **Android package name** to:
   ```
   com.example.revive_mobile
   ```
   *(Defined in `mobile/android/app/build.gradle.kts`)*
4. (Optional) Enter App nickname: `ReVive Mobile`.
5. (Optional for Phone/Google Auth) Add your debug SHA-1 fingerprint:
   Run in terminal:
   ```bash
   cd mobile/android
   ./gradlew signingReport
   ```
   Copy the SHA-1 from `debug` and paste it into Firebase Console.
6. Click **Register App** and download `google-services.json`.

---

## 2. Place `google-services.json`

Move the downloaded file to:
```
mobile/android/app/google-services.json
```

---

## 3. Enable Google Services Plugin in Gradle

Once `google-services.json` is in `mobile/android/app/`, enable the plugin in `mobile/android/app/build.gradle.kts`:

Add to the `plugins { ... }` block at the top:
```kotlin
plugins {
    id("com.android.application")
    id("dev.flutter.flutter-gradle-plugin")
    id("com.google.gms.google-services") // <-- Add this line
}
```

Add dependencies at the bottom:
```kotlin
dependencies {
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-auth")
}
```

---

## 4. Mobile Token Exchange Bridge

The ReVive Flutter app's `ApiClient` (`mobile/lib/services/api_client.dart`) is already wired with the token exchange endpoint:

```dart
// After signing in with Firebase (Phone Auth or Google Sign-In):
final String idToken = await firebaseUser.getIdToken();

// Exchange for a ReVive JWT session token:
final result = await ApiClient().verifyFirebaseAuth(idToken);

// The access_token is automatically stored in SharedPreferences!
print('Logged in as: ${result["user"]["name"]} (${result["user"]["role"]})');
```
