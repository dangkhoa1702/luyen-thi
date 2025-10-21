/**
 * KIẾN THỨC ÔN THI VÀO LỚP 10 — THEO TỪNG MÔN (có KIẾN THỨC CƠ BẢN)
 * - Hiển thị chủ đề trọng tâm + kiến thức cốt lõi cho môn học được chọn.
 * - Tìm nhanh theo từ khóa; "Tóm tắt nhanh" (điểm nhớ) • "Kiến thức cơ bản" (mở rộng) • "Luyện ngay".
 * - Tích hợp vào App.tsx, nhận môn học qua props.
 */
import React, { useState, useEffect } from "react";
import { SYLLABUS_TOPICS, labelOf } from "../profile/logic";

/* ===== Môn học & nhãn (Lấy từ nguồn chung) ===== */
const SUBJECTS = ["toan", "tieng-anh"] as const;
type Subject = typeof SUBJECTS[number];
const LABELS = SUBJECTS.reduce((acc, s) => {
  acc[s] = labelOf(s);
  return acc;
}, {} as Record<Subject, string>);


/* ===== KIẾN THỨC CƠ BẢN (cốt lõi) — gọn, đúng trọng tâm đề vào 10 ===== */
type NotesMap = Record<string, Record<string, string[]>>;
const CORE_NOTES: NotesMap = {
  toan: {
    "hàm số": [
      "Đồ thị y=ax+b là đường thẳng: a ≠ 0 (hệ số góc); a>0 ↑, a<0 ↓.",
      "Tọa độ giao trục: cắt Oy tại (0,b), cắt Ox khi y=0 ⇒ x = -b/a.",
      "Xác định đường thẳng qua 2 điểm: hệ số góc k = (y2−y1)/(x2−x1); phương trình y = kx + y1 − kx1.",
      "Nhận dạng đề: tìm giao điểm, song song (a1=a2), vuông góc (a1·a2=-1).",
    ],
    "hệ phương trình": [
      "Dạng cơ bản: thế / cộng – trừ / quy về 1 ẩn.",
      "Hệ đối xứng hoặc đặt ẩn phụ u=x+y, v=xy khi xuất hiện x+y, xy.",
      "Điều kiện nghiệm: ∆ ≠ 0 (hệ Cramer); chú ý mẫu khác 0 nếu có phân thức.",
    ],
    "đồng dạng": [
      "AA/HS cạnh tỉ lệ/góc xen kẽ – so le trong → tam giác đồng dạng.",
      "Suy ra tỉ lệ cạnh tương ứng; áp dụng tìm đoạn thẳng/chiều cao/diện tích.",
      "Bẫy: xác định đúng cặp góc tương ứng; sơ đồ hình để không nhầm.",
    ],
    "đường tròn": [
      "Tiếp tuyến vuông góc bán kính tại tiếp điểm.",
      "Góc nội tiếp = 1/2 số đo cung chắn; góc tạo bởi tiếp tuyến & dây = góc nội tiếp cùng chắn cung.",
      "Tính chất cát tuyến – tiếp tuyến: PA² = PB·PC (P ngoài đường tròn).",
    ],
    "bất phương trình": [
      "Quy tắc chuyển vế, đổi dấu khi nhân/chia số âm.",
      "Dạng trị tuyệt đối: tách 2 trường hợp theo dấu biểu thức.",
      "Vẽ trục số để biểu diễn nghiệm; hợp giao khoảng.",
    ],
    "bậc nhất/bậc hai": [
      "PT bậc hai: ∆ = b² − 4ac; nghiệm: x = (-b ± √∆)/(2a).",
      "Đổi biến khi xuất hiện dạng x + 1/x, đặt t = x + 1/x (điều kiện x ≠ 0).",
      "Nhớ Viète: x1 + x2 = -b/a; x1·x2 = c/a.",
    ],
    "tam giác vuông": [
      "Pytago: a² = b² + c²; hệ thức lượng: h² = mn, a² = c·ca’, b² = c·cb’.",
      "Sin/Cos trong tam giác vuông: sin = đối/huyền, cos = kề/huyền.",
    ],
    "bài toán thực tế": [
      "Tỉ lệ: y ∼ kx; năng suất: khối lượng = năng suất × thời gian.",
      "Chuyển động đều: s = v·t; ngược chiều cộng vận tốc, cùng chiều trừ.",
    ],
    "căn bậc hai": [
      "Quy tắc: √ab = √a√b (a,b≥0); khử mẫu; liên hợp khi có dạng √a ± √b.",
      "Điều kiện xác định khi có căn: biểu thức dưới căn ≥ 0.",
    ],
    "tọa độ": [
      "Độ dài đoạn thẳng: d(A,B)=√((x2-x1)²+(y2-y1)²); trung điểm M((x1+x2)/2,(y1+y2)/2).",
      "Phương trình đường thẳng qua điểm A(x0,y0) có hệ số góc k: y−y0 = k(x−x0).",
    ],
  },
  "ngu-van": {
    "phương thức": [
      "PTBĐ chính: tự sự, miêu tả, biểu cảm, thuyết minh, nghị luận, hành chính–công vụ.",
      "Biện pháp tu từ hay hỏi: ẩn dụ, hoán dụ, so sánh, điệp, nói quá, chơi chữ; tác dụng: gợi hình/gợi cảm/nhấn mạnh.",
    ],
    "thông điệp": [
      "Xác định đối tượng, hoàn cảnh; tác giả muốn gửi gắm giá trị/quan niệm gì.",
      "Thái độ/ngữ điệu: đồng cảm – phê phán – trân trọng… dẫn chứng 1–2 câu then chốt.",
    ],
    "200 chữ": [
      "Bố cục: Mở (nêu vấn đề) – Thân (giải thích, phân tích, phản biện, dẫn chứng) – Kết (bài học/nhắn gửi).",
      "5 tiêu chí: đúng đề; lập luận rõ; dẫn chứng phù hợp; diễn đạt; chính tả.",
    ],
    "nhân vật/chi tiết": [
      "Nêu lai lịch – diễn biến – phẩm chất; chi tiết nghệ thuật (mang tính biểu tượng).",
      "Gắn bài học/ý nghĩa nhân văn; liên hệ thực tiễn học đường.",
    ],
    "mở/kết": [
      "Mở tự nhiên – đi thẳng vấn đề; kết mở rộng—liên hệ bản thân/xã hội, tránh sáo rỗng.",
    ],
  },
  "tieng-anh": {
    "tenses": [
      "Hiện tại đơn: S + V(s/es) (thói quen, sự thật). Hiện tại tiếp diễn: S + am/is/are + V-ing (đang diễn ra).",
      "Quá khứ đơn: V2/ed; Hiện tại hoàn thành: have/has + P2 (kinh nghiệm/ảnh hưởng tới hiện tại).",
    ],
    "passive": [
      "Bị động: S + be + P2 (+ by O); thì nào → be chia thì đó.",
      "Tường thuật: lùi thì cơ bản; đổi đại từ/trạng ngữ chỉ thời gian – nơi chốn.",
    ],
    "conditional/relative": [
      "If loại 1: real; loại 2: unreal hiện tại; loại 3: unreal quá khứ.",
      "Mệnh đề quan hệ: who/whom/which/that/whose; rút gọn V-ing/P2 khi chủ ngữ trùng.",
    ],
    "comparison/articles/prep": [
      "So sánh hơn/nhất; cấu trúc as…as; much/far + comparative.",
      "Mạo từ a/an/the; giới từ thời gian: at/on/in; nơi chốn: at/in/on.",
    ],
    "reading": [
      "Skimming (đọc lướt ý chính) – scanning (đọc tìm chi tiết).",
      "Từ vựng B1: gia đình, giáo dục, môi trường, công nghệ…",
    ],
  },
};

/* ===== Điểm nhớ tóm tắt nhanh ===== */
function quickSummary(subj: Subject): string[] {
  switch (subj) {
    case "toan": return ["Nhận dạng dạng bài", "Công thức then chốt", "Các bước giải", "Lỗi hay mắc"];
    case "tieng-anh": return ["Quy tắc", "Ví dụ", "3 câu luyện", "Mẹo đọc/ngữ pháp"];
    default: return [];
  }
}

/* ===== Lấy “Kiến thức cơ bản” theo chuỗi khớp (linh hoạt includes) ===== */
function coreNotesFor(subject: Subject, topic: string): string[] {
  const pool = CORE_NOTES[subject] || {};
  const t = topic.toLowerCase();

  // Tìm key khớp phần tên ngắn
  const key = Object.keys(pool).find(k => t.includes(k));
  return key ? pool[key] : [];
}

interface KnowledgeBaseProps {
  subject: string | null;
  onStartPractice: (subject: string, topic: string) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ subject: initialSubjectProp, onStartPractice }) => {
  const slugify = (s: string | null) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") : 'toan';
  
  const getValidSubjectSlug = (s: string | null): Subject => {
    const sl = slugify(s);
    return SUBJECTS.includes(sl as any) ? sl as Subject : 'toan';
  }
  
  const [subject, setSubject] = useState<Subject>(getValidSubjectSlug(initialSubjectProp));
  const [filter, setFilter]   = useState("");
  
  useEffect(() => {
    setSubject(getValidSubjectSlug(initialSubjectProp));
  }, [initialSubjectProp]);

  const topics = (SYLLABUS_TOPICS[subject] || []).filter(t =>
    t.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-0 sm:p-2 md:p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Kiến thức ôn thi vào lớp 10 — <span className="text-indigo-600 dark:text-indigo-400">{LABELS[subject]}</span>
        </div>

        {/* Chọn môn + tìm chủ đề */}
        <div className="rounded-2xl border dark:border-gray-700 p-3 flex flex-wrap gap-3 items-center bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(s=>(
              <button key={s} onClick={()=>setSubject(s)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${subject===s?"bg-black text-white dark:bg-blue-600 dark:border-blue-600":"bg-white dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
                {LABELS[s]}
              </button>
            ))}
          </div>
          <input
            className="ml-auto border dark:border-gray-600 rounded-xl px-3 py-2 text-sm min-w-[220px] bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Tìm chủ đề…"
            value={filter} onChange={e=>setFilter(e.target.value)}
          />
        </div>

        {/* Danh sách chủ đề */}
        <div className="rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm">
          {topics.length === 0 ? (
            <div className="opacity-60 text-center py-10 text-sm">
              Chưa có chủ đề phù hợp từ khóa.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {topics.map((t, i)=>{
                const notes = coreNotesFor(subject, t);
                return (
                  <div key={i} className="border dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 flex flex-col">
                    <div className="font-semibold text-gray-900 dark:text-white">{t}</div>

                    {/* Điểm nhớ ngắn */}
                    <ul className="text-sm mt-2 list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                      {quickSummary(subject).map((k,idx)=>(<li key={idx}>{k}</li>))}
                    </ul>

                    {/* Kiến thức cơ bản (mở rộng) */}
                    {notes.length>0 && (
                      <details className="mt-3 text-gray-800 dark:text-gray-200">
                        <summary className="text-sm cursor-pointer select-none font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Kiến thức cơ bản</summary>
                        <div className="text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <ul className="list-disc pl-5 space-y-1.5">
                            {notes.map((k,idx)=>(<li key={idx}>{k}</li>))}
                          </ul>
                        </div>
                      </details>
                    )}

                    <div className="mt-4 pt-3 border-t dark:border-gray-700 flex-grow flex items-end gap-2">
                      <button
                        className="px-3 py-1.5 rounded-lg border text-sm font-medium bg-white dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={()=>alert(`TÓM TẮT NHANH: ${LABELS[subject]} – ${t}\n\n• ${quickSummary(subject).join("\n• ")}`)}
                      >
                        Tóm tắt nhanh
                      </button>
                      <button
                        className="px-4 py-1.5 rounded-lg bg-black dark:bg-blue-600 text-white text-sm font-semibold hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors"
                        onClick={() => onStartPractice(subject, t)}
                      >
                        Luyện ngay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="text-xs opacity-60 mt-3 px-1">
            *Danh sách & kiến thức cốt lõi bám sát cấu trúc đề thi vào 10. Bấm <b>Kiến thức cơ bản</b> để xem nhanh công thức/khái niệm quan trọng, hoặc <b>Luyện ngay</b> để làm bài theo chủ đề.
          </div>
        </div>
      </div>
    </div>
  );
};
