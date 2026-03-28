import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserRole, UserProfile } from "../types";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  // Check if user profile exists
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      role: UserRole.ADMIN, // Default to admin for testing so all tabs are visible
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", user.uid), profile);
  } else {
    // Upgrade existing civilian users to admin for testing purposes
    const data = userDoc.data() as UserProfile;
    if (data.role === UserRole.CIVILIAN) {
      await setDoc(doc(db, "users", user.uid), { role: UserRole.ADMIN }, { merge: true });
    }
  }
  
  return user;
}

export async function logout() {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    const data = userDoc.data() as UserProfile;
    // Treat civilian as admin temporarily to unlock the UI for the demo
    if (data.role === UserRole.CIVILIAN) {
      data.role = UserRole.ADMIN;
    }
    return data;
  }
  return null;
}
