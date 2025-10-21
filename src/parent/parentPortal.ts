/** Parent Portal – Đăng ký theo dõi bằng Gmail + Báo cáo tuần có cảnh báo thông minh. */
import { loadAttempts, computeTopicStats, computeSubjectMastery, labelOf } from "../profile/logic";
import { loadCurrentPlan } from "../plan/planUtils";

export type Subscription = {
  id: string;
  parentEmail: string;  // Gmail phụ huynh
  childEmail: string;   // Gmail học sinh
  token: string;        // để tạo link chia sẻ /progress/{token}
  createdAt: number;
  isEnabled: boolean;
};

const KEY_SUBS = "ai.parent.subscriptions.v1";
const EMAIL_GMAIL = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

const randToken = (n=16) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n))).map(x=>(x%36).toString(36)).join("");

function readSubs(): Subscription[] {
  try { return JSON.parse(localStorage.getItem(KEY_SUBS) || "[]") as Subscription[]; } catch { return []; }
}
function saveSubs(arr: Subscription[]) { localStorage.setItem(KEY_SUBS, JSON.stringify(arr)); }

export function listSubscriptions() { return readSubs(); }
export function removeSubscription(id: string) { saveSubs(readSubs().filter(s => s.id !== id)); }

export function subscribeParent(parentEmail: string, childEmail: string) {
  if (!EMAIL_GMAIL.test(parentEmail) || !EMAIL_GMAIL.test(childEmail)) {
    throw new Error("Vui lòng nhập đúng địa chỉ Gmail (định dạng @gmail.com).");
  }
  const subs = readSubs();
  const exist = subs.find(s => s.parentEmail === parentEmail && s.childEmail === childEmail);
  if (exist) return exist;

  const sub: Subscription = {
    id: `sub-${Date.now()}`,
    parentEmail, childEmail,
    token: randToken(20),
    createdAt: Date.now(),
    isEnabled: true,
  };
  subs.push(sub); saveSubs(subs);
  return sub;
}

/* ==================== BÁO CÁO TUẦN VÀ CẢNH BÁO ==================== */
type TopicStatLite = { topic: string; accuracy: number; trend?: number; attempts: number; subject: string };

export type WeeklyDigest = {
  childEmail: string;
  rangeLabel: string;
  minutesThisWeek: number;
  minutesTarget: number;
  accuracy7d: number;
  accuracyChange: number;   // so với tuần trước (điểm %)
  mastery: { subject: string; accuracy: number }[];
  strengths: TopicStatLite[];
  weaknesses: TopicStatLite[];
  alerts: { level: "red"|"yellow"; text: string }[];
  actions: string[];        // gợi ý phụ huynh
};

export function buildWeeklyDigest(childEmail: string): WeeklyDigest {
  // Lưu ý: bản local dùng dữ liệu “thiết bị hiện tại” như dữ liệu của con.
  const atts = loadAttempts(); // có: correct, timeSpentSec, timestamp, subject, topic
  const times = atts.map(a => a.timestamp);
  
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 3600 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 3600 * 1000;

  const thisWeekAtts = atts.filter(a => a.timestamp >= sevenDaysAgo);
  const prevWeekAtts = atts.filter(a => a.timestamp < sevenDaysAgo && a.timestamp >= fourteenDaysAgo);

  const acc7 = thisWeekAtts.length > 0
    ? Math.round(100 * thisWeekAtts.filter(a => a.correct).length / thisWeekAtts.length)
    : 0;

  const accPrev = prevWeekAtts.length > 0
    ? Math.round(100 * prevWeekAtts.filter(a => a.correct).length / prevWeekAtts.length)
    : acc7; // If no previous data, assume no change

  const minutesThisWeek = Math.round(thisWeekAtts.reduce((s, a) => s + (a.timeSpentSec || 0), 0) / 60);

  // Mục tiêu phút/tuần lấy từ Kế hoạch (nếu có), mặc định 100’
  const plan = loadCurrentPlan();
  const minutesTarget = plan ? plan.daysPerWeek * plan.minutesPerDay : 100;

  const mastery = computeSubjectMastery(atts).map(m => ({ subject: labelOf(m.subject), accuracy: Math.round(m.accuracy * 100) }));
  const topics = computeTopicStats(atts);

  const strengths = topics
    .filter(t => t.accuracy >= 0.8 && t.attempts >= 3)
    .sort((a, b) => (b.accuracy - a.accuracy))
    .slice(0, 3)
    .map(t => ({ topic: t.topic, accuracy: Math.round(t.accuracy * 100), trend: t.trend ?? undefined, attempts: t.attempts, subject: labelOf(t.subject) }));

  const weaknesses = topics
    .filter(t => t.accuracy < 0.6 || (t.trend != null && t.trend < 0 && t.accuracy < 0.75))
    .sort((a, b) => (a.accuracy - b.accuracy) || b.attempts - a.attempts)
    .slice(0, 3)
    .map(t => ({ topic: t.topic, accuracy: Math.round(t.accuracy * 100), trend: t.trend ?? undefined, attempts: t.attempts, subject: labelOf(t.subject) }));

  // Cảnh báo thông minh
  const alerts: WeeklyDigest["alerts"] = [];
  const delta = acc7 - accPrev;
  if (thisWeekAtts.length === 0) alerts.push({ level: "red", text: "Tuần này chưa có hoạt động luyện tập." });
  else if (delta <= -5) alerts.push({ level: "red", text: `Xu hướng giảm ${Math.abs(delta)} điểm so với tuần trước.` });
  
  if (minutesThisWeek < minutesTarget * 0.6) alerts.push({ level: "yellow", text: `Thời lượng học thấp (${minutesThisWeek}’ so với mục tiêu ${minutesTarget}’/tuần).` });
  if (acc7 > 0 && acc7 < 60) alerts.push({ level: "yellow", text: `Độ chính xác 7 ngày gần nhất ở mức ${acc7}%.` });


  // Gợi ý hành động cho phụ huynh
  const actions: string[] = [];
  if (alerts.find(a => a.level === "red")) actions.push("Động viên con làm 1 buổi luyện đề trọn vẹn (30–45’), hoàn thành đúng kế hoạch.");
  if (minutesThisWeek < minutesTarget) actions.push(`Sắp xếp thời gian để đạt ≥ ${minutesTarget}’/tuần (ví dụ 5 buổi × ${Math.round(minutesTarget / 5)} phút).`);
  if (weaknesses.length) actions.push(`Nhắc con dùng tính năng “Ôn ngay” các chủ đề yếu: ${weaknesses.map(w => w.topic).join(", ")}.`);
  if (!actions.length) actions.push("Khen ngợi tiến bộ, duy trì thói quen học tập và luyện 1 đề tổng hợp vào cuối tuần.");

  return {
    childEmail,
    rangeLabel: "7 ngày gần nhất",
    minutesThisWeek, minutesTarget,
    accuracy7d: acc7, accuracyChange: delta,
    mastery, strengths, weaknesses, alerts, actions
  };
}

/* ==================== MAILTO (GỬI EMAIL) & LINK CHIA SẺ ==================== */
export function buildMailtoFromDigest(parentEmail: string, d: WeeklyDigest) {
  const subj = encodeURIComponent(`[Báo cáo tuần] Tiến bộ học tập của ${d.childEmail}`);
  const body = encodeURIComponent(
`Chào phụ huynh,

Báo cáo ${d.rangeLabel} của ${d.childEmail}:
- Thời lượng: ${d.minutesThisWeek}’ / mục tiêu ${d.minutesTarget}’
- Độ chính xác: ${d.accuracy7d}% (${d.accuracyChange >= 0 ? "+" : ""}${d.accuracyChange} điểm so với tuần trước)
- Điểm mạnh: ${d.strengths.map(s => s.topic).join(", ") || "—"}
- Cần cải thiện: ${d.weaknesses.map(w => w.topic).join(", ") || "—"}

Cảnh báo: ${d.alerts.map(a => a.text).join(" | ") || "Không có"}

Đề nghị phụ huynh:
${d.actions.map(a => "- " + a).join("\n")}

(Email tạo tự động từ Ứng dụng AI hỗ trợ ôn thi vào lớp 10.)
`);
  return `mailto:${parentEmail}?subject=${subj}&body=${body}`;
}

export function buildShareLink(token: string) {
  const origin = (window as any).location?.origin || "";
  return `${origin}/progress/${token}`;
}
