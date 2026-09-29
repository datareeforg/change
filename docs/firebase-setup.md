# Google sign-in and Firestore setup

The browser integration uses Firebase Authentication for Google sign-in and Cloud Firestore for private Change Passport records. The four web identifiers in `firebase-config.js` are public Firebase app configuration, not a service-account key.

1. Create a Firebase project for each environment. Register a web app and copy its `apiKey`, `authDomain`, `projectId`, and `appId` into `firebase-config.js`. Use a separate config for production before publishing.
2. In Firebase Authentication, enable the Google provider. Add each actual app hostname to **Authentication → Settings → Authorized domains**. New Firebase projects may need `localhost` added explicitly for local testing. A production domain must use HTTPS.
3. Create a Firestore database. Publish `firestore.rules` through the Firebase console, or use `firebase deploy --only firestore:rules` with `firebase.json` after selecting the intended Firebase project. Deploy rules before allowing sign-in.
4. Open the site on an authorized hostname. **Continue with Google** creates `users/{firebaseUid}`. Editing the passport writes private fields there. A chosen slug is reserved atomically in `slugs/{slug}`. Sign-out removes the account's browser cache. An existing device draft can be imported explicitly from the account screen.
5. Check first and returning sign-in, popup cancellation, sign-out, account switching, profile persistence across browsers, a taken slug, a guest read of `users/{uid}`, and a different user's read or write. The Firestore emulator can run the rules tests before production.

Google sign-in currently protects the Firestore passport only. The existing `server.js` still relies on Websim identity headers and D1/Blob bindings, and Vercel does not expose it as a function. To connect missions, learning, WhatsApp, uploads, and administration to the Firebase account, deploy compatible API functions, send a Firebase ID token with protected requests, verify it server-side, derive the Firebase UID from that verification, and enforce server-side roles. Websim D1 visitor-created rows must retain Websim `user_id` attribution for moderation; Firebase-only users should write to Firestore or a production backend with its own deletion process.

Custom avatar uploads still use the Websim upload path. The Firebase passport can display the Google account photo or an existing uploaded image URL; Firebase-only custom avatar storage needs a separate upload integration and access rules.

For mobile, this integration currently uses the popup flow. If redirect sign-in is needed, configure a same-origin Firebase Auth helper according to [Firebase's redirect guidance](https://firebase.google.com/docs/auth/web/redirect-best-practices) before enabling it.

References: [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin), [Firestore rules](https://firebase.google.com/docs/firestore/security/get-started), [ID-token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens).
