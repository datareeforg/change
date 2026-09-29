import { firebaseConfig, firebaseConfigured } from "./firebase-config.js";

const SDK_VERSION = "12.19.0";
let services = null;
let initialization = null;
let currentUser = null;

export { firebaseConfigured };
export function accountUser() { return currentUser; }

async function initialize() {
  if (!firebaseConfigured) throw new Error("Firebase is not configured yet.");
  if (services) return services;
  if (!initialization) initialization = (async () => {
    const [appSdk, authSdk, storeSdk] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`),
    ]);
    const app = appSdk.initializeApp(firebaseConfig);
    services = { auth: authSdk.getAuth(app), db: storeSdk.getFirestore(app), authSdk, storeSdk };
    return services;
  })().catch(error => { initialization = null; throw error; });
  return initialization;
}

export async function observeAccount(callback) {
  const { auth, authSdk } = await initialize();
  return authSdk.onAuthStateChanged(auth, async user => {
    currentUser = user;
    try {
      if (user) await ensureUserDocument(user);
      if (currentUser !== user) return;
      callback(user, null);
    } catch (error) {
      if (currentUser !== user) return;
      callback(user, error);
    }
  }, error => callback(null, error));
}

export function signInWithGoogle() {
  if (!services) throw new Error("Google sign-in is still loading. Please try again.");
  const { auth, authSdk } = services;
  const provider = new authSdk.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return authSdk.signInWithPopup(auth, provider);
}

export async function signOutAccount() {
  const { auth, authSdk } = await initialize();
  await authSdk.signOut(auth);
}

export async function accountIdToken() {
  return currentUser ? currentUser.getIdToken() : null;
}

async function ensureUserDocument(user) {
  const { db, storeSdk } = await initialize();
  const ref = storeSdk.doc(db, "users", user.uid);
  await storeSdk.runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) return;
    transaction.set(ref, {
      uid: user.uid,
      email: user.email || "",
      display_name: user.displayName || "",
      photo_url: user.photoURL || "",
      created_at: storeSdk.serverTimestamp(),
      updated_at: storeSdk.serverTimestamp(),
    });
  });
}

export async function readAccountProfile() {
  if (!currentUser) return null;
  const { db, storeSdk } = await initialize();
  const snapshot = await storeSdk.getDoc(storeSdk.doc(db, "users", currentUser.uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function isProfileSlugAvailable(slug) {
  if (!currentUser) return false;
  if (!slug) return true;
  const { db, storeSdk } = await initialize();
  const snapshot = await storeSdk.getDoc(storeSdk.doc(db, "slugs", slug));
  return !snapshot.exists() || snapshot.data().uid === currentUser.uid;
}

const PROFILE_FIELDS = [
  "display_name", "slug", "continent", "country", "city", "bio", "languages",
  "availability", "participation", "birth_month", "birth_year", "avatar_url",
  "referred_by_user_id", "skills", "interests",
];

export async function saveAccountProfile(input) {
  if (!currentUser) throw new Error("Sign in to save your profile.");
  const { db, storeSdk } = await initialize();
  const uid = currentUser.uid;
  const userRef = storeSdk.doc(db, "users", uid);
  const data = Object.fromEntries(PROFILE_FIELDS.map(key => [key, input[key] ?? (key === "skills" || key === "interests" ? [] : "")]));
  const newSlug = String(data.slug || "");
  if (newSlug && !/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(newSlug)) throw new Error("Use a slug of 3–40 lowercase letters, numbers, or hyphens.");
  await storeSdk.runTransaction(db, async transaction => {
    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists()) throw new Error("Your account is still starting. Try again.");
    const oldSlug = String(userSnapshot.data().slug || "");
    const newSlugRef = newSlug ? storeSdk.doc(db, "slugs", newSlug) : null;
    const oldSlugRef = oldSlug && oldSlug !== newSlug ? storeSdk.doc(db, "slugs", oldSlug) : null;
    const newSlugSnapshot = newSlugRef ? await transaction.get(newSlugRef) : null;
    const oldSlugSnapshot = oldSlugRef ? await transaction.get(oldSlugRef) : null;
    if (newSlugSnapshot?.exists() && newSlugSnapshot.data().uid !== uid) throw new Error("That profile slug is already taken.");
    transaction.update(userRef, { ...data, updated_at: storeSdk.serverTimestamp() });
    if (newSlugRef && !newSlugSnapshot?.exists()) transaction.set(newSlugRef, { uid });
    if (oldSlugRef && oldSlugSnapshot?.data().uid === uid) transaction.delete(oldSlugRef);
  });
  return readAccountProfile();
}
