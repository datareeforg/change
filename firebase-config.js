// Firebase web-app identifiers are public. Fill these from Firebase Console
// > Project settings > Your apps. Do not put service-account keys here.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: "",
};

export const firebaseConfigured = ["apiKey", "authDomain", "projectId", "appId"]
  .every(key => Boolean(firebaseConfig[key]));
