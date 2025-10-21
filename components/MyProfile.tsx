import React, { useEffect, useState } from "react";
import type { Firestore } from "firebase/firestore";
import { getMyProfile } from "../lib/userProfile";

export const MyProfile: React.FC<{ db: Firestore }> = ({ db }) => {
  const [me, setMe] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyProfile(db);
        setMe(p); 
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [db]);

  if (loading) return <p className="text-center p-4">Đang tải hồ sơ…</p>;
  if (!me) return <p className="text-center p-4">Chưa có hồ sơ. Vui lòng đăng xuất, đăng nhập lại và thử làm một bài kiểm tra để tạo dữ liệu.</p>;

  return (
    <div className="border dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Hồ sơ của tôi</h2>
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <p><strong>Email:</strong> {me.email}</p>
        <p><strong>Lớp:</strong> {me.class || "—"}</p>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Hồ sơ học tập</h3>
        <pre className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg overflow-auto text-sm">
          {me.learningProfile ? JSON.stringify(me.learningProfile, null, 2) : "Chưa có dữ liệu học tập."}
        </pre>
      </div>
    </div>
  );
}
