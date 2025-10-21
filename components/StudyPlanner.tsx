import React from "react";
import { SYLLABUS_TOPICS, labelOf } from "../profile/logic";
import type { Level } from "../plan/exerciseBank";
import {
  StudyPlan, generatePlan, saveCurrentPlan, loadCurrentPlan,
  toggleTaskDone, exportPlanCSV, practiceLinkForPack
} from "../plan/planUtils";

function suggestGoal(subject: string, level: Level, weeks: number, minutesPerDay: number, daysPerWeek: number) {
  const subj = labelOf(subject);
  const target = level==="yeu"?"6+": level==="trung-binh"?"7.5+": level==="kha"?"8.5+":"9+";
  const focusMap: Record<string,string> = {
    "toan":"Hàm số, Hệ phương trình, Tam giác/Đường tròn",
    "ngu-van":"Đọc hiểu, Đoạn NLXH 200 chữ, Nghị luận tác phẩm",
    "tieng-anh":"Thì, Bị động, Tường thuật, Từ vựng",
    "vat-li":"Điện học, Quang học", "hoa-hoc":"PTHH, nồng độ, mol",
    "sinh-hoc":"Menđen, ADN/NST", "lich-su":"Mốc 1858–2000",
    "dia-li":"Atlat, biểu đồ", "tin-hoc":"Hệ điều hành, bảng tính", "tieng-phap":"Hiện tại, mạo từ"
  };
  const focus = focusMap[subject] || "các chủ đề trọng tâm";
  return `Đạt ${target} điểm môn ${subj} vào lớp 10; học ${weeks} tuần × ${daysPerWeek} buổi/tuần × ${minutesPerDay}’/buổi; ưu tiên 70% chủ đề yếu và luyện ${focus}.`;
}

export const StudyPlanner: React.FC = () => {
  const subjects = ["toan", "tieng-anh"];
  const [subject,setSubject]=React.useState<string>(subjects[0]||"toan");
  const [weeks,setWeeks]=React.useState<number>(12);
  const [daysPerWeek,setDaysPerWeek]=React.useState<number>(5);
  const [minutesPerDay,setMinutesPerDay]=React.useState<number>(30);
  const [level,setLevel]=React.useState<Level>("trung-binh");
  const [goal,setGoal]=React.useState<string>(suggestGoal(subject,level,weeks,minutesPerDay,daysPerWeek));
  
  React.useEffect(()=>{ 
    setGoal(suggestGoal(subject,level,weeks,minutesPerDay,daysPerWeek)); 
  },[subject,level,weeks,minutesPerDay,daysPerWeek]);

  const [plan,setPlan]=React.useState<StudyPlan|null>(null);
  React.useEffect(()=>{ const saved=loadCurrentPlan(); if(saved){ setPlan(saved); setSubject(saved.subject);} },[]);
  const makePlan=()=>{ const p=generatePlan({subject,weeks,daysPerWeek,minutesPerDay,level,goal}); setPlan(p); saveCurrentPlan(p); };

  const onToggle=(id:string)=>{ if(!plan) return; const u=toggleTaskDone(plan,id); setPlan(u); saveCurrentPlan(u); };
  const totalMinutes=(plan?.tasks||[]).reduce((s,t)=>s+t.minutes,0);
  const doneMinutes=(plan?.tasks||[]).filter(t=>t.done).reduce((s,t)=>s+t.minutes,0);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tạo Kế hoạch Học tập Cá nhân</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Môn học</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none">
              {subjects.map(s => <option key={s} value={s}>{labelOf(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trình độ hiện tại</label>
            <select value={level} onChange={e => setLevel(e.target.value as Level)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="yeu">Yếu</option>
              <option value="trung-binh">Trung bình</option>
              <option value="kha">Khá</option>
              <option value="gioi">Giỏi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thời gian học (tuần)</label>
            <input type="number" value={weeks} onChange={e => setWeeks(parseInt(e.target.value, 10))} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số buổi / tuần</label>
            <input type="number" value={daysPerWeek} onChange={e => setDaysPerWeek(parseInt(e.target.value, 10))} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số phút / buổi</label>
            <input type="number" value={minutesPerDay} onChange={e => setMinutesPerDay(parseInt(e.target.value, 10))} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mục tiêu (AI gợi ý)</label>
            <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={3} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-end items-center gap-4">
          {plan && (
            <div className="flex gap-4">
                <button onClick={() => exportPlanCSV(plan)} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Xuất CSV</button>
                <button onClick={() => window.print()} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">In/Lưu PDF</button>
            </div>
          )}
          <button onClick={makePlan} className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-blue-500">
            {plan ? 'Cập nhật Kế hoạch' : 'Tạo Kế hoạch'}
          </button>
        </div>
      </div>

      {plan ? (
        <div className="max-w-3xl mx-auto mt-4 space-y-4">
          {Array.from(new Set(plan.tasks.map(t=>t.week))).sort((a,b)=>Number(a)-Number(b)).map(week=>(
            <div key={week} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">Tuần {week} — {labelOf(plan.subject)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Phút/tuần: {plan.tasks.filter(t=>t.week===week).reduce((s,t)=>s+t.minutes,0)}
                </div>
              </div>

              <div className="mt-2 space-y-2">
                {plan.tasks.filter(t=>t.week===week).map(task=>(
                  <div key={task.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={!!task.done} onChange={()=>onToggle(task.id)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">
                            {task.type==="practice"?"Luyện tập":task.type==="theory"?"Lý thuyết":"Ôn tập"} — {task.topic}
                            {task.recommended && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">ưu tiên</span>}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{task.minutes}’ • Mục tiêu buổi</div>
                        </div>
                      </div>
                      <button
                        onClick={()=>{ window.location.href = practiceLinkForPack(plan.subject, task.topic, task.exercise); }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >Bắt đầu gói</button>
                    </div>

                    {task.exercise && (
                      <div className="mt-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-3">
                        <div className="text-sm font-medium text-indigo-800 dark:text-indigo-300">{task.exercise.title} • ~{task.exercise.minutes}’</div>
                        <ul className="list-disc pl-5 text-sm mt-1 text-gray-700 dark:text-gray-300 space-y-1">
                          {task.exercise.items.map((it,idx)=>(
                            <li key={idx}>
                              {it.mode==="quiz"?"Quiz":it.mode==="short"?"Tự luận ngắn":it.mode==="reading"?"Đọc hiểu":it.mode==="essay"?"Viết bài":"Thực hành"}
                              {it.count?` ${it.count} câu`: ""} {it.difficulty?` (${it.difficulty})`: ""} – {it.minutes}’
                              {it.note?` — ${it.note}`:""}
                            </li>
                          ))}
                        </ul>
                        <div className="text-xs text-indigo-700 dark:text-indigo-400 mt-2">Kiến thức: {task.exercise.knowledgePoints.join(" • ")}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Tuần {week}: Hoàn thành {plan.tasks.filter(t=>t.week===week && t.done).length}/{plan.tasks.filter(t=>t.week===week).length} buổi.
                Tổng tiến độ kế hoạch: {Math.round(doneMinutes/Math.max(1,totalMinutes)*100)}%
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4">
            <p className="text-gray-500 dark:text-gray-400">Chưa có kế hoạch học tập. Hãy điền thông tin bên trên và nhấn "Tạo kế hoạch" để bắt đầu!</p>
        </div>
      )}
    </div>
  );
}