/** Logic độc lập cho Hồ sơ học tập — CHỈ dùng trong trang profile */

export type Attempt = {
  id: string;
  subject: string;   // "toan", "ngu-van", ...
  topic: string;     // tên chủ đề
  correct: boolean;
  difficulty?: "E" | "M" | "H";
  timeSpentSec?: number;
  timestamp: number; // ms
};

const KEY = "ai.learning.attempts.v1";
const STREAK_KEY = "ai.learning.streak.v1";
const GOAL_KEY = "ai.learning.goalMin.v1";

/** Nhãn môn học mặc định (có thể override bằng (window as any).__SUBJECT_LABELS ) */
const defaultLabels: Record<string, string> = {
  "toan": "Toán", "ngu-van": "Ngữ văn", "tieng-anh": "Tiếng Anh", "vat-li": "Vật lí",
  "hoa-hoc": "Hoá học", "sinh-hoc": "Sinh học", "lich-su": "Lịch sử", "dia-li": "Địa lí",
  "tin-hoc": "Tin học", "tieng-phap": "Tiếng Pháp"
};
export function labelOf(subjectId: string) {
  const map = (window as any).__SUBJECT_LABELS as Record<string,string> | undefined;
  return (map && map[subjectId]) || defaultLabels[subjectId] || subjectId;
}

/* ===================== BỘ CHỦ ĐỀ CHUẨN ÔN THI VÀO 10 ===================== */
export const SYLLABUS_TOPICS: Record<string, string[]> = {
  "toan": [
    "Căn bậc hai – biến đổi", "Phương trình bậc nhất", "Hệ phương trình 2 ẩn",
    "Bất phương trình đơn giản", "Hàm số y=ax+b – đồ thị", "Hàm số y=ax^2 – parabol",
    "Tam giác đồng dạng", "Hệ thức lượng trong tam giác vuông",
    "Đường tròn: góc nội tiếp – tiếp tuyến", "Bài toán thực tế (tỉ lệ, năng suất, chuyển động)"
  ],
  "ngu-van": [
    "Đọc hiểu văn bản (phong cách, phương thức, biện pháp tu từ)",
    "Tiếng Việt: từ loại – câu – liên kết", "Viết đoạn NLXH 200 chữ",
    "Nghị luận văn học: thơ hiện đại", "Nghị luận văn học: truyện hiện đại",
    "Mở bài – Kết bài – Liên kết đoạn", "So sánh – liên hệ tác phẩm",
    "Chính tả – dùng từ – đặt câu", "Phong cách lập luận – dẫn chứng", "Luyện đề tổng hợp"
  ],
  "tieng-anh": [
    "Tenses: Present/Past/Present perfect", "Comparatives & Superlatives",
    "Passive Voice", "Reported Speech", "Conditional (Type 1–2)",
    "Relative Clauses", "Modal Verbs", "Gerund/Infinitive",
    "Vocabulary: School/Environment/Technology", "Reading & Error finding"
  ],
  "vat-li": [
    "Định luật Ôm", "Mạch nối tiếp – song song", "Công suất – điện năng – an toàn điện",
    "Từ trường – nam châm điện (cơ bản)", "Gương phẳng – gương cầu",
    "Thấu kính hội tụ/phân kì – công thức thấu kính", "Ảnh của vật qua thấu kính",
    "Khúc xạ – phản xạ ánh sáng", "Màu sắc – ứng dụng", "Tổng hợp điện – quang"
  ],
  "hoa-hoc": [
    "Cấu tạo nguyên tử – bảng tuần hoàn", "Phản ứng hóa học – cân bằng PTHH",
    "Oxit – Axit – Bazơ – Muối", "Dung dịch – nồng độ (CM, C%)",
    "Kim loại – dãy hoạt động – phản ứng với axit", "Phi kim – halogen – oxi",
    "Tính toán mol – bảo toàn khối lượng", "Hiđrocabbon cơ bản",
    "Rượu etylic – axit axetic", "Tổng hợp vô cơ + hữu cơ cơ bản"
  ],
  "sinh-hoc": [
    "ADN – NST – Gen", "Nguyên phân – Giảm phân", "Quy luật Menđen",
    "Đột biến gen – NST", "Liên kết gen – tương tác gen (nhận biết)",
    "Quần thể – quần xã – hệ sinh thái", "Chuỗi & lưới thức ăn",
    "Vệ sinh di truyền – tư vấn", "Tiến hóa – bằng chứng", "Ôn tập tổng hợp"
  ],
  "lich-su": [
    "Việt Nam 1858–1918", "Việt Nam 1919–1930", "Cách mạng 1930–1945",
    "Kháng chiến 1945–1954", "1954–1975", "1975–2000",
    "Thế giới sau 1945", "ASEAN – hội nhập", "Nhân vật & mốc thời gian", "Tổng hợp"
  ],
  "dia-li": [
    "Tự nhiên Việt Nam", "Khí hậu – sông ngòi – đất – sinh vật",
    "Dân cư – đô thị – lao động", "Công nghiệp – năng lượng – chế biến",
    "Nông lâm ngư nghiệp", "Dịch vụ – du lịch – giao thông",
    "Vùng kinh tế trọng điểm", "Đọc/nhận xét biểu đồ (cột/đường/tròn/miền)",
    "Thực hành Atlat Địa lí Việt Nam", "Kinh tế vùng: ĐBSH, ĐBSCL, Đông Nam Bộ, Tây Nguyên"
  ],
  "tin-hoc": [
    "Hệ điều hành – tệp – thư mục", "Đường dẫn tương đối/tuyệt đối",
    "Phần mở rộng tệp – kiểu tệp", "Thiết bị vào/ra/lưu trữ",
    "Soạn thảo: định dạng – chèn hình", "Bảng tính: SUM/AVERAGE/IF/COUNTIF",
    "Internet – tìm kiếm – an toàn số", "Ứng xử mạng xã hội",
    "Thuật toán cơ bản – lưu đồ", "Lập trình nhập môn (Scratch/Python)"
  ],
  "tieng-phap": [
    "Alphabet – chào hỏi – tự giới thiệu", "Mạo từ xác định/không xác định/partitif",
    "Giống – số – tính từ", "Thì hiện tại: -er, être, avoir, aller, faire",
    "Phủ định ne…pas", "Sở hữu (adj./pron.)", "Giới từ thường gặp",
    "Thời gian – ngày tháng – thời tiết", "Câu hỏi (est-ce que/inversion)", "Đọc hiểu A1–A2"
  ]
};

/** Bật chế độ lọc nghiêm ngặt: chỉ tính các chủ đề thuộc SYLLABUS lớp 9 → thi 10 */
const STRICT_SYLLABUS_MODE = true;

/* ============== Lưu / đọc / tạo dữ liệu mẫu (đã dùng SYLLABUS_TOPICS) ============== */
export function loadAttempts(): Attempt[] {
  const raw = localStorage.getItem(KEY);
  try { return raw ? JSON.parse(raw) as Attempt[] : []; } catch { return []; }
}
export function saveAttempts(atts: Attempt[]) { localStorage.setItem(KEY, JSON.stringify(atts)); }

export function seedDemoIfEmpty() {
  const cur = loadAttempts(); if (cur.length) return;
  const now = Date.now(); const topics = SYLLABUS_TOPICS;
  const subs = Object.keys(topics);
  const pick = <T,>(a:T[])=>a[Math.floor(Math.random()*a.length)];
  const demo: Attempt[] = [];
  for (let d=14; d>=0; d--) {
    const day = now - d*24*3600*1000;
    for (const s of subs) {
      const n = 2 + Math.floor(Math.random()*3);
      for (let i=0;i<n;i++) {
        const t = pick(topics[s]);
        demo.push({
          id: `${day}-${s}-${i}`,
          subject: s, topic: t,
          correct: Math.random() < (0.6 + (s==="toan"?0.1:0)),
          difficulty: pick(["E","M","H"] as const),
          timeSpentSec: 20 + Math.floor(Math.random()*70),
          timestamp: day + Math.floor(Math.random()*3600_000),
        });
      }
    }
  }
  saveAttempts(demo);
}

export function addTodaySamples() {
  const atts = loadAttempts(); const now = Date.now();
  const topics = SYLLABUS_TOPICS; const subs = Object.keys(topics);
  const pick = <T,>(a:T[])=>a[Math.floor(Math.random()*a.length)];
  for (let i=0;i<20;i++) {
    const s = pick(subs); const t = pick(topics[s]);
    atts.push({
      id:`${now}-${i}`, subject:s, topic:t,
      correct:Math.random()>0.4, difficulty:pick(["E","M","H"] as const),
      timeSpentSec:20+Math.floor(Math.random()*80), timestamp: now - Math.floor(Math.random()*3600_000)
    });
  }
  saveAttempts(atts);
}

/* ===================== Bộ trợ giúp lọc theo SYLLABUS ===================== */
function isSyllabusTopic(subject: string, topic: string) {
  const list = SYLLABUS_TOPICS[subject] || [];
  return list.includes(topic);
}
function filterToSyllabus(atts: Attempt[]) {
  if (!STRICT_SYLLABUS_MODE) return { list: atts, ignored: 0 };
  const list = atts.filter(a => isSyllabusTopic(a.subject, a.topic));
  return { list, ignored: atts.length - list.length };
}

/* ===================== Gom nhóm & thống kê ===================== */
function groupBy<T, K extends string>(arr: T[], key: (x:T)=>K): Record<K,T[]> {
  return arr.reduce((acc, v) => { const k = key(v); (acc[k] ||= [] as T[]).push(v); return acc; }, {} as Record<K,T[]>);
}

export function computeSubjectMastery(atts: Attempt[]) {
  const { list } = filterToSyllabus(atts);
  const bySub = groupBy(list, a => a.subject);
  return Object.entries(bySub).map(([sub, l]) => {
    const attempts = l.length;
    const acc = l.filter(x=>x.correct).length / Math.max(1, attempts);
    const now = Date.now();
    const last7 = l.filter(a => a.timestamp >= now - 7*24*3600*1000);
    const prev7 = l.filter(a => a.timestamp <  now - 7*24*3600*1000 && a.timestamp >= now - 14*24*3600*1000);
    const a1 = last7.filter(x=>x.correct).length / Math.max(1,last7.length);
    const a2 = prev7.filter(x=>x.correct).length / Math.max(1,prev7.length);
    return { subject: sub, attempts, accuracy: acc, trend: Math.round((a1-a2)*100) };
  }).sort((a,b)=> labelOf(a.subject).localeCompare(labelOf(b.subject)));
}

export function computeTopicStats(atts: Attempt[]) {
  const { list } = filterToSyllabus(atts);
  const byKey = groupBy(list, a => `${a.subject}||${a.topic}`);
  const MIN_WIN = 3; // tối thiểu 3 câu mỗi cửa sổ để tính xu hướng

  return Object.entries(byKey).map(([k, l]) => {
    const [subject, topic] = k.split("||");
    const attempts = l.length;
    const correct = l.filter(x => x.correct).length;
    const accuracy = correct / Math.max(1, attempts);

    const now = Date.now(), seven = 7*24*3600*1000, fourteen = 14*24*3600*1000;
    const last7 = l.filter(a => a.timestamp >= now - seven);
    const prev7 = l.filter(a => a.timestamp <  now - seven && a.timestamp >= now - fourteen);
    const last7Count = last7.length, prev7Count = prev7.length;

    const a1 = last7Count ? (last7.filter(x=>x.correct).length / last7Count) : null;
    const a2 = prev7Count ? (prev7.filter(x=>x.correct).length / prev7Count) : null;

    let trend: number | null = null;
    if (a1 !== null && a2 !== null && last7Count >= MIN_WIN && prev7Count >= MIN_WIN) {
      trend = Math.round((a1 - a2) * 100); // điểm %
    }

    const avgTime = Math.round(l.reduce((s,x)=>s+(x.timeSpentSec||0),0) / Math.max(1, attempts));
    return { subject, topic, attempts, correct, accuracy, last7Acc: a1, last7Count, prev7Count, trend, avgTimeSec: avgTime };
  })
  // Sắp xếp: ưu tiên chủ đề yếu hơn lên trước
  .sort((a,b)=> (a.accuracy - b.accuracy) || (b.attempts - a.attempts));
}


/* ===================== Streak & mục tiêu tuần ===================== */
export function getStreakDays(): number {
  try {
    const today = new Date().toDateString();
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) { localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDay: today, days: 1 })); return 1; }
    const data = JSON.parse(raw) as { lastDay: string; days: number };
    const yester = new Date(Date.now()-24*3600*1000).toDateString();
    const days = data.lastDay === today ? data.days : (data.lastDay === yester ? data.days+1 : 1);
    localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDay: today, days }));
    return days;
  } catch { return 1; }
}
export function getWeeklyGoalMin(): number {
  const raw = localStorage.getItem(GOAL_KEY);
  if (!raw) { localStorage.setItem(GOAL_KEY, "90"); return 90; }
  return parseInt(raw, 10) || 90;
}
export function setWeeklyGoalMin(min: number) { localStorage.setItem(GOAL_KEY, String(min)); }

/* ===================== Tóm tắt hồ sơ (đã chỉnh "điểm yếu" + watchlist) ===================== */
export function summarizeProfile(atts: Attempt[]) {
  const { list, ignored } = filterToSyllabus(atts);
  const subs = computeSubjectMastery(list);
  const topics = computeTopicStats(list);

  const strengths = topics
    .filter(t => t.accuracy >= 0.8 && t.attempts >= 8)
    .slice(0, 3)
    .map(t => ({
      label: `${labelOf(t.subject)} – ${t.topic}`,
      reason: `Độ chính xác ${(t.accuracy*100).toFixed(0)}% (${t.attempts} câu), TB ${t.avgTimeSec}s`,
      subject: t.subject, topic: t.topic
    }));

  // Điểm yếu: <60% hoặc (đang giảm & <75%)
  const weaknesses = topics
    .filter(t => t.accuracy < 0.6 || (((t as any).trend ?? 0) < 0 && t.accuracy < 0.75))
    .sort((a,b)=>(a.accuracy-b.accuracy)||(b.attempts-a.attempts))
    .slice(0,3)
    .map(t => ({
      label: `${labelOf(t.subject)} – ${t.topic}`,
      reason: `Độ chính xác ${(t.accuracy*100).toFixed(0)}%, xu hướng ${t.trend!=null?(t.trend>=0?"+":"")+t.trend + " điểm":"không đủ dữ liệu"}`,
      subject: t.subject, topic: t.topic
    }));

  // Cần chú ý: điểm cao nhưng đang giảm
  const watchlist = topics
    .filter(t => t.trend != null && t.trend < 0 && t.accuracy >= 0.75)
    .slice(0,3)
    .map(t => `${t.topic} (${Math.round(t.accuracy*100)}%, ${t.trend!=null?(t.trend>=0?"+":"")+t.trend + "đ":"—"})`);

  const alerts = subs
    .filter(m => m.trend < -8 && m.attempts >= 6)
    .map(m => `Phong độ ${labelOf(m.subject)} đang giảm ${m.trend} điểm trong 7 ngày qua.`);

  const avg = subs.reduce((s,m)=>s+m.accuracy,0)/Math.max(1,subs.length);
  const message = avg>=0.75 ? "Bạn đang tiến bộ rất tốt, hãy tiếp tục phát huy nhé!"
                : avg>=0.6  ? "Tiến độ ổn! Tập trung 2–3 chủ đề yếu để bứt phá."
                             : "Đừng lo, bắt đầu từ chủ đề cơ bản và học 15’/ngày.";

  const plan = (weaknesses.length?weaknesses:[{subject:"toan",topic:"Ôn cơ bản",label:"Toán – Ôn cơ bản",reason:"Giữ nhịp học"}] as any)
    .slice(0,3)
    .map((w:any)=>({ task:`Ôn ${w.label} bằng 10 câu mục tiêu + xem lời giải chậm`, why:w.reason, minutes:15 }));

  return {
    message, strengths, weaknesses, alerts, plan, watchlist,
    streakDays: getStreakDays(), weeklyGoalMin: getWeeklyGoalMin(),
    // thông tin thêm: có bao nhiêu câu bị loại do ngoài phạm vi thi 10
    _ignoredOutOfScope: ignored
  };
}


/** Xuất dữ liệu / thêm mẫu hôm nay */
export function exportJSON(filename="learning-profile.json") {
  const blob = new Blob([JSON.stringify(loadAttempts(), null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}