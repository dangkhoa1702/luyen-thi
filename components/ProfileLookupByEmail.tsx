import React, { useState } from "react";
import type { Firestore } from "firebase/firestore";
import { getProfileByEmail } from "../lib/userProfile";

export const ProfileLookupByEmail: React.FC<{ db: Firestore }> = ({ db }) => {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSearch = async () => {
    if (!email.trim()) {
      setErr("Vui lòng nhập email.");
      return;
    }
    setErr(null); setProfile(null); setLoading(true);
    try {
      const p = await getProfileByEmail(db, email);
      if (!p) setErr("Không tìm thấy hồ sơ theo email này.");
      else setProfile(p);
    } catch (e: any) {
      console.error("Profile lookup error:", e);
      setErr(e.message || "Lỗi tra cứu hồ sơ.");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 rounded-2xl shadow-lg border dark:border-gray-700 bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Tra cứu Hồ sơ Học sinh</h2>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email học sinh…"
          className="border dark:border-gray-600 px-3 py-2 rounded-lg w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button onClick={onSearch} disabled={loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {loading ? "Đang tìm…" : "Tìm theo email"}
        </button>
      </div>

      {err && <p className="text-red-500 mt-3">{err}</p>}

      {profile && (
        <div className="mt-6 border-t dark:border-gray-700 pt-4">
          <h3 className="font-semibold text-xl mb-2">{profile.displayName || "(Chưa đặt tên)"}</h3>
          <div className="space-y-1 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Lớp:</strong> {profile.class || "—"}</p>
            <p><strong>Vai trò (UI):</strong> {profile.role || "—"}</p>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Hồ sơ học tập</h4>
            <pre className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg overflow-auto text-sm">
              {profile.learningProfile ? JSON.stringify(profile.learningProfile, null, 2) : "Chưa có dữ liệu học tập."}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
