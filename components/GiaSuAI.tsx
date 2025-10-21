import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Search, Send, Lightbulb, BookOpen, GraduationCap, ListChecks, Shield, Link2, AlertCircle, Sparkles, Clock, CheckCircle2 } from "lucide-react";

// Định nghĩa cục bộ để chỉ có Toán và Tiếng Anh
const SUBJECTS_LOCAL = ["Toán", "Tiếng Anh"] as const;
export type Subject = typeof SUBJECTS_LOCAL[number];

// FIX: Used Omit to remove the original 'onChange' from HTMLSelectElement attributes to avoid type intersection conflicts with the custom 'onChange' prop.
type SubjectSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  value: Subject;
  onChange: (v: Subject) => void;
  className?: string;
};

function SubjectSelect({ value, onChange, className = "px-3 py-2 border rounded-xl bg-white dark:bg-gray-700", ...rest }: SubjectSelectProps){
  return (
    <select
      {...rest}
      className={className}
      value={value}
      onChange={(e)=> onChange(e.target.value as Subject)}
    >
      {SUBJECTS_LOCAL.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}


// ================= Types =================
export type QAIntent = "concept" | "socratic" | "hint"; // Giải thích | Hướng dẫn từng bước | Gợi ý nhanh

export type SourceRef = { id: string; title: string; kind: "handbook"|"material"|"exam"; unitId?: string; url?: string };
export type AnswerChunk = { type: "text" | "step" | "hint"; content: string };
export type AnswerPayload = {
  answer: AnswerChunk[];             // nội dung chia đoạn
  sources: SourceRef[];              // trích dẫn
  unitId?: string;                   // đơn vị kiến thức liên quan (nếu có)
  detectedProblem?: boolean;         // có phải đề bài cần giải?
  disclaimers?: string[];            // lưu ý/guardrail
};

export type QAEvent =
  | { type: "qa_ask"; subject: Subject; grade: string; intent: QAIntent; text: string; timestamp: number }
  | { type: "qa_answer"; unitId?: string; sources: number; tookMs: number }
  | { type: "qa_open_tutor"; unitId?: string }
  | { type: "qa_open_assess"; unitId?: string }
  | { type: "qa_open_handbook"; unitId?: string };

export type QAModuleProps = {
  subject: Subject;
  grade: string;
  fetchAnswer?: (opts: { question: string; subject: Subject; grade: string; intent: QAIntent; forbidFullSolution: boolean }) => Promise<AnswerPayload>;
  classifyQuestion?: (q: string) => Promise<{ isProblem: boolean; suggestedUnitId?: string }>;
  logEvent?: (e: QAEvent) => void;
  openHandbook?: (unitId: string) => void;
  openTutor?: (unitId: string) => void;
  openAssess?: (unitId: string) => void;
};

// ================= UI Helpers =================
// FIX: Converted to React.FC to correctly handle props like 'key' from list rendering.
const Bubble: React.FC<{ role: "user" | "ai"; children: React.ReactNode }> = ({ role, children }) => {
  const isAI = role === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 border text-sm whitespace-pre-wrap ${
          isAI
            ? "bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            : "bg-black text-white border-black dark:bg-blue-600 dark:border-blue-500"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

function Sources({ items, onOpenHandbook }:{ items: SourceRef[]; onOpenHandbook?:(unitId:string)=>void }){
  if(!items?.length) return null;
  return (
    <div className="mt-2 text-xs">
      <div className="uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Trích dẫn</div>
      <div className="flex flex-wrap gap-2">
        {items.map(s => (
          <span key={s.id} className="inline-flex items-center gap-1 px-2 py-1 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800">
            <Link2 className="w-3 h-3"/> {s.title}
            {s.unitId && (<button className="underline ml-1" onClick={()=>onOpenHandbook?.(s.unitId!)}>• mở đơn vị</button>)}
          </span>
        ))}
      </div>
    </div>
  );
}

function Toolbar({ subject, setSubject, grade, setGrade, intent, setIntent, forbidFull, setForbid }:{
  subject: Subject; setSubject:(s:Subject)=>void;
  grade: string; setGrade:(g:string)=>void;
  intent: QAIntent; setIntent:(i:QAIntent)=>void;
  forbidFull: boolean; setForbid:(b:boolean)=>void;
}){
  return (
    <div className="rounded-2xl border dark:border-gray-700 p-3 bg-white/90 dark:bg-gray-800/90 flex flex-wrap gap-3 items-end">
      <div>
        <label className="text-xs">Môn</label>
        <SubjectSelect value={subject} onChange={setSubject} className="px-3 py-2 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" />
      </div>
      <div>
        <label className="text-xs">Lớp</label>
        <select className="px-3 py-2 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" value={grade} onChange={e=>setGrade(e.target.value)}>
          <option value="9">9</option>
          <option value="8">8</option>
        </select>
      </div>
      <div>
        <label className="text-xs">Chế độ</label>
        <select className="px-3 py-2 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" value={intent} onChange={e=>setIntent(e.target.value as QAIntent)}>
          <option value="concept">Giải thích khái niệm</option>
          <option value="socratic">Hướng dẫn từng bước</option>
          <option value="hint">Gợi ý nhanh</option>
        </select>
      </div>
      <label className="inline-flex items-center gap-2 ml-auto px-2 py-2 border dark:border-gray-600 rounded-xl text-sm">
        <Shield className="w-4 h-4"/>
        <input type="checkbox" className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" checked={forbidFull} onChange={e=>setForbid(e.target.checked)} />
        Không đưa lời giải hoàn chỉnh
      </label>
    </div>
  );
}

// ================= Main Component (internal) =================
function QAModuleComponent(props: QAModuleProps){
  const [subject, setSubject] = useState<Subject>(props.subject);
  const [grade, setGrade] = useState(props.grade);
  const [intent, setIntent] = useState<QAIntent>("socratic");
  const [forbidFull, setForbid] = useState(true);

  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Array<{ role: "user"|"ai", content: React.ReactNode }>>([]);
  const [busy, setBusy] = useState(false);

  async function ask(){
    const q = input.trim(); if(!q) return;
    setInput("");
    setMsgs(m=>[...m, { role:"user", content: q }]);
    props.logEvent?.({ type: "qa_ask", subject, grade, intent, text: q, timestamp: Date.now() });

    setBusy(true);
    const t0 = performance.now();
    try{
      const payload = props.fetchAnswer ? await props.fetchAnswer({ question: q, subject, grade, intent, forbidFullSolution: forbidFull }) : await mockFetchAnswer({ question: q, subject, grade, intent, forbidFullSolution: forbidFull });
      const tookMs = performance.now()-t0;

      setMsgs(m=>[...m, { role:"ai", content: (
        <div>
          {payload.disclaimers?.length ? (
            <div className="mb-2 text-xs text-amber-700 dark:text-amber-400 inline-flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {payload.disclaimers.join(" • ")}</div>
          ): null}

          {/* Render chunks */}
          {payload.answer.map((ch, i)=>{
            if(ch.type==="step") return <div key={i} className="mb-1">• {ch.content}</div>;
            if(ch.type==="hint") return <div key={i} className="mb-1 italic">Gợi ý: {ch.content}</div>;
            return <div key={i} className="mb-2">{ch.content}</div>;
          })}

          {/* Citations */}
          <Sources items={payload.sources} onOpenHandbook={(id)=>props.openHandbook?.(id)} />

          {/* Quick actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {payload.unitId && (
              <>
                <button className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-blue-600" onClick={()=>props.openTutor?.(payload.unitId!)}><GraduationCap className="w-4 h-4 inline mr-1"/>Học với Gia sư</button>
                <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={()=>props.openHandbook?.(payload.unitId!)}><BookOpen className="w-4 h-4 inline mr-1"/>Mở Cẩm nang</button>
                <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={()=>props.openAssess?.(payload.unitId!)}><ListChecks className="w-4 h-4 inline mr-1"/>Luyện 10–15'</button>
              </>
            )}
          </div>
        </div>
      ) }]);

      props.logEvent?.({ type: "qa_answer", unitId: payload.unitId, sources: payload.sources?.length||0, tookMs });
    } finally {
      setBusy(false);
    }
  }

  function quickPrompt(text: string){ setInput(text); }

  return (
    <div className="mx-auto max-w-4xl p-0 sm:p-2 md:p-5 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare className="w-5 h-5"/>
        <div className="text-lg font-semibold">Hỏi đáp AI</div>
        {busy && <span className="ml-auto inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400"><Clock className="w-4 h-4"/> Đang suy nghĩ…</span>}
      </div>

      {/* Controls */}
      <Toolbar subject={subject} setSubject={setSubject} grade={grade} setGrade={setGrade} intent={intent} setIntent={setIntent} forbidFull={forbidFull} setForbid={setForbid} />

      {/* Suggestions */}
      <div className="mt-3 rounded-2xl border dark:border-gray-700 p-3 bg-white/90 dark:bg-gray-800/90">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Gợi ý nhanh</div>
        <div className="flex flex-wrap gap-2 text-sm">
          {suggestionsBySubject(subject).map((g,i)=>(
            <button key={i} className="px-3 py-1.5 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>quickPrompt(g)}>
              <Sparkles className="w-4 h-4 inline mr-1 text-blue-500"/>{g}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="mt-3 rounded-2xl border dark:border-gray-700 p-4 bg-white/90 dark:bg-gray-800/90 min-h-[320px] flex flex-col gap-2">
        {msgs.length===0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">Hỏi bất cứ điều gì về {subject} L{grade}. Ví dụ: “Giải thích hệ thức Vi-ét và cách áp dụng để tính tổng nghiệm.”</div>
        )}
        {msgs.map((m,i)=>(<Bubble key={i} role={m.role}>{m.content}</Bubble>))}
      </div>

      {/* Input */}
      <div className="mt-3 rounded-2xl border dark:border-gray-700 p-2 flex items-center gap-2 bg-white dark:bg-gray-800">
        <Search className="w-5 h-5 text-gray-500 ml-2"/>
        <input className="flex-1 px-2 py-2 outline-none bg-transparent" placeholder="Nhập câu hỏi… (Ctrl/⌘+Enter để gửi)" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter' && (e.ctrlKey||e.metaKey)) ask(); }} />
        <button className="px-3 py-2 rounded-xl bg-black text-white dark:bg-blue-600" onClick={ask} disabled={busy}><Send className="w-4 h-4"/></button>
      </div>
    </div>
  );
}

// ================= Mock backend =================
async function mockFetchAnswer({ question, subject, grade, intent, forbidFullSolution }:{ question:string; subject:Subject; grade:string; intent:QAIntent; forbidFullSolution:boolean }): Promise<AnswerPayload>{
  const lower = question.toLowerCase();
  // Heuristic đơn giản để demo
  const isProblem = /(giải|tính|pt|phương trình|chứng minh|bài\s*\d+)/.test(lower);
  const unit = isProblem
    ? (subject==="Toán"?"u-lap-he": "u-present-perfect")
    : (subject==="Toán"?"u-viet": "u-reading-skimming");

  const sources: SourceRef[] = subject === "Toán"
    ? [ { id: "s1", title: "Cẩm nang: Hệ phương trình", kind: "handbook", unitId: "u-lap-he" }, { id: "s2", title: "Tài liệu: Công thức Vi-ét", kind: "material", unitId: "u-viet" } ]
    : [ { id: "s4", title: "Handbook: Present Perfect", kind: "handbook", unitId: "u-present-perfect" } ];

  const disclaimers = forbidFullSolution && isProblem ? ["Theo chế độ an toàn, mình sẽ KHÔNG đưa lời giải hoàn chỉnh. Mình sẽ gợi ý và hỏi dẫn từng bước để bạn tự làm."] : [];

  const chunks: AnswerChunk[] = [];
  if(intent==="concept"){
    chunks.push({ type: "text", content: subject==="Toán"? "**Hệ thức Vi-ét**: Với phương trình bậc hai x^2+bx+c=0 (a=1) thì S=x1+x2=-b, P=x1·x2=c. Ứng dụng: suy nhanh tổng/tích nghiệm, lập phương trình mới." : "**Present Perfect** diễn tả hành động đã xảy ra trong quá khứ nhưng còn liên hệ hiện tại; dấu hiệu: just, already, yet, ever, never, for, since." });
    chunks.push({ type: "hint", content: "Muốn áp dụng tốt, luôn chỉ ra dữ kiện khớp với công thức/khung cần dùng." });
  } else if(intent==="socratic"){
    chunks.push({ type: "text", content: isProblem? "Bắt đầu bằng việc nhận diện đại lượng và thiết lập điều kiện. Mình sẽ hỏi theo từng bước, bạn nhập câu trả lời nhé." : "Mình sẽ dẫn dắt theo câu hỏi vi mô để bạn tự hình thành đáp án." });
    chunks.push({ type: "step", content: subject==="Toán"? "B1: Gọi ẩn và nêu điều kiện (VD: x>0)." : "B1: Nhận diện dấu hiệu thời – có 'since/for' không?" });
    chunks.push({ type: "step", content: subject==="Toán"? "B2: Biểu diễn đại lượng, lập PT(1),(2)." : "B2: Chọn công thức have/has + V3, chú ý bất quy tắc." });
    chunks.push({ type: "step", content: subject==="Toán"? "B3: Giải hệ và so với điều kiện; loại nghiệm không phù hợp." : "B3: Kiểm tra thì bằng mốc thời gian, sửa lỗi chủ-vị." });
  } else {
    chunks.push({ type: "hint", content: subject==="Toán"? "Nếu xuất hiện 2 mối quan hệ độc lập → thử lập hệ thay vì 1 PT." : "Ghi nhớ cụm 'have/has been' cho Present Perfect Continuous." });
  }

  return new Promise(resolve=> setTimeout(()=> resolve({ answer: chunks, sources, unitId: unit, detectedProblem: isProblem, disclaimers }), 500));
}

function suggestionsBySubject(s: Subject){
  if(s==="Toán") return [
    "Nhắc lại hệ thức Vi-ét và ví dụ áp dụng",
    "Gợi ý từng bước lập hệ phương trình cho bài chuyển động",
    "Các lỗi thường gặp khi giải hệ bằng phương pháp thế"
  ];
  return [ // for English
    "Phân biệt Present Perfect và Past Simple",
    "Mẹo skimming và scanning khi đọc hiểu",
    "10 collocations với 'make/do/take'"
  ];
}

// ================= Demo / Exported Component =================
const GiaSuAI: React.FC = () => {
  return (
    <QAModuleComponent
      subject="Toán"
      grade="9"
      openHandbook={(id)=>alert("Mở Cẩm nang: "+id)}
      openTutor={(id)=>alert("Mở Gia sư: "+id)}
      openAssess={(id)=>alert("Luyện 10–15' theo: "+id)}
      logEvent={(e)=>console.log("QA EVENT", e)}
    />
  );
}

export default GiaSuAI;
