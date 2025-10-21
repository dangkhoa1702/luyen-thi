/**
 * Material Hub – bản FIX tạo PDF AI:
 * - Import jsPDF an toàn (named export hoặc default).
 * - Nạp font NotoSans nếu có; nếu không có, KHÔNG throw -> dùng font mặc định để vẫn tạo PDF.
 * - Giữ các tính năng: Upload PDF, Link từ Kế hoạch, Gợi ý từ Hồ sơ → PDF, Trusted URLs, Web Finder, Bridge.
 */
import { SYLLABUS_TOPICS, labelOf, loadAttempts, computeTopicStats } from "../profile/logic";
import { loadCurrentPlan, practiceLink, slug } from "../plan/planUtils";
import { jsPDF as JsPDFType } from 'jspdf';


export type SourceTag = "upload" | "planner" | "profile" | "ai" | "trusted" | "other";
export type MaterialItem = {
  id: string;
  name: string;
  subject: string;
  topic?: string;
  type: "pdf" | "link";
  source: SourceTag;
  createdAt: number;
  mime?: string;
  sizeKB?: number;
  b64?: string;
  url?: string;
  quality: { score: number; badges: string[]; details: string };
};

const KEY = "ai.materials.v6/pdf-fix";

// =============== Tin cậy (whitelist) ===============
export const TRUSTED_SOURCES = ["moet.gov.vn","nxbgiaoduc.vn","sgddt.hanoi.gov.vn","hcm.edu.vn","hoclieu.vn","data.gov.vn"];
export const EXTRA_SOURCES   = ["thuvienphapluat.vn","vietjack.com","olm.vn","hoctot.hocmai.vn"];
const hostname = (u: string) => { try { return new URL(u).hostname.toLowerCase(); } catch { return ""; } };
export function isTrustedURL(u: string) {
  const h = hostname(u); return !!h && TRUSTED_SOURCES.some(d => h === d || h.endsWith(`.${d}`));
}

// =============== Lưu/đọc ===============
export function listMaterials(): MaterialItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") as MaterialItem[]; } catch { return []; }
}
function saveMaterials(arr: MaterialItem[]) { localStorage.setItem(KEY, JSON.stringify(arr)); }
export function deleteMaterial(id: string) { saveMaterials(listMaterials().filter(x => x.id !== id)); }

// =============== Chất lượng/huy hiệu ===============
function qualityFor(subject: string, topic?: string, from: SourceTag = "upload") {
  const badges: string[] = []; let score = 0;
  if (!topic || (SYLLABUS_TOPICS[subject] || []).includes(topic)) { score += 40; badges.push("Bám SYLLABUS 9→10"); }
  const stats = computeTopicStats(loadAttempts().filter(a => a.subject === subject));
  const s = topic ? stats.find(x => x.topic === topic) : undefined;
  if (s && s.attempts >= 5) { score += Math.min(30, s.attempts*2); badges.push(`Dựa dữ liệu ${s.attempts} câu`); }
  if (from === "planner") score += 20, badges.push("Khớp Kế hoạch");
  if (from === "profile") score += 15, badges.push("Nhắm chủ đề yếu");
  if (from === "ai")      score += 10, badges.push("Minh bạch nguồn AI");
  if (from === "trusted") score += 30, badges.push("Trusted: nguồn chính thống");
  score += 10; badges.push("Mới tạo");
  return { score: Math.min(100, score), badges, details: `Score=${score}/100 • ${badges.join(" • ")}` };
}

// =============== Utils ===============
function arrayBufferToBase64(buf: ArrayBuffer) {
  let binary = ""; const bytes = new Uint8Array(buf); const chunk = 0x8000;
  for (let i=0;i<bytes.length;i+=chunk) binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i,i+chunk)));
  return btoa(binary);
}

// =============== Upload PDF ===============
export async function addUploadedPDF(file: File, subject: string, topic?: string) {
  if (file.type !== "application/pdf") throw new Error("Vui lòng chọn tệp PDF.");
  const buf = await file.arrayBuffer(); const b64 = arrayBufferToBase64(buf);
  const item: MaterialItem = {
    id: `pdf-${slug(file.name)}-${Date.now()}`,
    name: file.name.replace(/\.pdf$/i,""),
    subject, topic, type: "pdf", source: "upload", createdAt: Date.now(),
    mime: "application/pdf", sizeKB: Math.round(file.size/1024), b64,
    quality: qualityFor(subject, topic, "upload")
  };
  const arr = listMaterials(); arr.unshift(item); saveMaterials(arr); return item;
}
export function pdfBlobUrl(item: MaterialItem) {
  if (item.type!=="pdf" || !item.b64) return "";
  const bytes = atob(item.b64); const len = bytes.length; const buf = new Uint8Array(len);
  for (let i=0;i<len;i++) buf[i] = bytes.charCodeAt(i);
  const blob = new Blob([buf], { type: item.mime || "application/pdf" });
  return URL.createObjectURL(blob);
}
export function downloadPDF(item: MaterialItem) {
  const url = pdfBlobUrl(item); if (!url) return;
  const a = document.createElement("a"); a.href = url; a.download = `${slug(item.name)}.pdf`; a.click(); URL.revokeObjectURL(url);
}

// =============== Kế hoạch (link luyện tập) ===============
export function linkFromPlanner(weeksAhead = 1) {
  const plan = loadCurrentPlan(); if (!plan) return 0;
  const weekNow = Math.min(Math.max(1, Math.floor((Date.now()-plan.createdAt)/(7*24*3600*1000))+1), plan.weeks);
  const targetWeeks = new Set<number>(); for (let w=weekNow; w<=Math.min(plan.weeks, weekNow+weeksAhead-1); w++) targetWeeks.add(w);
  const tasks = plan.tasks.filter(t => targetWeeks.has(t.week));
  const now = Date.now(); const arr = listMaterials(); let added = 0;
  for (const t of tasks) {
    const id = `pl-${plan.id}-${t.id}`; if (arr.find(x => x.id === id)) continue;
    arr.push({ id, name:`Gói luyện: ${labelOf(plan.subject)} – ${t.topic}`, subject:plan.subject, topic:t.topic,
      type:"link", source:"planner", createdAt:now, url:practiceLink(plan.subject, t.topic),
      quality: qualityFor(plan.subject, t.topic, "planner") });
    added++;
  }
  saveMaterials(arr); return added;
}

// =============== AI PDF: robust import + soft font ===============
const KEY_FONT_B64 = "ai.font.vn.NotoSans.b64";

/** Nạp jsPDF an toàn cho mọi bundler */
async function getJsPdfCtor(): Promise<typeof JsPDFType | null> {
  try {
    const mod: any = await import("jspdf");
    return mod?.jsPDF || mod?.default; // named export hoặc default
  } catch {
    return null;
  }
}

/** Thử lấy font NotoSans từ public, nếu không có thì trả "" (không throw) */
async function tryLoadNotoSansB64(): Promise<string> {
  const cached = localStorage.getItem(KEY_FONT_B64) || "";
  if (cached) return cached;
  try {
    // Đường dẫn public luôn bắt đầu từ gốc
    const res = await fetch("/fonts/NotoSans-Regular.ttf");
    if (!res.ok) return "";
    const buf = await res.arrayBuffer();
    const b64 = arrayBufferToBase64(buf);
    localStorage.setItem(KEY_FONT_B64, b64);
    return b64;
  } catch { return ""; }
}

/** Tạo PDF AI – luôn cố gắng tạo được; có font thì không lỗi dấu, không có font thì dùng Helvetica */
export async function createAIPDF(subject: string, topic: string, level: "yeu"|"trung-binh"|"kha"|"gioi") {
  try {
    const JsPDF = await getJsPdfCtor();
    if (!JsPDF) throw new Error("jsPDF library not found.");
    
    const doc = new JsPDF({ unit: "pt", format: "a4" });

    // Font: cố gắng nhúng NotoSans; nếu không thì rơi về Helvetica
    let usedVNFont = false;
    const fontB64 = await tryLoadNotoSansB64();
    if (fontB64) {
      doc.addFileToVFS("NotoSans-Regular.ttf", fontB64);
      doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
      doc.setFont("NotoSans");
      usedVNFont = true;
    } else {
      // fallback mềm
      try { doc.setFont("helvetica"); } catch {}
    }

    // Nội dung
    doc.setFontSize(14);
    doc.text(`${labelOf(subject)} – ${topic}`, 40, 50);
    doc.setFontSize(11);
    const text = buildCheatText(subject, topic, level);
    const lines = (doc as any).splitTextToSize ? doc.splitTextToSize(text, 515) : text.split("\n");
    let y = 80;
    for (const line of lines) { if (y > 780) { doc.addPage(); y = 50; } doc.text(line, 40, y); y += 16; }

    // Xuất base64 và lưu
    const out = doc.output("arraybuffer");
    const b64 = arrayBufferToBase64(out);
    const item: MaterialItem = {
      id: `ai-${slug(subject)}-${slug(topic)}-${Date.now()}`,
      name: `Cheat-sheet: ${labelOf(subject)} – ${topic} (${level}${usedVNFont?"":" • no-font"})`,
      subject, topic, type:"pdf", source:"ai", createdAt: Date.now(),
      mime:"application/pdf", sizeKB: Math.round((b64.length*3/4)/1024), b64,
      quality: qualityFor(subject, topic, "ai")
    };
    const arr = listMaterials(); arr.unshift(item); saveMaterials(arr);
    return item;
  } catch (e: any) {
    // Nếu jsPDF cũng không import được → tạo “link hướng dẫn in PDF” để không chặn luồng người dùng
    const item: MaterialItem = {
      id: `ai-fallback-${Date.now()}`,
      name: `Cheat-sheet (mở để in PDF): ${labelOf(subject)} – ${topic}`,
      subject, topic, type:"link", source:"ai", createdAt: Date.now(),
      url: `/printable?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&level=${encodeURIComponent(level)}`,
      quality: qualityFor(subject, topic, "ai")
    };
    const arr = listMaterials(); arr.unshift(item); saveMaterials(arr);
    console.error("PDF AI error:", e);
    return item;
  }
}

/** Nội dung cheat-sheet (rút gọn) */
function buildCheatText(subject: string, topic: string, level: "yeu"|"trung-binh"|"kha"|"gioi") {
  const subj = labelOf(subject);
  const lv = level==="yeu"?"Nhận biết–Thông hiểu":level==="trung-binh"?"Chuẩn dạng":level==="kha"?"Tổng hợp–Tốc độ":"Biến thể khó";
  return `${subj} – ${topic} (Cheat-sheet ${level})
--------------------------------------
Mục tiêu: nắm nhanh trọng tâm để làm bài thi vào 10.
Ghi chú theo trình độ: ${lv}

1) Trọng tâm:
- Khái niệm / công thức / khung trình bày
- 1–2 ví dụ mẫu

2) Lỗi thường gặp:
- Sai đơn vị/điều kiện, diễn đạt thiếu ý

3) Bài tập nhanh:
- 10 câu trắc nghiệm vừa
- 1–2 câu tự luận ngắn

→ Luyện tiếp: /practice?subject=${slug(subject)}&topic=${slug(topic)}`;
}

// =============== Gợi ý PDF từ Hồ sơ ===============
export function suggestFromProfileToPDF(subject?: string, topN = 3) {
  const all = computeTopicStats(loadAttempts().filter(a => !subject || a.subject === subject));
  const weak = all.filter(t => t.accuracy < 0.6 || (((t as any).trend ?? 0) < 0 && t.accuracy < 0.75)).slice(0, topN);
  let n = 0; for (const t of weak) { void createAIPDF(t.subject, t.topic, "trung-binh"); n++; } return n;
}

// =============== Bridge giữa các trang ===============
export type BridgeIncoming = { name: string; subject: string; topic?: string; type: "pdf" | "link"; b64?: string; url?: string; source?: SourceTag; };
export function registerExternalMaterial(data: BridgeIncoming) {
  const source: SourceTag = data.source || (data.url && isTrustedURL(data.url) ? "trusted" : "other");
  const item: MaterialItem = { id:`ext-${Date.now()}`, name:data.name, subject:data.subject, topic:data.topic,
    type:data.type, source, createdAt:Date.now(), mime:data.type==="pdf"?"application/pdf":undefined,
    sizeKB: data.type==="pdf" && data.b64 ? Math.round((data.b64.length*3/4)/1024) : undefined, b64:data.b64, url:data.url,
    quality: qualityFor(data.subject, data.topic, source) };
  const arr = listMaterials(); arr.unshift(item); saveMaterials(arr); return item;
}
export function startExternalListener(onChange?: () => void) {
  window.addEventListener("ai:add-material" as any, (ev: any) => { if (ev?.detail) { registerExternalMaterial(ev.detail); onChange?.(); } });
  window.addEventListener("storage", (e) => {
    if (e.key === "ai.material.inbox" && e.newValue) {
      try { const d = JSON.parse(e.newValue) as BridgeIncoming; registerExternalMaterial(d); localStorage.removeItem("ai.material.inbox"); onChange?.(); } catch {}
    }
  });
}

// =============== Web Finder tiện ích ===============
export function buildSiteSearchURL(domain: string, q: string) { return `https://duckduckgo.com/?q=${encodeURIComponent(`site:${domain} ${q}`)}`; }
export function addExternalLink(url: string, subject: string, topic?: string) {
  const source: SourceTag = isTrustedURL(url) ? "trusted" : "other";
  const item: MaterialItem = { id:`link-${Date.now()}`, name:`Tài liệu: ${labelOf(subject)} – ${topic || hostname(url)}`, subject, topic, type:"link", source, createdAt:Date.now(), url, quality: qualityFor(subject, topic, source) };
  const arr = listMaterials(); arr.unshift(item); saveMaterials(arr); return item;
}
export async function addURLSmart(url: string, subject: string, topic?: string) {
  const source: SourceTag = isTrustedURL(url) ? "trusted" : "other";
  try {
    const res = await fetch(url, { mode:"cors" }); const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (res.ok && ct.includes("pdf")) {
      const buf = await res.arrayBuffer(); const b64 = arrayBufferToBase64(buf);
      const item: MaterialItem = { id:`pdfurl-${Date.now()}`, name:`PDF: ${labelOf(subject)} – ${topic || hostname(url)}`, subject, topic, type:"pdf", source, createdAt:Date.now(), mime:"application/pdf", sizeKB: Math.round(buf.byteLength/1024), b64, quality: qualityFor(subject, topic, source) };
      const arr = listMaterials(); arr.unshift(item); saveMaterials(arr); return { ok:true, mode:"pdf", item };
    }
    const item = addExternalLink(url, subject, topic); return { ok:true, mode:"link", item };
  } catch { const item = addExternalLink(url, subject, topic); return { ok:false, mode:"link", item }; }
}