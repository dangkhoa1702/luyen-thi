// Chạy: node scripts/set-teacher-claim.mjs <teacherUid>
// Yêu cầu serviceAccount.json ở thư mục gốc.
import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { process } from "node:process";

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(readFileSync("./serviceAccount.json", "utf8")))
});

const uid = process.argv[2];
if (!uid) { console.error("Thiếu UID giáo viên"); process.exit(1); }

await admin.auth().setCustomUserClaims(uid, { role: "teacher" });
console.log("Đã gán role=teacher cho", uid);
process.exit(0);