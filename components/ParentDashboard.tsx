import React, { useMemo, useState } from "react";
import { Users, CalendarDays, Clock, Target, BarChart2, AlertTriangle, CheckCircle2, XCircle, GraduationCap, BookOpen, ListChecks, Phone, Mail, Download, Settings, ChevronRight, ChevronLeft, Plus, Sparkles } from "lucide-react";

/**
 * ParentDashboard.tsx — Phụ huynh theo dõi (Guardian Portal)
 * - Tổng quan theo tuần: phút học, phiên đã hoàn thành, tuân thủ kế hoạch, điểm luyện đề, gợi ý dùng
 * - 2 môn cố định: Toán / Tiếng Anh (bảng tiến độ từng môn)
 * - Cảnh báo/khuyến nghị: phát hiện lỗ hổng, quá nhiều gợi ý, bỏ lỡ phiên
 * - Dòng hoạt động gần đây (luyện đề, học với Gia sư, mở Cẩm nang)
 * - Mục tiêu & tập trung (focus units) + hành động nhanh sang Planner / Profile / Tutor / Assess / Handbook
 * - Hooks callback để nối backend: báo cáo PDF/CSV, liên hệ giáo viên, bật thông báo
 *
 * Cách dùng nhanh:
 *   import ParentDashboard, { DemoParentDashboard } from "./ParentDashboard";
 *   export default function Page(){ return <DemoParentDashboard/> }
 */


// ===================== Local Types for 2 Subjects =====================
const SUBJECTS_LOCAL = ["Toán", "Tiếng Anh"] as const;
export type Subject = typeof SUBJECTS_LOCAL[number];

type SubjectSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  value: Subject;
  onChange: (v: Subject) => void;
  className?: string;
};

export function SubjectSelect({ value, onChange, className = "px-3 py-2 border rounded-xl", ...rest }: SubjectSelectProps){
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


// ===================== Types =====================
export type Student = { id: string; name: string; grade: string; className?: string };

// Lớp hợp lệ cho khối 9
export const CLASS_OPTIONS = ["9A","9B","9C","9D","9E","9G","9P"] as const;
export type ClassCode = typeof CLASS_OPTIONS[number];
export function coerceClassName(c?: string): ClassCode | undefined {
  return (c && (CLASS_OPTIONS as readonly string[]).includes(c)) ? (c as ClassCode) : undefined;
}

export type UnitRef = { id: string; title: string; subject: Subject };

export type WeeklySummary = {
  weekOf: string;                  // ISO (Thứ Hai đầu tuần)
  studyMinutes: number;            // tổng phút học
  sessionsPlanned: number;         // phiên trong kế hoạch
  sessionsCompleted: number;       // phiên hoàn thành
  adherencePct: number;            // tuân thủ kế hoạch %
  avgAssessScore: number;          // điểm TB luyện đề 0–10
  hintsUsed: number;               // tổng gợi ý đã dùng
  strongestUnits: UnitRef[];
  weakestUnits: UnitRef[];
};

export type SubjectSummary = {
  subject: Subject;
  masteryPct: number;              // mức độ làm chủ 0–100
  timeMinutes: number;             // phút học trong tuần
  assessAvg: number;               // điểm TB luyện đề 0–10
  hints: number;                   // số gợi ý
};

export type AlertItem = { id: string; level: "info"|"warn"|"crit"; text: string; unitId?: string; subject?: Subject };

export type Activity = { id: string; when: string; kind: "tutor"|"assess"|"handbook"|"plan"; subject: Subject; text: string; unitId?: string; score?: number };

export type ParentDashboardProps = {
  guardianName?: string;
  students: Student[];
  selectedStudentId: string;
  onSelectStudent?: (id:string)=>void;

  weekly: WeeklySummary;
  subjects: SubjectSummary[];  // phải đủ 2 môn
  alerts: AlertItem[];
  activities: Activity[];
  focusUnits?: UnitRef[];      // gợi ý từ Planner/Profile

  // Actions / deep links
  openStudyPlan?: ()=>void;
  openLearningProfile?: ()=>void;
  openTutor?: (unitId:string)=>void;
  openAssess?: (unitId?:string)=>void;
  openHandbook?: (unitId:string)=>void;

  onDownloadReport?: (kind: "pdf"|"csv") => void | Promise<void>;
  onContactTeacher?: ()=>void;
  onContactVia?: (method: "phone"|"email")=>void;
  onToggleNotifications?: (enabled:boolean)=>void;
};

// ===================== Main =====================
export default function ParentDashboard(props: ParentDashboardProps){
  const student = props.students.find(s=>s.id===props.selectedStudentId) || props.students[0];
  const [notif, setNotif] = useState(true);

  function toggleNotif(){ setNotif(v=>{ props.onToggleNotifications?.(!v); return !v; }); }

  const subjects = useMemo(()=>{
    // đảm bảo đủ 2 môn theo thứ tự cố định
    const order: Subject[] = ["Toán", "Tiếng Anh"];
    const map = new Map(props.subjects.map(s=>[s.subject,s] as const));
    return order.map(k => map.get(k) || { subject:k, masteryPct:0, timeMinutes:0, assessAvg:0, hints:0 });
  }, [props.subjects]);

  return (
    <div className="mx-auto max-w-7xl p-5 text-gray-900">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Users className="w-5 h-5"/>
        <div className="text-lg font-semibold">Bảng theo dõi phụ huynh</div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-600">Xin chào{props.guardianName?`, ${props.guardianName}`:''}</span>
          <button className={`px-3 py-2 rounded-xl border ${notif? 'bg-black text-white border-black':''}`} onClick={toggleNotif}>
            <Settings className="w-4 h-4 inline mr-1"/> {notif? 'Đang bật thông báo' : 'Bật thông báo'}
          </button>
          <button className="px-3 py-2 rounded-xl border" onClick={()=>props.onDownloadReport?.("pdf")}><Download className="w-4 h-4 inline mr-1"/>Tải báo cáo tuần (PDF)</button>
        </div>
      </div>

      {/* Student switcher */}
      <div className="rounded-2xl border p-4 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <div className="text-xs text-gray-500">Học sinh</div>
          <select className="px-3 py-2 border rounded-xl" value={student?.id} onChange={e=>props.onSelectStudent?.(e.target.value)}>
            {props.students.map(s => <option key={s.id} value={s.id}>{s.name} (L{s.grade}{coerceClassName(s.className)?` • ${coerceClassName(s.className)}`:''})</option>)}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="px-3 py-2 rounded-xl border" onClick={props.openStudyPlan}><CalendarDays className="w-4 h-4 inline mr-1"/>Kế hoạch học tập</button>
          <button className="px-3 py-2 rounded-xl border" onClick={props.openLearningProfile}><BarChart2 className="w-4 h-4 inline mr-1"/>Hồ sơ học tập</button>
        </div>
      </div>

      {/* Weekly summary cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-5">
        <SummaryCard icon={<Clock className="w-4 h-4"/>} label="Phút học" value={`${props.weekly.studyMinutes}'`} sub={`Tuần bắt đầu ${props.weekly.weekOf}`} />
        <SummaryCard icon={<CheckCircle2 className="w-4 h-4"/>} label="Phiên đã xong" value={`${props.weekly.sessionsCompleted}/${props.weekly.sessionsPlanned}`} sub={`Tuân thủ ${props.weekly.adherencePct}%`} />
        <SummaryCard icon={<Target className="w-4 h-4"/>} label="Điểm luyện đề TB" value={`${props.weekly.avgAssessScore}/10`} sub={`${props.weekly.hintsUsed} gợi ý đã dùng`} />
        <SummaryCard icon={<Sparkles className="w-4 h-4"/>} label="Tập trung" value={props.weekly.weakestUnits[0]?.title || '—'} sub={props.weekly.weakestUnits[0]?.subject || ''} />
      </div>

      {/* Subject progress */}
      <div className="rounded-2xl border p-4 mb-5">
        <div className="font-semibold mb-3">Tiến độ theo môn</div>
        <div className="grid md:grid-cols-2 gap-3">
          {subjects.map(s => <SubjectTile key={s.subject} s={s} />)}
        </div>
      </div>

      {/* Alerts & Recommendations */}
      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <div className="md:col-span-2 rounded-2xl border p-4">
          <div className="font-semibold mb-3">Cảnh báo & Khuyến nghị</div>
          {props.alerts.length===0 ? (
            <div className="text-sm text-gray-600">Không có cảnh báo trong tuần này. Tiếp tục duy trì thói quen học tập tốt!</div>
          ) : (
            <div className="space-y-2">
              {props.alerts.map(a => <AlertRow key={a.id} a={a} openTutor={props.openTutor} openHandbook={props.openHandbook} openAssess={props.openAssess} />)}
            </div>
          )}
        </div>
        <div className="rounded-2xl border p-4">
          <div className="font-semibold mb-3">Mục tiêu tuần này</div>
          <GoalBox
            targetMinutes={Math.max(120, props.weekly.studyMinutes)}
            targetAssessAvg={Math.max(8, props.weekly.avgAssessScore)}
            focusUnits={props.focusUnits || props.weekly.weakestUnits}
            openTutor={props.openTutor}
            openAssess={props.openAssess}
            openHandbook={props.openHandbook}
          />
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border p-4">
        <div className="font-semibold mb-3">Hoạt động gần đây</div>
        {props.activities.length===0 ? (
          <div className="text-sm text-gray-600">Chưa có hoạt động nào được ghi nhận.</div>
        ) : (
          <div className="divide-y">
            {props.activities.map(act => <ActivityRow key={act.id} act={act} openTutor={props.openTutor} openHandbook={props.openHandbook} openAssess={props.openAssess} />)}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-5 flex flex-wrap gap-2 justify-end">
        <button className="px-3 py-2 rounded-xl border" onClick={props.onContactTeacher}><Phone className="w-4 h-4 inline mr-1"/>Liên hệ giáo viên</button>
        <button className="px-3 py-2 rounded-xl border" onClick={()=>props.onContactVia?.("email")}><Mail className="w-4 h-4 inline mr-1"/>Gửi email báo cáo</button>
      </div>
    </div>
  );
}

// ===================== Small components =====================
const SummaryCard: React.FC<{ icon:React.ReactNode; label:string; value:string; sub?:string }> = ({ icon, label, value, sub }) => {
  return (
    <div className="rounded-2xl border p-4 bg-white/90">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1 inline-flex items-center gap-2">{icon}{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
};

const SubjectTile: React.FC<{ s: SubjectSummary }> = ({ s }) => {
  return (
    <div className="rounded-2xl border p-4 bg-white/90">
      <div className="text-sm font-semibold mb-1">{s.subject}</div>
      <div className="text-xs text-gray-600 mb-2">{Math.round(s.timeMinutes)}' • Điểm TB {s.assessAvg}/10 • {s.hints} gợi ý</div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-2 bg-black" style={{ width: `${Math.min(100, Math.max(0, s.masteryPct))}%` }} />
      </div>
      <div className="text-xs text-gray-600 mt-1">Mức độ làm chủ: {s.masteryPct}%</div>
    </div>
  );
};

const AlertRow: React.FC<{ a: AlertItem; openTutor?:(id:string)=>void; openHandbook?:(id:string)=>void; openAssess?:(id?:string)=>void; }> = ({ a, openTutor, openHandbook, openAssess }) => {
  const color = a.level==='crit' ? 'text-red-700 border-red-600' : a.level==='warn' ? 'text-amber-700 border-amber-600' : 'text-gray-700';
  return (
    <div className={`rounded-xl border p-3 ${a.level!=='info'? `${color}`:''}`}>
      <div className="text-sm">{a.text}</div>
      {a.unitId && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <button className="px-3 py-1.5 rounded-xl bg-black text-white" onClick={()=>openTutor?.(a.unitId!)}><GraduationCap className="w-4 h-4 inline mr-1"/>Học với Gia sư</button>
          <button className="px-3 py-1.5 rounded-xl border" onClick={()=>openHandbook?.(a.unitId!)}><BookOpen className="w-4 h-4 inline mr-1"/>Cẩm nang</button>
          <button className="px-3 py-1.5 rounded-xl border" onClick={()=>openAssess?.(a.unitId!)}><ListChecks className="w-4 h-4 inline mr-1"/>Luyện 10–15'</button>
        </div>
      )}
    </div>
  );
};

const ActivityRow: React.FC<{ act: Activity; openTutor?:(id:string)=>void; openHandbook?:(id:string)=>void; openAssess?:(id?:string)=>void; }> = ({ act, openTutor, openHandbook, openAssess }) => {
  const icon = act.kind==='tutor'? <GraduationCap className="w-4 h-4"/> : act.kind==='assess'? <ListChecks className="w-4 h-4"/> : act.kind==='handbook'? <BookOpen className="w-4 h-4"/> : <CalendarDays className="w-4 h-4"/>;
  return (
    <div className="py-3 flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <div className="text-sm">{act.text}</div>
        <div className="text-xs text-gray-600">{new Date(act.when).toLocaleString()} • {act.subject}{act.score!=null?` • Điểm: ${act.score}/10`:''}</div>
        {act.unitId && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <button className="px-3 py-1.5 rounded-xl bg-black text-white" onClick={()=>openTutor?.(act.unitId!)}><GraduationCap className="w-4 h-4 inline mr-1"/>Ôn lại với Gia sư</button>
            <button className="px-3 py-1.5 rounded-xl border" onClick={()=>openHandbook?.(act.unitId!)}><BookOpen className="w-4 h-4 inline mr-1"/>Xem Cẩm nang</button>
            <button className="px-3 py-1.5 rounded-xl border" onClick={()=>openAssess?.(act.unitId!)}><ListChecks className="w-4 h-4 inline mr-1"/>Làm đề tương tự</button>
          </div>
        )}
      </div>
    </div>
  );
};

const GoalBox: React.FC<{ targetMinutes:number; targetAssessAvg:number; focusUnits: UnitRef[]; openTutor?:(id:string)=>void; openAssess?:(id?:string)=>void; openHandbook?:(id:string)=>void; }> = ({ targetMinutes, targetAssessAvg, focusUnits, openTutor, openAssess, openHandbook }) => {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-sm">Mục tiêu gợi ý</div>
      <ul className="text-sm list-disc list-inside mt-1 space-y-1">
        <li>Tổng thời gian học ≥ <b>{targetMinutes}'/tuần</b></li>
        <li>Điểm luyện đề TB ≥ <b>{targetAssessAvg}/10</b></li>
        {focusUnits?.length>0 && <li>Tập trung đơn vị: <b>{focusUnits.slice(0,3).map(u=>u.title).join(', ')}</b></li>}
      </ul>
      {focusUnits?.length>0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {focusUnits.slice(0,3).map(u => (
            <span key={u.id} className="inline-flex items-center gap-2 px-2 py-1 rounded-full border">
              {u.subject} • {u.title}
              <button className="underline" onClick={()=>openTutor?.(u.id)}>Gia sư</button>
              <button className="underline" onClick={()=>openHandbook?.(u.id)}>Cẩm nang</button>
              <button className="underline" onClick={()=>openAssess?.(u.id)}>Luyện</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================== Demo =====================
export function DemoParentDashboard(){
  const students: Student[] = [
    { id: "st1", name: "Nguyễn Minh Khoa", grade: "9", className: "9A" },
    { id: "st2", name: "Trần Gia Linh", grade: "9", className: "9B" },
  ];

  const weekly: WeeklySummary = {
    weekOf: new Date(new Date().setDate(new Date().getDate()-((new Date().getDay()+6)%7))).toISOString().slice(0,10),
    studyMinutes: 210,
    sessionsPlanned: 8,
    sessionsCompleted: 6,
    adherencePct: 75,
    avgAssessScore: 8.2,
    hintsUsed: 9,
    strongestUnits: [ { id: 'u3', title: 'Hàm số y = ax^2', subject: 'Toán' } ],
    weakestUnits: [ { id: 'u1', title: 'Lập hệ phương trình', subject: 'Toán' }, { id:'u7', title:'Present Perfect', subject:'Tiếng Anh' } ],
  };

  const subjects: SubjectSummary[] = [
    { subject: 'Toán', masteryPct: 62, timeMinutes: 120, assessAvg: 8.0, hints: 5 },
    { subject: 'Tiếng Anh', masteryPct: 65, timeMinutes: 90, assessAvg: 8.5, hints: 4 },
  ];

  const alerts: AlertItem[] = [
    { id: 'a1', level: 'warn', text: 'Bỏ lỡ 2 phiên học trong kế hoạch tuần này.', subject:'Toán' },
    { id: 'a2', level: 'crit', text: 'Dùng gợi ý quá nhiều ở đơn vị “Lập hệ phương trình”. Khuyến nghị ôn lại với Gia sư.', unitId:'u1', subject:'Toán' },
  ];

  const activities: Activity[] = [
    { id: 'ac1', when: new Date().toISOString(), kind:'assess', subject:'Toán', text: 'Luyện đề 10–15\' (Hệ phương trình)', unitId:'u1', score: 8.0 },
    { id: 'ac3', when: new Date(Date.now()-26*3600e3).toISOString(), kind:'handbook', subject:'Tiếng Anh', text: 'Ôn Cẩm nang (Present Perfect)', unitId:'u7' },
  ];

  const [selected, setSelected] = useState(students[0].id);

  return (
    <ParentDashboard
      guardianName="Phụ huynh Khoa"
      students={students}
      selectedStudentId={selected}
      onSelectStudent={setSelected}
      weekly={weekly}
      subjects={subjects}
      alerts={alerts}
      activities={activities}
      focusUnits={weekly.weakestUnits}
      openStudyPlan={()=>alert('Mở Kế hoạch học tập')}
      openLearningProfile={()=>alert('Mở Hồ sơ học tập')}
      openTutor={(id)=>alert('Mở Gia sư: '+id)}
      openAssess={(id)=>alert("Luyện 10–15' theo: "+(id||'tổng hợp'))}
      openHandbook={(id)=>alert('Mở Cẩm nang: '+id)}
      onDownloadReport={(kind)=>alert('Tải báo cáo '+kind)}
      onContactTeacher={()=>alert('Gọi/Gặp giáo viên chủ nhiệm')}
      onContactVia={(m)=>alert('Liên hệ qua '+m)}
      onToggleNotifications={(enabled)=>console.log('Notif', enabled)}
    />
  );
}