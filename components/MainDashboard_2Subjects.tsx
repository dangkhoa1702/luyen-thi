// CamNangKienThuc_2Mon.tsx — Cẩm nang kiến thức (chỉ 2 môn: Toán & Tiếng Anh)
import React from "react";
import {
  Filter, BookOpen, Search, ChevronRight, Target, Brain, GraduationCap,
  Download, AlertTriangle, CheckCircle2, NotebookPen, Layers, ListChecks
} from "lucide-react";

/* ========= Types & Demo ========= */
type Subject = "Toán" | "Tiếng Anh";
type Grade = "8" | "9";

type KnowledgeUnit = {
  id: string;
  topic: string;           // Chủ đề
  type: string;            // Dạng bài / Kỹ năng
  tags?: string[];
  definition?: string;     // Định nghĩa / Công thức
  formula?: string;        // Công thức (Toán)
  example: string;         // Ví dụ mẫu ngắn
  steps: string[];         // Các bước chuẩn
  pitfalls: string[];      // Cạm bẫy & lỗi
};

const DATA: Record<Subject, KnowledgeUnit[]> = {
  "Toán": [
    {
      id: "viet-sumprod",
      topic: "Hệ thức Vi-ét",
      type: "Tính tổng & tích hai nghiệm",
      tags: ["Đại số 9", "Phương trình bậc 2"],
      definition: "Với phương trình bậc hai ax² + bx + c = 0 (a ≠ 0) có hai nghiệm x₁, x₂:",
      formula: "x₁ + x₂ = -b/a;  x₁·x₂ = c/a",
      example: "VD: 2x² - 3x - 2 = 0 ⇒ x₁ + x₂ = 3/2; x₁·x₂ = -1.",
      steps: [
        "Chuẩn hoá phương trình về dạng ax² + bx + c = 0 (a ≠ 0).",
        "Xác định a, b, c; áp dụng hệ thức Vi-ét.",
        "Thay số & rút gọn; chú ý dấu âm của -b/a.",
      ],
      pitfalls: [
        "Quên điều kiện a ≠ 0.",
        "Sai dấu khi tính -b/a.",
        "Nhầm x₁·x₂ = c/a với c/(-a).",
      ],
    },
    {
      id: "hept-word",
      topic: "Giải bài toán bằng cách lập hệ phương trình",
      type: "Bài toán chuyển động / công việc / số học",
      tags: ["Đại số 9", "Hệ phương trình"],
      definition: "Mô hình hoá tình huống thực tế thành hai ẩn và thiết lập hệ quan hệ.",
      example: "VD chuyển động: Quãng đường S cố định, vận tốc khác nhau ⇒ thời gian khác nhau.",
      steps: [
        "Gọi ẩn & đặt điều kiện phù hợp (vận tốc > 0, số lượng nguyên dương...).",
        "Biểu diễn các đại lượng theo ẩn (thời gian = quãng đường / vận tốc...).",
        "Lập 2 phương trình từ dữ kiện; giải hệ; đối chiếu điều kiện & kết luận.",
      ],
      pitfalls: [
        "Không đặt điều kiện ẩn.",
        "Lập phương trình thiếu/ dư điều kiện.",
        "Kết luận mà không loại nghiệm vi phạm điều kiện.",
      ],
    },
  ],
  "Tiếng Anh": [
    {
      id: "eng-tense-prefect",
      topic: "Present Perfect",
      type: "Ngữ pháp • Thì hiện tại hoàn thành",
      tags: ["Grammar", "B1"],
      definition: "Diễn tả kinh nghiệm/việc xảy ra trong quá khứ không rõ thời điểm, liên hệ hiện tại.",
      example: "I have visited Hue twice. She has just finished her homework.",
      steps: [
        "Cấu trúc: S + have/has + V3/ed (+ O).",
        "Dấu hiệu: just, already, yet, ever, never, for, since...",
        "Phân biệt với Past Simple: Past Simple có mốc thời gian quá khứ xác định.",
      ],
      pitfalls: [
        "Dùng ‘since’ thay cho ‘for’ và ngược lại.",
        "Nhầm have/has với chủ ngữ số ít/nhiều.",
        "Lẫn lộn với Past Simple khi có thời điểm cụ thể.",
      ],
    },
    {
      id: "eng-reading-infer",
      topic: "Reading Inference",
      type: "Đọc hiểu • Suy luận",
      tags: ["Reading", "Skills"],
      definition: "Suy ra thông tin không nêu trực tiếp từ manh mối trong văn bản.",
      example: "If the author says ‘attendance dropped despite promotions’, we infer promotion was ineffective.",
      steps: [
        "Đọc câu hỏi & gạch chân từ khoá.",
        "Quét đoạn liên quan; xác định ngữ cảnh (before/after).",
        "Loại trừ phương án trái nội dung; chọn đáp án phù hợp nhất.",
      ],
      pitfalls: [
        "Suy diễn quá mức, không bám văn bản.",
        "Bỏ qua từ khoá phủ định/so sánh.",
        "Không kiểm tra ngữ cảnh câu trước/sau.",
      ],
    },
  ],
};

/* ========= Tiny UI ========= */
// FIX: Converted helper components to React.FC to correctly type them as React components. This resolves errors related to missing 'children' props and invalid 'key' props during list rendering.
const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
    {children}
  </span>
);

const Row: React.FC<{
  left: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
}> = ({ left, right, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-3 py-3 rounded-xl border bg-white hover:bg-gray-50 text-left"
  >
    <span className="inline-flex items-center gap-2">{left}</span>
    <span className="text-gray-400 text-sm inline-flex items-center gap-1">
      {right || <ChevronRight className="w-4 h-4" />}
    </span>
  </button>
);

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="rounded-3xl border p-5 bg-white">
    <div className="flex items-center gap-2">
      {icon} <div className="font-semibold">{title}</div>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

/* ========= MAIN ========= */
export default function MainDashboard2() {
  const [subject, setSubject] = React.useState<Subject>("Toán");
  const [grade, setGrade]     = React.useState<Grade>("9");
  const [q, setQ]             = React.useState("");

  const list = React.useMemo(()=>{
    const base = DATA[subject];
    if (!q.trim()) return base;
    const key = q.toLowerCase();
    return base.filter(k =>
      k.topic.toLowerCase().includes(key) ||
      k.type.toLowerCase().includes(key) ||
      (k.tags||[]).some(t=>t.toLowerCase().includes(key)) ||
      (k.definition||"").toLowerCase().includes(key)
    );
  }, [subject, q]);

  // Actions (placeholder -> nối router/API thật)
  const openPractice = (ku: KnowledgeUnit) => alert(`Luyện đề • ${ku.topic} — ${ku.type}`);
  const openTutor    = (ku: KnowledgeUnit) => alert(`Gia sư AI • ${subject} • ${ku.topic}`);
  const quickReview  = (ku: KnowledgeUnit) => alert(`Ôn nhanh • ${ku.topic}`);
  const exportPDF    = () => alert(`Xuất PDF • Cẩm nang ${subject} lớp ${grade}`);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="px-6 pt-6">
        <div className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
          Cẩm nang kiến thức
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Cấu trúc hóa theo <b>Chủ đề → Dạng bài → Đơn vị kiến thức</b>, kèm ví dụ, bước làm & cạm bẫy.
        </div>
      </div>

      {/* Bộ lọc: CHỈ 2 môn + Khối + Tìm kiếm + Export */}
      <div className="px-6 mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-600">
          <Filter className="w-4 h-4 inline mr-1" />
          Môn
        </span>
        <div className="inline-flex rounded-xl border overflow-hidden">
          {(["Toán", "Tiếng Anh"] as const).map((s)=>(
            <button
              key={s}
              onClick={()=>setSubject(s)}
              className={`px-3 py-1.5 text-sm ${subject===s?"bg-black text-white":"bg-white"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="text-sm text-gray-600">Khối</span>
        <div className="inline-flex rounded-xl border overflow-hidden">
          {(["8","9"] as const).map((g)=>(
            <button
              key={g}
              onClick={()=>setGrade(g)}
              className={`px-3 py-1.5 text-sm ${grade===g?"bg-black text-white":"bg-white"}`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder={`Tìm ${subject === "Toán" ? "chủ đề/dạng bài" : "grammar/reading/vocab"}...`}
              className="pl-8 pr-3 py-2 rounded-xl border w-64 text-sm"
            />
          </div>
          <button onClick={exportPDF} className="px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2">
            <Download className="w-4 h-4"/> Xuất PDF
          </button>
        </div>
      </div>

      {/* Bản đồ tri thức (Knowledge Map) */}
      <div className="px-6 mt-6 grid md:grid-cols-2 gap-4">
        <Section title="Bản đồ tri thức" icon={<Layers className="w-5 h-5" />}>
          <div className="grid sm:grid-cols-2 gap-3">
            {DATA[subject].map(ku=>(
              <Row
                key={ku.id}
                left={<>
                  <BookOpen className="w-4 h-4 text-gray-500"/>
                  <span className="font-medium">{ku.topic}</span>
                  <Badge>{ku.type}</Badge>
                  {ku.tags?.slice(0,2).map((t,i)=><Badge key={i}>{t}</Badge>)}
                </>}
                onClick={()=>quickReview(ku)}
              />
            ))}
          </div>
        </Section>

        {/* Gợi ý học thông minh (tóm tắt) */}
        <Section title="Gợi ý học thông minh" icon={<Target className="w-5 h-5" />}>
          <div className="grid gap-3">
            <Row
              left={<><NotebookPen className="w-4 h-4"/><span>Ôn theo điểm yếu gần đây</span></>}
              onClick={()=>alert("Ôn điểm yếu — lấy từ Knowledge Tracing")}
            />
            <Row
              left={<><ListChecks className="w-4 h-4"/><span>Luyện 15' theo chủ đề ưu tiên</span></>}
              onClick={()=>alert("Luyện 15' — tạo đề thông minh")}
            />
            <Row
              left={<><GraduationCap className="w-4 h-4"/><span>Đề minh hoạ sát năng lực</span></>}
              onClick={()=>alert("Đề AI theo hồ sơ")}
            />
          </div>
        </Section>
      </div>

      {/* Đơn vị kiến thức (Knowledge Unit) — mở rộng đầy đủ */}
      <div className="px-6 mt-6">
        <Section title="Đơn vị kiến thức (chi tiết)" icon={<BookOpen className="w-5 h-5" />}>
          <div className="grid md:grid-cols-2 gap-4">
            {list.map(ku=>(
              <div key={ku.id} className="rounded-2xl border p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-600">{ku.topic}</div>
                    <div className="text-lg font-medium">{ku.type}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {ku.tags?.map((t,i)=><Badge key={i}>{t}</Badge>)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>quickReview(ku)} className="px-3 py-1.5 rounded-xl border text-xs">Ôn nhanh</button>
                    <button onClick={()=>openPractice(ku)} className="px-3 py-1.5 rounded-xl border text-xs">Luyện đề</button>
                    <button onClick={()=>openTutor(ku)} className="px-3 py-1.5 rounded-xl border text-xs">Gia sư</button>
                  </div>
                </div>

                {/* Definition / Formula */}
                {(ku.definition || ku.formula) && (
                  <div className="mt-3 rounded-xl bg-gray-50 p-3">
                    {ku.definition && (
                      <div className="text-sm">
                        <span className="font-medium">Định nghĩa/Công thức:</span> {ku.definition}
                      </div>
                    )}
                    {ku.formula && (
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Công thức:</span> <code>{ku.formula}</code>
                      </div>
                    )}
                  </div>
                )}

                {/* Example */}
                <div className="mt-3 text-sm">
                  <span className="font-medium">Ví dụ mẫu:</span> {ku.example}
                </div>

                {/* Steps */}
                <div className="mt-3">
                  <div className="text-sm font-medium">Các bước chuẩn</div>
                  <ol className="mt-1 list-decimal pl-5 text-sm text-gray-700 space-y-1">
                    {ku.steps.map((s,i)=>(<li key={i}>{s}</li>))}
                  </ol>
                </div>

                {/* Pitfalls */}
                <div className="mt-3">
                  <div className="text-sm font-medium inline-flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600"/> Cạm bẫy & lỗi hay gặp
                  </div>
                  <ul className="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {ku.pitfalls.map((p,i)=>(<li key={i}>{p}</li>))}
                  </ul>
                </div>

                {/* Footer quick links */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={()=>openPractice(ku)} className="px-3 py-1.5 rounded-xl border text-xs inline-flex items-center gap-2">
                    <Target className="w-4 h-4"/> Luyện đề theo dạng
                  </button>
                  <button onClick={()=>openTutor(ku)} className="px-3 py-1.5 rounded-xl border text-xs inline-flex items-center gap-2">
                    <Brain className="w-4 h-4"/> Học với Gia sư
                  </button>
                  <button onClick={()=>quickReview(ku)} className="px-3 py-1.5 rounded-xl border text-xs inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4"/> Ôn nhanh
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}