import React from "react";
import {
  LayoutList, FileText, Sparkles, Clock, Filter,
  Timer, Layers, Target, Search, Play, CheckCircle2
} from "lucide-react";

/* ============ Types & Demo data ============ */
type Subject = "Toán" | "Tiếng Anh";
type Grade = "8" | "9";
type TabKey = "topic" | "mock" | "smart" | "history";

type Unit = { id: string; subject: Subject; title: string };
type MockExam = {
  id: string; title: string; subject: Subject; grade: Grade;
  minutes: number; difficulty: "easy"|"medium"|"hard"; units: string[]; available?: boolean;
};
type HistoryItem = { id: string; title: string; subject: Subject; minutes: number; score: number; date: string };

const UNITS: Unit[] = [
  { id:"u1", subject:"Toán",      title:"Giải bài toán bằng cách lập hệ PT" },
  { id:"u2", subject:"Toán",      title:"Hệ thức Vi-ét" },
  { id:"u3", subject:"Toán",      title:"Hàm số y = ax^2" },
  { id:"u7", subject:"Tiếng Anh", title:"Present Perfect" },
  { id:"u8", subject:"Tiếng Anh", title:"Reading – Inference" },
];

const MOCKS: MockExam[] = [
  { id:"m1", title:"Đề 2024 – THPT A",     subject:"Toán",      grade:"9", minutes:45, difficulty:"medium", units:["u1","u2"], available:true },
  { id:"m2", title:"Đề 2024 – EN Trial B", subject:"Tiếng Anh", grade:"9", minutes:45, difficulty:"medium", units:["u7","u8"], available:true },
  { id:"m3", title:"Đề Mini – Algebra",    subject:"Toán",      grade:"8", minutes:30, difficulty:"easy",   units:["u2","u3"] },
];

const HISTORY: HistoryItem[] = [
  { id:"h1", title:"Mini 15' – Hệ PT", subject:"Toán", minutes:15, score:7.5, date:"2025-10-17 19:40" },
  { id:"h2", title:"Reading – Inference", subject:"Tiếng Anh", minutes:20, score:8.0, date:"2025-10-16 20:10" },
];

/* ============ Small UI helpers ============ */
const Chip: React.FC<{active?:boolean; pressed?:boolean; children:React.ReactNode; onClick?:()=>void}> = ({active, children, onClick, pressed}) => (
  <button onClick={onClick}
    className={`px-4 py-2 rounded-xl border text-sm transition ${active||pressed ? "bg-black text-white dark:bg-white dark:text-black dark:border-white" : "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"}`}
    aria-pressed={pressed}
  >
    {children}
  </button>
);

const TabBtn = ({active,label,icon,onClick}:{active:boolean;label:string;icon:React.ReactNode;onClick:()=>void}) => (
  <button role="tab" aria-selected={active} onClick={onClick}
    className={`px-3 py-1.5 rounded-xl border text-sm ${active?"bg-black text-white dark:bg-white dark:text-black dark:border-white":"bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"}`}>
    <span className="inline-flex items-center gap-1">{icon}{label}</span>
  </button>
);

/* ============ Main ============ */
export default function MockExam2Subjects() {
  const [subject,setSubject] = React.useState<Subject>("Toán");
  const [grade,setGrade]     = React.useState<Grade>("9");
  const [tab,setTab]         = React.useState<TabKey>("topic");

  // Cấu hình dùng cho “Tóm tắt”
  const [minutes,setMinutes] = React.useState<number>(15);
  const [items,setItems]     = React.useState<number>(10);

  // Keyboard shortcuts
  React.useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if (e.altKey) {
        if (e.key==="1") setTab("topic");
        if (e.key==="2") setTab("mock");
        if (e.key==="3") setTab("smart");
        if (e.key==="4") setTab("history");
      } else {
        if (["1","2","3"].includes(e.key)) {
          const map:{[k:string]:number} = {"1":15,"2":30,"3":45};
          setMinutes(map[e.key]); // thời lượng
        }
        if (["q","w","e"].includes(e.key.toLowerCase())) {
          const map:{[k:string]:number} = {q:10,w:20,e:30};
          setItems(map[e.key.toLowerCase()]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  },[]);

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b dark:border-gray-700">
        <div className="px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
            Luyện đề
          </div>

          {/* Tabs */}
          <div role="tablist" className="inline-flex gap-2 ml-2">
            <TabBtn active={tab==="topic"}   label="Theo chuyên đề" icon={<LayoutList className="w-4 h-4"/>} onClick={()=>setTab("topic")}/>
            <TabBtn active={tab==="mock"}    label="Đề thi thử"     icon={<FileText   className="w-4 h-4"/>} onClick={()=>setTab("mock")}/>
            <TabBtn active={tab==="smart"}   label="Đề thông minh (AI)" icon={<Sparkles className="w-4 h-4"/>} onClick={()=>setTab("smart")}/>
            <TabBtn active={tab==="history"} label="Lịch sử"        icon={<Clock      className="w-4 h-4"/>} onClick={()=>setTab("history")}/>
          </div>

          {/* Selectors */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400"><Filter className="w-4 h-4 inline mr-1"/>Môn</span>
            <div className="inline-flex rounded-xl border dark:border-gray-600 overflow-hidden">
              {(["Toán","Tiếng Anh"] as const).map(s=>(
                <button key={s} onClick={()=>setSubject(s)} className={`px-3 py-1.5 text-sm ${subject===s?"bg-black text-white dark:bg-white dark:text-black":"bg-white dark:bg-gray-800"}`}>{s}</button>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Khối</span>
            <div className="inline-flex rounded-xl border dark:border-gray-600 overflow-hidden">
              {(["8","9"] as const).map(g=>(
                <button key={g} onClick={()=>setGrade(g)} className={`px-3 py-1.5 text-sm ${grade===g?"bg-black text-white dark:bg-white dark:text-black":"bg-white dark:bg-gray-800"}`}>{g}</button>
              ))}
            </div>

            {/* Summary pill */}
            <div className="hidden md:block text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-gray-800 dark:border-gray-600">
              {subject} • Lớp {grade} • {minutes}' • {items} câu
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {tab==="topic"   && <TopicBuilder subject={subject} minutes={minutes} setMinutes={setMinutes} items={items} setItems={setItems} />}
        {tab==="mock"    && <MockLibrary subject={subject} grade={grade} />}
        {tab==="smart"   && <SmartBuilder subject={subject} grade={grade} minutes={minutes} setMinutes={setMinutes} />}
        {tab==="history" && <HistoryList subject={subject} />}
      </div>
    </div>
  );
}

/* ============ Tab: Theo chuyên đề ============ */
function TopicBuilder({
  subject, minutes, setMinutes, items, setItems
}:{ subject:Subject; minutes:number; setMinutes:(n:number)=>void; items:number; setItems:(n:number)=>void }) {
  type Mode = "mini"|"short"|"full"|"targeted";
  const PRESET = {
    mini:     { minutes:15, items:10, label:"15' / 10 câu", icon:<Timer className="w-4 h-4"/> },
    short:    { minutes:30, items:20, label:"30' / 20 câu", icon:<Layers className="w-4 h-4"/> },
    full:     { minutes:45, items:30, label:"45' / 30 câu", icon:<FileText className="w-4 h-4"/> },
    targeted: { minutes:20, items:12, label:"Theo mục tiêu", icon:<Target className="w-4 h-4"/> },
  } as const;

  const [mode,setMode] = React.useState<Mode>("mini");
  const [picked,setPicked] = React.useState<string[]>([]);
  const units = UNITS.filter(u=>u.subject===subject);

  React.useEffect(()=>{
    if (mode!=="targeted") {
      setMinutes(PRESET[mode].minutes);
      setItems(PRESET[mode].items);
    }
  },[mode, setMinutes, setItems]);

  const toggle = (id:string)=> setPicked(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
  const start = ()=> alert(`Bắt đầu luyện: ${subject} • ${minutes}' • ${items} câu • units=${JSON.stringify(picked)}`);

  return (
    <div className="rounded-3xl border dark:border-gray-700 p-5 bg-white dark:bg-gray-800 space-y-5">
      <div className="text-lg font-semibold">Luyện đề theo chuyên đề</div>

      <div className="rounded-2xl border dark:border-gray-700 p-4">
        <div className="font-medium inline-flex items-center gap-2"><LayoutList className="w-4 h-4"/> 1. Chọn chuyên đề</div>
        <div className="mt-3 space-y-2">
          {units.map(u=>(
            <label key={u.id} className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" checked={picked.includes(u.id)} onChange={()=>toggle(u.id)} />
              <span>{u.title}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border dark:border-gray-700 p-4">
        <div className="font-medium inline-flex items-center gap-2"><Target className="w-4 h-4"/> 2. Cấu hình đề thi</div>

        <div className="mt-3 grid md:grid-cols-3 gap-3">
          {/* Presets */}
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Chọn nhanh</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PRESET) as Mode[]).map(k=>(
                <Chip key={k} active={mode===k} onClick={()=>setMode(k)}>
                  <span className="inline-flex items-center gap-2">{PRESET[k].icon}{PRESET[k].label}</span>
                </Chip>
              ))}
            </div>
          </div>

          {/* Minutes */}
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Thời lượng</div>
            <div className="inline-flex gap-2">
              {[15,30,45].map(t=>(
                <Chip key={t} pressed={minutes===t} onClick={()=>{ setMinutes(t); setMode(t===15?"mini":t===30?"short":"full"); }}>
                  {t}'
                </Chip>
              ))}
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Số câu hỏi</div>
            <div className="inline-flex gap-2">
              {[10,20,30].map(n=>(
                <Chip key={n} pressed={items===n} onClick={()=>setItems(n)}>{n}</Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button onClick={start} className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
            <Play className="w-4 h-4 inline mr-1"/> Bắt đầu làm bài
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Tab: Đề thi thử ============ */
function MockLibrary({ subject, grade }:{ subject:Subject; grade:Grade }) {
  const [q,setQ] = React.useState("");
  const [diff,setDiff] = React.useState<"Tất cả"|"Dễ"|"TB"|"Khó">("Tất cả");

  const list = MOCKS.filter(m =>
    m.subject===subject && m.grade===grade &&
    (q==="" || m.title.toLowerCase().includes(q.toLowerCase())) &&
    (diff==="Tất cả" || (diff==="Dễ" && m.difficulty==="easy") ||
     (diff==="TB" && m.difficulty==="medium") ||
     (diff==="Khó" && m.difficulty==="hard"))
  );

  const start = (m:MockExam)=> alert(`Làm ngay: ${m.title} • ${m.minutes}'`);

  return (
    <div className="rounded-3xl border dark:border-gray-700 p-5 bg-white dark:bg-gray-800 space-y-4">
      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-3">
        <div className="col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"/>
          <input className="w-full pl-9 pr-3 py-2 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" placeholder="Tìm đề theo tên…"
                 value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div>
          <select className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" value={diff} onChange={e=>setDiff(e.target.value as any)}>
            <option>Tất cả</option><option>Dễ</option><option>TB</option><option>Khó</option>
          </select>
        </div>
        <div>
          <select className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" value={subject} disabled>
            <option>Toán</option><option>Tiếng Anh</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      {!list.length ? (
        <div className="text-sm text-gray-600 dark:text-gray-400">Không tìm thấy đề phù hợp.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map(m=>(
            <div key={m.id} className="rounded-2xl border dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {m.subject} • Lớp {m.grade} • {m.minutes}' • {m.difficulty}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.units.slice(0,4).map(uid=>{
                      const u=UNITS.find(x=>x.id===uid)!;
                      return <span key={uid} className="text-xs px-2 py-0.5 rounded-full border dark:border-gray-600">{u.title}</span>;
                    })}
                  </div>
                </div>
                {m.available && <span className="text-xs px-2 py-0.5 rounded-full border bg-black text-white dark:bg-white dark:text-black">Có sẵn</span>}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={()=>start(m)} className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black">Làm ngay</button>
                <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600">Xem chi tiết</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ Tab: Đề thông minh (AI) ============ */
function SmartBuilder({
  subject, grade, minutes, setMinutes
}:{ subject:Subject; grade:Grade; minutes:number; setMinutes:(n:number)=>void }) {
  const [difficulty,setDiff] = React.useState<"Dễ"|"TB"|"Khó">("TB");
  const [unit,setUnit] = React.useState("");

  const unitOpts = UNITS.filter(u=>u.subject===subject);

  const propose = () => {
    alert(`Đề AI: ${subject} • Lớp ${grade} • ${minutes}' • ${difficulty} • unit=${unit || "(none)"}`);
  };

  return (
    <div className="rounded-3xl border dark:border-gray-700 p-5 bg-white dark:bg-gray-800 space-y-4">
      <div className="grid md:grid-cols-4 gap-3">
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Thời lượng</div>
          <div className="inline-flex gap-2">
            {[15,30,45,60].map(t=>(
              <Chip key={t} pressed={minutes===t} onClick={()=>setMinutes(t)}>{t}'</Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Độ khó</div>
          <div className="inline-flex gap-2">
            {(["Dễ","TB","Khó"] as const).map(d=>(
              <Chip key={d} pressed={difficulty===d} onClick={()=>setDiff(d)}>{d}</Chip>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ưu tiên Đơn vị kiến thức</div>
          <select className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700" value={unit} onChange={e=>setUnit(e.target.value)}>
            <option value="">(Không ưu tiên)</option>
            {unitOpts.map(u=><option key={u.id} value={u.id}>{u.title}</option>)}
          </select>
        </div>
      </div>

      <button onClick={propose} className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black">
        Tạo đề gợi ý
      </button>
    </div>
  );
}

/* ============ Tab: Lịch sử ============ */
function HistoryList({ subject }:{ subject:Subject }) {
  const list = HISTORY.filter(h=>h.subject===subject);
  return (
    <div className="rounded-3xl border dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
      <div className="text-lg font-semibold">Lịch sử • {subject}</div>
      <div className="mt-3 space-y-3">
        {list.map(h=>(
          <div key={h.id} className="rounded-2xl border dark:border-gray-700 p-4 bg-white dark:bg-gray-800 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium">{h.title}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{h.date} • {h.minutes}'</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4"/> Điểm
              </span>
              <div className="text-lg font-semibold">{h.score.toFixed(1)}/10</div>
            </div>
            <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600">Làm lại</button>
          </div>
        ))}
        {!list.length && <div className="text-sm text-gray-600 dark:text-gray-400">Chưa có lịch sử cho môn này.</div>}
      </div>
    </div>
  );
}

/* ============ Optional demo export ============ */
export function DemoPage() { return <MockExam2Subjects/>; }