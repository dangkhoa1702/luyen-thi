import {
  Firestore, doc, getDoc, setDoc, serverTimestamp,
  collection, getDocs, limit, query, where
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export type Role = "student" | "teacher" | "admin";

export async function ensureUserProfile(db: Firestore) {
  const u = getAuth().currentUser!;
  const emailLower = (u.email || "").trim().toLowerCase();
  await setDoc(
    doc(db, "users", u.uid),
    {
      email: u.email,
      emailLower,
      displayName: u.displayName || "",
      // Trường 'role' ở doc chỉ phục vụ UI; phân quyền thật dùng custom claims trong rules
      role: "student",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getMyProfile(db: Firestore) {
  const uid = getAuth().currentUser!.uid;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getProfileByEmail(db: Firestore, email: string) {
  const emailLower = email.trim().toLowerCase();
  const q = query(collection(db, "users"), where("emailLower", "==", emailLower), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}
