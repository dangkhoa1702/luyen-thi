import React, { useMemo, useState } from "react";
import { Users, GraduationCap, CalendarDays, BarChart2, AlertTriangle, CheckCircle2, Clock, Target, Download, Settings, BookOpen, ListChecks, Sparkles, Filter, Search, ArrowUpRight, ArrowDownRight, Mail, Send, ClipboardList, Layers } from "lucide-react";

/**
 * TeacherDashboard.tsx — Giáo viên theo dõi (Teacher Portal)
 * Phục vụ giáo viên chủ nhiệm/bộ môn theo "yêu cầu mới" của MS05:
 * - Toàn bộ số liệu tập trung vào 2 môn: Toán / Tiếng Anh.
 * - Lọc theo lớp (9A, 9B, 9C, 9D, 9E, 9G, 9P) và theo môn.
 * - Tổng quan lớp (tuần): tổng phút học, tuân thủ kế hoạch, điểm luyện đề TB, cảnh báo rủi ro.
 * - Danh sách học sinh với chỉ số chính + deep links 3-trong-1 (Gia sư / Cẩm nang / Luyện 10–15').
 * - Cảnh báo nổi bật: bỏ lỡ phiên, dùng gợi ý quá nhiều, tiến bộ chậm theo đơn vị kiến thức.
 * - Hành động nhanh: gửi nhắc nhở, giao bài ôn tập (gợi ý đơn vị), xuất báo cáo.
 * - DEMO chạy offline; callbacks để nối backend (export, send message, assign task…).
 *
 * Cách dùng nhanh:
 *   import TeacherDashboard, { DemoTeacherDashboard } from "./TeacherDashboard";
 *   export default function Page(){ return <DemoTeacherDashboard/> }
 */

// =============== Local Types for 2 Subjects ===============
const SUBJECTS_LOCAL = ["Toán", "Tiếng Anh"] as const;
export type Subject = typeof SUBJECTS_LOCAL[number];

type SubjectSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  value: Subject;
  onChange: (v: Subject) => void;
  className?: string;
};

function SubjectSelect({ value, onChange, className = "px-3 py-2 border rounded-xl", ...rest }: SubjectSelectProps){
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


// =============== Types ===============
export const CLASS_OPTIONS = ["9A","9B","9C","9D","9E","9G","9P"] as const;
export type ClassCode = typeof CLASS_OPTIONS[number];

export type Student = {
  id: string;
  name: string;
  className: ClassCode;
};

export type UnitRef = { id: string; title: string; subject: Subject };

export type SubjectStat = {
  subject: Subject;           // 2 môn
  masteryPct: number;         // 0–100
  timeMinutes: number;        // phút học tuần này
  assessAvg: number;          // 0–10
  hints: number;              // số gợi ý đã dùng
};

export type StudentRow = {
  student: Student;
  adherencePct: number;       // tuân thủ kế hoạch tuần %
  studyMinutes: number;       // tổng phút học
  assessAvg: number;          // điểm TB luyện đề
  riskLevel: "ok"|"warn"|"crit";
  weakestUnits: UnitRef[];    // tối đa 2–3 đơn vị trọng tâm
  subjects: SubjectStat[];    // 2 môn
};

export type ClassWeekly = {
  weekOf: string;             // yyyy-mm-dd (thứ Hai)
  totalMinutes: number;
  adherenceAvg: number;       // trung bình %
  assessAvg: number;          // điểm TB
  risks: { warn: number; crit: number };
};

export type TeacherDashboardProps = {
  teacherName?: string;
  classes: ClassCode[];               // các lớp phụ trách
  students: Student[];                // học sinh thuộc các lớp
  rows: StudentRow[];                 // số liệu tuần theo học sinh
  weekly: ClassWeekly;                // tổng quan lớp (theo filter)
  focusSuggestions?: UnitRef[];       // gợi ý đơn vị để giao bài

  // Controls
  classFilter: ClassCode;
  subjectFilter: Subject;
  onChangeClass?: (c: ClassCode) => void;
  onChangeSubject?: (s: Subject) => void;

  // Actions / deep links
  openTutor?: (studentId: string, unitId: string) => void;
  openHandbook?: (unitId: string) => void;
  openAssess?: (studentId: string, unitId?: string) => void;

  exportReport?: (kind: "csv"|"pdf") => void | Promise<void>;
  sendReminder?: (studentIds: string[], message: string) => void | Promise<void>;
  assignPractice?: (studentIds: string[], unitId: string) => void | Promise<void>;
};

// =============== Main ===============
export default function TeacherDashboard(props: TeacherDashboardProps){
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]); // selected student ids
  const [reminderText, setReminderText] = useState("Nhắc nhở: hoàn thành phiên học theo kế hoạch hôm nay nhé!");
  const [assignUnitId, setAssignUnitId] = useState<string|"none">("none");

  const filteredRows = useMemo(()=>{
    return props.rows
      .filter(r => r.student.className === props.classFilter)
      .filter(r => q ? (r.student.name.toLowerCase().includes(q.toLowerCase())) : true)
      .map(r => ({
        ...r,
        subjectStat: r.subjects.find(s => s.subject === props.subjectFilter) as SubjectStat
      }));
  }, [props.rows, props.classFilter, props.subjectFilter, q]);

  const checkedAll = selected.length>0 && selected.length===filteredRows.length;
  function toggleAll(){ setSelected(checkedAll? [] : filteredRows.map(r=>r.student.id)); }
  function toggleOne(id: string){ setSelected(sel => sel.includes(id) ? sel.filter(x=>x!==id) : [...sel, id]); }

  return (
    <div className="mx-auto max-w-7xl p-5 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap className="w-5 h-5"/>
        <div className="text-lg font-semibold">Giáo viên theo dõi</div>
        <div className="ml-auto flex gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Xin chào{props.teacherName?` ${props.teacherName}`:''}</span>
          <button className="px-3 py-2 rounded-xl border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>props.exportReport?.("pdf")}> <Download className="w-4 h-4 inline mr-1"/> Xuất PDF</button>
          <button className="px-3 py-2 rounded-xl border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>props.exportReport?.("csv")}>Xuất CSV</button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border dark:border-gray-700 p-4 mb-4 bg-white dark:bg-gray-800">
        <div className="grid md:grid-cols-5 gap-2 items-end">
          <div>
            <label className="text-xs">Lớp</label>
            <select className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" value={props.classFilter} onChange={e=>props.onChangeClass?.(e.target.value as ClassCode)}>
              {props.classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs">Môn</label>
            <SubjectSelect value={props.subjectFilter} onChange={s=>props.onChangeSubject?.(s)} className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="text-xs">Tìm học sinh</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500"/>
              <input className="w-full pl-9 pr-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" placeholder="Tên học sinh…" value={q} onChange={e=>setQ(e.target.value)} />
            </div>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button className="px-3 py-2 rounded-xl border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>props.exportReport?.("pdf")}><Download className="w-4 h-4 inline mr-1"/>Báo cáo tuần</button>
            <button className="px-3 py-2 rounded-xl border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>props.exportReport?.("csv")}>Xuất danh sách</button>
          </div>
        </div>
      </div>

      {/* Class weekly */}
      <div className="grid md:grid-cols-4 gap-4 mb-5">
        <StatCard icon={<Clock className="w-4 h-4"/>} label="Tổng phút học" value={`${props.weekly.totalMinutes}'`} sub={`Tuần bắt đầu ${props.weekly.weekOf}`} />
        <StatCard icon={<CheckCircle2 className="w-4 h-4"/>} label="Tuân thủ TB" value={`${props.weekly.adherenceAvg}%`} />
        <StatCard icon={<Target className="w-4 h-4"/>} label="Điểm luyện đề TB" value={`${props.weekly.assessAvg}/10`} />
        <StatCard icon={<AlertTriangle className="w-4 h-4"/>} label="Cảnh báo" value={`${props.weekly.risks.warn} cảnh báo • ${props.weekly.risks.crit} nghiêm trọng`} />
      </div>

      {/* Bulk actions */}
      <div className="rounded-2xl border dark:border-gray-700 p-4 mb-4 bg-white/90 dark:bg-gray-800/90">
        <div className="font-semibold mb-2">Hành động nhanh</div>
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-xs">Gửi nhắc nhở cho học sinh đã chọn</label>
            <div className="flex gap-2">
              <input className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" value={reminderText} onChange={e=>setReminderText(e.target.value)} />
              <button className="px-3 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black" onClick={()=> props.sendReminder?.(selected, reminderText)}><Send className="w-4 h-4 inline mr-1"/>Gửi</button>
            </div>
          </div>
          <div>
            <label className="text-xs">Giao bài ôn tập</label>
            <div className="flex gap-2">
              <select className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700" value={assignUnitId} onChange={e=>setAssignUnitId(e.target.value as any)}>
                <option value="none">Chọn đơn vị</option>
                {(props.focusSuggestions||[]).map(u => <option key={u.id} value={u.id}>{u.subject} • {u.title}</option>)}
              </select>
              <button className="px-3 py-2 rounded-xl border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>{ if(assignUnitId!=="none") props.assignPractice?.(selected, assignUnitId as string); }}>Giao</button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border dark:border-gray-700 overflow-x-auto bg-white dark:bg-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="p-3 w-10"><input type="checkbox" checked={checkedAll} onChange={toggleAll} /></th>
              <th className="p-3 text-left">Học sinh</th>
              <th className="p-3 text-left">Tuân thủ</th>
              <th className="p-3 text-left">Phút học</th>
              <th className="p-3 text-left">Điểm TB</th>
              <th className="p-3 text-left">Mức độ làm chủ ({props.subjectFilter})</th>
              <th className="p-3 text-left">Đơn vị yếu</th>
              <th className="p-3 text-left">Liên kết</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(r => (
              <tr key={r.student.id} className="border-t dark:border-gray-700">
                <td className="p-3"><input type="checkbox" checked={selected.includes(r.student.id)} onChange={()=>toggleOne(r.student.id)} /></td>
                <td className="p-3">{r.student.name} <span className="text-xs text-gray-600 dark:text-gray-400">({r.student.className})</span></td>
                <td className="p-3">{r.adherencePct}% {r.adherencePct>=80? <ArrowUpRight className="inline w-4 h-4 text-green-600"/> : <ArrowDownRight className="inline w-4 h-4 text-red-600"/>}</td>
                <td className="p-3">{r.studyMinutes}'</td>
                <td className="p-3">{r.assessAvg}/10</td>
                <td className="p-3">
                  <div className="w-40 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-2 bg-black dark:bg-white" style={{ width: `${Math.min(100, Math.max(0, r.subjectStat?.masteryPct||0))}%` }} />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{r.subjectStat?.masteryPct||0}% • {r.subjectStat?.timeMinutes||0}' • {r.subjectStat?.assessAvg||0}/10</div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {r.weakestUnits.slice(0,2).map(u => (
                      <span key={u.id} className="px-2 py-0.5 rounded-full border dark:border-gray-600 text-xs">{u.subject} • {u.title}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {r.weakestUnits[0] && <button className="px-2.5 py-1 rounded-xl bg-black text-white dark:bg-white dark:text-black" onClick={()=>props.openTutor?.(r.student.id, r.weakestUnits[0].id)}>Gia sư</button>}
                    {r.weakestUnits[0] && <button className="px-2.5 py-1 rounded-xl border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>props.openHandbook?.(r.weakestUnits[0].id)}>Cẩm nang</button>}
                    {r.weakestUnits[0] && <button className="px-2.5 py-1 rounded-xl border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>props.openAssess?.(r.student.id, r.weakestUnits[0].id)}>Luyện 10–15'</button>}
                  </div>
                </td>
              </tr>
            ))}
            {filteredRows.length===0 && (
              <tr><td colSpan={8} className="p-6 text-center text-gray-600 dark:text-gray-400">Không có học sinh phù hợp bộ lọc hiện tại.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Alerts section */}
      <div className="grid md:grid-cols-3 gap-4 mt-5">
        <div className="md:col-span-2 rounded-2xl border dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="font-semibold mb-2">Cảnh báo nổi bật</div>
          <div className="space-y-2">
            {filteredRows
              .flatMap(r => riskyRows(r))
              .slice(0,6)
              .map((a,i) => (
                <div key={i} className={`rounded-xl border p-3 ${a.level==='crit'? 'border-red-600 text-red-700 dark:text-red-400 dark:border-red-500' : 'border-amber-600 text-amber-700 dark:text-amber-400 dark:border-amber-500'}`}>
                  <div className="text-sm">{a.text}</div>
                  {a.unit && (
                    <div className="mt-2 flex gap-2 text-xs">
                      <button className="px-2.5 py-1 rounded-xl bg-black text-white dark:bg-white dark:text-black" onClick={()=>props.openTutor?.(a.studentId, a.unit!.id)}>Gia sư</button>
                      <button className="px-2.5 py-1 rounded-xl border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>props.openHandbook?.(a.unit!.id)}>Cẩm nang</button>
                      <button className="px-2.5 py-1 rounded-xl border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>props.openAssess?.(a.studentId, a.unit!.id)}>Luyện 10–15'</button>
                    </div>
                  )}
                </div>
              ))}
            {filteredRows.length>0 && filteredRows.every(r => riskyRows(r).length===0) && (
              <div className="text-sm text-gray-600 dark:text-gray-400">Không có cảnh báo đáng chú ý.</div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="font-semibold mb-2">Gợi ý giao bài</div>
          {(props.focusSuggestions||[]).length===0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">Chưa có gợi ý từ hệ thống.</div>
          ) : (
            <div className="space-y-2">
              {(props.focusSuggestions||[]).slice(0,6).map(u => (
                <div key={u.id} className="rounded-xl border dark:border-gray-700 p-3">
                  <div className="text-sm">{u.subject} • {u.title}</div>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">Khuyến nghị giao cho nhóm học sinh cần củng cố đơn vị này.</div>
                  <button className="mt-2 px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black" onClick={()=>props.assignPractice?.(selected, u.id)}>
                    Giao cho học sinh đã chọn
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============== Helpers ===============
const StatCard: React.FC<{ icon:React.ReactNode; label:string; value:string; sub?:string }> = ({ icon, label, value, sub }) => (
    <div className="rounded-2xl border dark:border-gray-700 p-4 bg-white/90 dark:bg-gray-800/90">
      <div className="uppercase text-xs text-gray-600 dark:text-gray-400 mb-1 inline-flex items-center gap-2">{icon}{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</div>}
    </div>
);

function riskyRows(r: StudentRow): { level: 'warn'|'crit'; text: string; unit?: UnitRef; studentId: string }[]{
  const list: { level:'warn'|'crit'; text:string; unit?: UnitRef; studentId:string }[] = [];
  if(r.adherencePct < 60){ list.push({ level:'crit', text:`${r.student.name} tuân thủ kế hoạch thấp (${r.adherencePct}%).`, studentId: r.student.id }); }
  if(r.subjects.some(s => s.hints>=6)){
    const s = r.subjects.find(s=>s.hints>=6)!; list.push({ level:'warn', text:`${r.student.name} dùng gợi ý nhiều ở ${s.subject} (${s.hints} lần).`, studentId: r.student.id });
  }
  if(r.weakestUnits.length){ list.push({ level:'warn', text:`${r.student.name} cần ôn "${r.weakestUnits[0].title}" (${r.weakestUnits[0].subject}).`, unit: r.weakestUnits[0], studentId: r.student.id }); }
  return list;
}

// =============== Demo ===============
export function DemoTeacherDashboard(){
  const classes: ClassCode[] = ["9A","9B","9C","9D","9E","9G","9P"];
  const [classFilter, setClassFilter] = useState<ClassCode>("9A");
  const [subjectFilter, setSubjectFilter] = useState<Subject>("Toán");

  const students: Student[] = [
    { id: 'st1', name: 'Nguyễn Minh Khoa', className: '9A' },
    { id: 'st2', name: 'Trần Gia Linh', className: '9A' },
    { id: 'st3', name: 'Phạm Bảo Nam', className: '9A' },
    { id: 'st4', name: 'Lưu Thảo Vy', className: '9B' },
  ];

  const rows: StudentRow[] = [
    {
      student: students[0], adherencePct: 72, studyMinutes: 210, assessAvg: 8.1, riskLevel:'warn',
      weakestUnits: [ { id:'u1', title:'Lập hệ phương trình', subject:'Toán' } ],
      subjects: [
        { subject:'Toán', masteryPct:62, timeMinutes:120, assessAvg:8.0, hints:5 },
        { subject:'Tiếng Anh', masteryPct:65, timeMinutes:90, assessAvg:8.5, hints:2 },
      ]
    },
    {
      student: students[1], adherencePct: 55, studyMinutes: 140, assessAvg: 7.2, riskLevel:'crit',
      weakestUnits: [ { id:'u2', title:'Hệ thức Vi-ét', subject:'Toán' } ],
      subjects: [
        { subject:'Toán', masteryPct:45, timeMinutes:80, assessAvg:6.8, hints:7 },
        { subject:'Tiếng Anh', masteryPct:70, timeMinutes:60, assessAvg:8.2, hints:1 },
      ]
    },
    {
      student: students[2], adherencePct: 88, studyMinutes: 260, assessAvg: 8.6, riskLevel:'ok',
      weakestUnits: [ { id:'u3', title:'Góc nội tiếp', subject:'Toán' } ],
      subjects: [
        { subject:'Toán', masteryPct:72, timeMinutes:150, assessAvg:8.7, hints:2 },
        { subject:'Tiếng Anh', masteryPct:68, timeMinutes:110, assessAvg:8.0, hints:1 },
      ]
    },
    {
      student: students[3], adherencePct: 67, studyMinutes: 180, assessAvg: 7.9, riskLevel:'warn',
      weakestUnits: [ { id:'u7', title:'Present Perfect', subject:'Tiếng Anh' } ],
      subjects: [
        { subject:'Toán', masteryPct:58, timeMinutes:70, assessAvg:7.2, hints:3 },
        { subject:'Tiếng Anh', masteryPct:50, timeMinutes:110, assessAvg:7.5, hints:5 },
      ]
    },
  ];

  const weekly: ClassWeekly = {
    weekOf: new Date(new Date().setDate(new Date().getDate()-((new Date().getDay()+6)%7))).toISOString().slice(0,10),
    totalMinutes: rows.filter(r=>r.student.className===classFilter).reduce((a,b)=>a+b.studyMinutes,0),
    adherenceAvg: Math.round(rows.filter(r=>r.student.className===classFilter).reduce((a,b)=>a+b.adherencePct,0)/Math.max(1,rows.filter(r=>r.student.className===classFilter).length)),
    assessAvg: Number((rows.filter(r=>r.student.className===classFilter).reduce((a,b)=>a+b.assessAvg,0)/Math.max(1,rows.filter(r=>r.student.className===classFilter).length)).toFixed(1)),
    risks: {
      warn: rows.filter(r=>r.student.className===classFilter && r.riskLevel==='warn').length,
      crit: rows.filter(r=>r.student.className===classFilter && r.riskLevel==='crit').length,
    }
  };

  const focusSuggestions: UnitRef[] = [
    { id:'u1', title:'Lập hệ phương trình', subject:'Toán' },
    { id:'u2', title:'Hệ thức Vi-ét', subject:'Toán' },
    { id:'u7', title:'Present Perfect', subject:'Tiếng Anh' },
  ];

  return (
    <TeacherDashboard
      teacherName="Cô Huyền"
      classes={classes}
      students={students}
      rows={rows}
      weekly={weekly}
      focusSuggestions={focusSuggestions}
      classFilter={classFilter}
      subjectFilter={subjectFilter}
      onChangeClass={setClassFilter}
      onChangeSubject={setSubjectFilter}
      openTutor={(studentId, unitId)=>alert(`Mở Gia sư cho ${studentId} • ${unitId}`)}
      openHandbook={(unitId)=>alert(`Mở Cẩm nang: ${unitId}`)}
      openAssess={(studentId, unitId)=>alert(`Luyện 10–15' cho ${studentId} • ${unitId||'(tổng hợp)'}`)}
      exportReport={(kind)=>alert(`Xuất báo cáo ${kind}`)}
      sendReminder={(ids, msg)=>alert(`Gửi nhắc nhở cho ${ids.length} HS: ${msg}`)}
      assignPractice={(ids, unit)=>alert(`Giao bài ${unit} cho ${ids.length} HS`)}
    />
  );
}