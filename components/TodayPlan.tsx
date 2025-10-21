import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Clock, CheckCircle2, GraduationCap, BookOpen, ListChecks, Flame, Pause, Play, RefreshCw, Edit2, Trash2, Plus, Sparkles, Target, AlertTriangle } from "lucide-react";
import { Subject, SubjectSelect } from "./ThreeSubjects";

/**
 * TodaysPlan.tsx — "Kế hoạch hôm nay" theo yêu cầu mới (MS05)
 * - Trích xuất các phiên học trong ngày (từ Planner) và hiển thị theo thời gian/ưu tiên.
 * - 3 chế độ phiên: Gia sư (Tutor) • Luyện 10–15' (Assess) • Ôn Cẩm nang (Handbook).
 * - Theo dõi: thời lượng còn lại, trạng thái (Chưa bắt đầu/Đang học/Hoàn thành), số gợi ý đã dùng, ghi chú nhanh.
 * - Hành động nhanh theo vòng lặp 3-trong-1: Mở Gia sư / Cẩm nang / Luyện đề.
 * - Pomodoro đơn giản (mặc định 25' + nghỉ 5'). Có thể tiếp tục/tạm dừng/kết thúc.
 * - Dời lịch ±1 ngày, đánh dấu xong, re-plan gợi ý nếu "điểm yếu" còn tồn tại.
 * - Props callbacks để nối backend: onStartSession/onFinishSession/onDelay/onDelete/onUpdate.
 * - Có Demo offline để chạy ngay.
 *
 * Cách dùng nhanh:
 *   import TodaysPlan, { DemoTodaysPlan } from "./TodayPlan";
 *   export default function Page(){ return <DemoTodaysPlan/> }
 */

// ===================== Types =====================
export type SessionMode = "tutor" | "assess" | "handbook";
export type Priority = 1 | 2 | 3; // 1=High

export type PlanSession = {
  id: string;
  subject: Subject;          // Toán / Ngữ văn / Tiếng Anh
  unitId: string;            // liên kết đơn vị kiến thức
  unitTitle: string;         // tên hiển thị đơn vị
  mode: SessionMode;         // tutor|assess|handbook
  plannedMinutes: 15 | 25 | 30 | 45 | 60; // thời lượng gợi ý
  startAt?: string;          // ISO HH:mm (tuỳ chọn)
  notes?: string;
  priority: Priority;        // 1 (cao) 2 (tb) 3 (thấp)
  status?: "idle" | "running" | "done";
  progress?: { usedHints?: number; elapsed?: number }; // phút đã học, gợi ý đã dùng (nếu có)
};

export type TodayMeta = {
  dateISO: string;           // yyyy-mm-dd của hôm nay
  totalBudget: number;       // tổng phút dự kiến hôm nay
  adherencePct?: number;     // % bám kế hoạch (nếu có)
  weakUnits?: { id: string; title: string; subject: Subject }[]; // gợi ý thêm
};

export type TodaysPlanProps = {
  meta: TodayMeta;
  sessions: PlanSession[];

  // deep links
  openTutor?: (unitId: string) => void;
  openAssess?: (unitId?: string) => void;
  openHandbook?: (unitId: string) => void;

  // actions → backend/logging
  onStartSession?: (id: string) => void | Promise<void>;
  onFinishSession?: (id: string, payload: { elapsed: number; usedHints?: number; notes?: string }) => void | Promise<void>;
  onUpdateSession?: (id: string, patch: Partial<PlanSession>) => void | Promise<void>;
  onDeleteSession?: (id: string) => void | Promise<void>;
  onDelaySession?: (id: string, days: -1 | 1) => void | Promise<void>;
  onQuickAdd?: (payload: Omit<PlanSession, "id"|"status"|"progress">) => void | Promise<void>;
};

// ===================== Child Components =====================
interface SessionRowProps {
  s: PlanSession; active: boolean; elapsedSeconds: number; phase: 'focus'|'break';
  onStart: ()=>void; onPause: ()=>void; onResume: ()=>void; onStop:(completed:boolean)=>void; onDelay:(days:-1|1)=>void;
  onUpdate:(patch: Partial<PlanSession>)=>void; onDelete:()=>void; openTutor:()=>void; openAssess:()=>void; openHandbook:()=>void; onTogglePhase:()=>void;
}
const SessionRow: React.FC<SessionRowProps> = ({ s, active, elapsedSeconds, phase, onStart, onPause, onResume, onStop, onDelay, onUpdate, onDelete, openTutor, openAssess, openHandbook, onTogglePhase })=>{
  const remaining = Math.max(0, s.plannedMinutes*60 - (active? elapsedSeconds : (s.progress?.elapsed||0)*60));
  const mm = Math.floor(remaining/60).toString().padStart(2,'0');
  const ss = Math.floor(remaining%60).toString().padStart(2,'0');

  const chip = s.mode==='tutor'? <span className="px-2 py-0.5 rounded-full border text-xs inline-flex items-center gap-1"><GraduationCap className="w-3 h-3"/>Gia sư</span>
             : s.mode==='assess'? <span className="px-2 py-0.5 rounded-full border text-xs inline-flex items-center gap-1"><ListChecks className="w-3 h-3"/>Luyện 10–15'</span>
             : <span className="px-2 py-0.5 rounded-full border text-xs inline-flex items-center gap-1"><BookOpen className="w-3 h-3"/>Cẩm nang</span>;

  return (
    <div className={`rounded-2xl border p-4 bg-white/90 dark:bg-gray-800/90 ${active? 'border-black dark:border-blue-400' : 'dark:border-gray-700'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{s.subject} • {s.startAt||'—'} • Ưu tiên {s.priority}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{s.unitTitle}</div>
          <div className="mt-1">{chip}</div>
        </div>
        <div className="text-right min-w-[180px]">
          {s.status==='done' ? (
            <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 text-sm"><CheckCircle2 className="w-4 h-4"/>Hoàn thành</span>
          ) : active ? (
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 text-sm"><Clock className="w-4 h-4"/>Còn {mm}:{ss} • {phase==='focus'? 'Tập trung' : 'Nghỉ'}</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><Clock className="w-4 h-4"/>Dự kiến {s.plannedMinutes}'</span>
          )}
        </div>
      </div>

      {/* actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {s.status!=='done' && !active && <button className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-blue-600 font-semibold" onClick={onStart}><Play className="w-4 h-4 inline mr-1"/>Bắt đầu</button>}
        {active && <>
          <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={onTogglePhase}><RefreshCw className="w-4 h-4 inline mr-1"/>Đổi {phase==='focus'? '→ Nghỉ' : '→ Học'}</button>
          <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={onPause}><Pause className="w-4 h-4 inline mr-1"/>Tạm dừng</button>
          <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={onResume}><Play className="w-4 h-4 inline mr-1"/>Tiếp tục</button>
          <button className="px-3 py-1.5 rounded-xl border border-green-600 text-green-700 dark:border-green-500 dark:text-green-400 font-semibold" onClick={()=>onStop(true)}><CheckCircle2 className="w-4 h-4 inline mr-1"/>Kết thúc</button>
        </>}
        {s.status!=='done' && !active && <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={()=>onDelay(1)}>Dời sang mai</button>}
        {s.status!=='done' && !active && <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={()=>onDelay(-1)}>Dời về hôm qua</button>}
        <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={openTutor}><GraduationCap className="w-4 h-4 inline mr-1"/>Gia sư</button>
        <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={openHandbook}><BookOpen className="w-4 h-4 inline mr-1"/>Cẩm nang</button>
        <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={openAssess}><ListChecks className="w-4 h-4 inline mr-1"/>Luyện 10–15'</button>
        <span className="ml-auto inline-flex gap-2">
          <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600" onClick={()=>onUpdate({ notes: window.prompt('Ghi chú:', s.notes||'') || s.notes })}><Edit2 className="w-4 h-4"/></button>
          <button className="px-3 py-1.5 rounded-xl border dark:border-gray-600 text-red-600 dark:text-red-400" onClick={onDelete}><Trash2 className="w-4 h-4"/></button>
        </span>
      </div>

      {/* footer info */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
        {s.progress?.usedHints!=null && <span>Gợi ý đã dùng: <b>{s.progress.usedHints}</b></span>}
        {s.notes && <span className="italic">Ghi chú: {s.notes}</span>}
      </div>
    </div>
  );
};

const MiniStat: React.FC<{ icon:React.ReactNode; label:string; value:string }> = ({ icon, label, value })=>{
  return (
    <div className="rounded-xl border dark:border-gray-700 p-3">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 inline-flex items-center gap-2">{icon}{label}</div>
      <div className="text-xl font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
};

const QuickAdd: React.FC<{ onAdd?: (p: Omit<PlanSession, 'id'|'status'|'progress'>)=>void|Promise<void>; defaultSubject: Subject }> = ({ onAdd, defaultSubject })=>{
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>(defaultSubject);
  const [mode, setMode] = useState<SessionMode>("tutor");
  const [minutes, setMinutes] = useState<15|25|30|45|60>(25);
  const [unitId, setUnitId] = useState("");

  useEffect(() => {
    setSubject(defaultSubject);
  }, [defaultSubject]);

  const handleAdd = () => {
    if (!title.trim()) {
        alert("Vui lòng nhập tên đơn vị kiến thức.");
        return;
    }
    onAdd?.({ 
        subject, 
        unitId: unitId.trim() || Math.random().toString(36).slice(2,8), 
        unitTitle: title.trim(), 
        mode, 
        plannedMinutes: minutes, 
        priority: 2 
    });
    setTitle("");
    setUnitId("");
  }

  return (
    <div className="mt-5 rounded-2xl border dark:border-gray-700 p-4 bg-white/90 dark:bg-gray-800/90">
      <div className="font-semibold mb-2">Thêm nhanh phiên cho hôm nay</div>
      <div className="grid md:grid-cols-5 gap-2 items-end">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 dark:text-gray-400">Đơn vị kiến thức</label>
          <input className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" value={title} onChange={e=>setTitle(e.target.value)} placeholder="VD: Lập hệ phương trình"/>
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Môn</label>
          <SubjectSelect value={subject} onChange={setSubject} className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Chế độ</label>
          <select className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" value={mode} onChange={e=>setMode(e.target.value as SessionMode)}>
            <option value="tutor">Gia sư</option>
            <option value="assess">Luyện 10–15'</option>
            <option value="handbook">Cẩm nang</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Thời lượng</label>
          <select className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" value={minutes} onChange={e=>setMinutes(Number(e.target.value) as any)}>
            <option value={15}>15'</option>
            <option value={25}>25'</option>
            <option value={30}>30'</option>
            <option value={45}>45'</option>
            <option value={60}>60'</option>
          </select>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <input className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" placeholder="Nhập unitId nếu có (để liên kết Gia sư/Cẩm nang/Luyện)" value={unitId} onChange={e=>setUnitId(e.target.value)} />
        <button className="px-3 py-2 rounded-xl bg-black text-white dark:bg-blue-600 font-semibold" onClick={handleAdd}>
          <Plus className="w-4 h-4 inline mr-1"/>Thêm phiên
        </button>
      </div>
    </div>
  );
};

// ===================== Main Component =====================
export default function TodaysPlan(props: TodaysPlanProps){
  const [subjectFilter, setSubjectFilter] = useState<Subject>("Toán");
  const [runningId, setRunningId] = useState<string|undefined>();
  const [elapsed, setElapsed] = useState(0);        // giây
  const [phase, setPhase] = useState<"focus"|"break">("focus");
  const timerRef = useRef<number|null>(null);

  const sessions = useMemo(()=>{
    const allSessions = props.sessions || [];
    const sorted = [...allSessions].sort((a,b)=> (a.startAt||"99:99").localeCompare(b.startAt||"99:99") || a.priority - b.priority);
    return sorted.filter(s => s.subject === subjectFilter);
  }, [props.sessions, subjectFilter]);

  useEffect(()=>{
    return ()=>{ if(timerRef.current) window.clearInterval(timerRef.current); };
  },[]);
  
  const totalsAll = useMemo(() => {
    const allSessions = props.sessions || [];
    return {
        planned: allSessions.reduce((a,b)=>a+b.plannedMinutes,0),
        doneCount: allSessions.filter(s=>s.status==='done').length,
        count: allSessions.length,
    }
  }, [props.sessions]);

  function start(id: string){
    if(runningId && runningId!==id) stop(runningId, false);
    setRunningId(id); setPhase("focus"); setElapsed(0);
    props.onStartSession?.(id);
    if(timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(()=> setElapsed(t=>t+1), 1000);
  }
  function pause(){ if(timerRef.current){ window.clearInterval(timerRef.current); timerRef.current=null; } }
  function resume(){ if(!timerRef.current){ timerRef.current = window.setInterval(()=> setElapsed(t=>t+1), 1000); } }
  function stop(id: string, completed=true){
    if(timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null; setRunningId(undefined);
    if(completed){ props.onFinishSession?.(id, { elapsed: Math.round(elapsed/60) }); }
    setElapsed(0);
  }

  function togglePhase(){ setPhase(p=> p==='focus'?'break':'focus'); setElapsed(0); }

  return (
    <div className="mx-auto max-w-6xl p-5 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5"/>
            <div className="text-lg font-semibold">Kế hoạch hôm nay</div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{props.meta.dateISO}</span>
        </div>
        <div className="ml-auto flex gap-2 items-center self-end sm:self-center">
          <div className="hidden md:block text-xs text-gray-600 dark:text-gray-400">Ngân sách: <b>{props.meta.totalBudget}'</b> • Đã lên lịch: <b>{totalsAll.planned}'</b> • Hoàn thành: <b>{totalsAll.doneCount}/{totalsAll.count}</b></div>
          <div>
            <SubjectSelect value={subjectFilter} onChange={setSubjectFilter} className="px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* Overview bar */}
      <div className="rounded-2xl border dark:border-gray-700 p-4 mb-4 bg-white/90 dark:bg-gray-800/90">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat icon={<Clock className="w-4 h-4"/>} label="Phút đã học" value={`${sumElapsedMinutes(props.sessions)}'`} />
          <MiniStat icon={<CheckCircle2 className="w-4 h-4"/>} label="Phiên hoàn thành" value={`${props.sessions.filter(s=>s.status==='done').length}`} />
          <MiniStat icon={<Target className="w-4 h-4"/>} label="Tuân thủ" value={`${props.meta.adherencePct??"—"}%`} />
          <MiniStat icon={<Flame className="w-4 h-4"/>} label="Ưu tiên cao" value={`${props.sessions.filter(s=>s.priority===1).length}`} />
        </div>
      </div>

      {/* Sessions list */}
      <div className="space-y-3">
        {sessions.map(s => (
          <SessionRow key={s.id}
            s={s}
            active={runningId===s.id}
            elapsedSeconds={runningId===s.id? elapsed : 0}
            phase={phase}
            onStart={()=>start(s.id)}
            onPause={pause}
            onResume={resume}
            onStop={(completed)=>stop(s.id, completed)}
            onDelay={(days)=>props.onDelaySession?.(s.id, days)}
            onUpdate={(patch)=>props.onUpdateSession?.(s.id, patch)}
            onDelete={()=>props.onDeleteSession?.(s.id)}
            openTutor={()=>props.openTutor?.(s.unitId)}
            openAssess={()=>props.openAssess?.(s.unitId)}
            openHandbook={()=>props.openHandbook?.(s.unitId)}
            onTogglePhase={togglePhase}
          />
        ))}
        {sessions.length===0 && (
          <div className="rounded-2xl border dark:border-gray-700 p-6 text-center text-sm text-gray-600 dark:text-gray-400">Không có phiên nào cho {subjectFilter} hôm nay. Hãy thêm nhanh hoặc chuyển sang môn khác.</div>
        )}
      </div>

      {/* Weak units suggestions */}
      <div className="mt-5 rounded-2xl border dark:border-gray-700 p-4 bg-white/90 dark:bg-gray-800/90">
        <div className="font-semibold mb-2">Gợi ý thêm cho hôm nay (từ các môn)</div>
        {props.meta.weakUnits?.length ? (
          <div className="flex flex-wrap gap-2 text-sm">
            {props.meta.weakUnits.slice(0,6).map(u => (
              <span key={u.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border dark:border-gray-600">
                {u.subject} • {u.title}
                <button className="underline" onClick={()=>props.openTutor?.(u.id)}>Gia sư</button>
                <button className="underline" onClick={()=>props.openHandbook?.(u.id)}>Cẩm nang</button>
                <button className="underline" onClick={()=>props.openAssess?.(u.id)}>Luyện</button>
              </span>
            ))}
          </div>
        ) : <div className="text-sm text-gray-600 dark:text-gray-400">Không có gợi ý nào. Tiếp tục theo kế hoạch là ổn!</div>}
      </div>

      {/* Quick add */}
      <QuickAdd onAdd={props.onQuickAdd} defaultSubject={subjectFilter} />
    </div>
  );
}

// ===================== Utils =====================
function sumElapsedMinutes(list: PlanSession[]){
  return list.reduce((a,b)=> a + (b.progress?.elapsed||0), 0);
}

// ===================== Demo =====================
export function DemoTodaysPlan(){
  const [sessions, setSessions] = useState<PlanSession[]>([
    { id:'s1', subject:'Toán', unitId:'u1', unitTitle:'Lập hệ phương trình', mode:'tutor', plannedMinutes:45, startAt:'07:30', priority:1, progress:{usedHints:2, elapsed:10} },
    { id:'s2', subject:'Toán', unitId:'u2', unitTitle:'Hệ thức Vi-ét', mode:'handbook', plannedMinutes:15, startAt:'09:00', priority:2 },
    { id:'s4', subject:'Tiếng Anh', unitId:'u7', unitTitle:'Present Perfect', mode:'tutor', plannedMinutes:30, startAt:'20:15', priority:2 },
  ]);

  const meta: TodayMeta = {
    dateISO: new Date().toISOString().slice(0,10),
    totalBudget: 90,
    adherencePct: 75,
    weakUnits: [ { id:'u1', title:'Lập hệ phương trình', subject:'Toán' }, { id:'u7', title:'Present Perfect', subject:'Tiếng Anh' } ]
  };

  return (
    <TodaysPlan
      meta={meta}
      sessions={sessions}
      openTutor={(id)=>alert('Mở Gia sư: '+id)}
      openHandbook={(id)=>alert('Mở Cẩm nang: '+id)}
      openAssess={(id)=>alert("Luyện 10–15' theo: "+(id||'tổng hợp'))}
      onStartSession={(id)=>console.log('start',id)}
      onFinishSession={(id,p)=>{ console.log('finish',id,p); setSessions(ss=> ss.map(x=> x.id===id? { ...x, status:'done', progress:{ ...(x.progress||{}), elapsed: (x.progress?.elapsed||0) + p.elapsed } } : x)); }}
      onUpdateSession={(id,patch)=> setSessions(ss=> ss.map(x=> x.id===id? { ...x, ...patch } : x))}
      onDeleteSession={(id)=> setSessions(ss=> ss.filter(x=>x.id!==id))}
      onDelaySession={(id,days)=> alert(`Dời phiên ${id} ${days===1?'sang mai':'về hôm qua'}`)}
      onQuickAdd={(p)=> setSessions(ss=> [{ id: Math.random().toString(36).slice(2,8), ...p }, ...ss])}
    />
  );
}