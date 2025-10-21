import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export function useAuthRole() {
  const [role, setRole] = useState<"teacher" | "student" | "admin" | "unknown">("unknown");
  useEffect(() => {
    const auth = getAuth();
    const unsub = auth.onIdTokenChanged(async (u) => {
      if (!u) { setRole("unknown"); return; }
      const tok = await u.getIdTokenResult(true);
      const claimRole = (tok.claims.role as string) || (tok.claims.admin ? "admin" : "student");
      setRole((claimRole === "teacher" || claimRole === "admin") ? claimRole as any : "student");
    });
    return () => unsub();
  }, []);
  return role;
}
