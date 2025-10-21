import { SYLLABUS_TOPICS, computeTopicStats, loadAttempts, labelOf } from "../profile/logic";
import { buildExercisePack, ExercisePack, Level } from "./exerciseBank";

export type PlanTask = {
  id: string; week: number; subject: string; topic: string;
  type: "practice" | "theory" | "review";
  minutes: number; recommended?: boolean; done?: boolean;
  exercise?: ExercisePack;   // <— GÓI BÀI TẬP PHÙ HỢP
};
export type StudyPlan = {
  id: string; subject: string; weeks: number; daysPerWeek: number; minutesPerDay: number;
  level: Level; goal: string; createdAt: number; tasks: PlanTask[];
};
const KEY_CURRENT = "ai.studyplan.current.v1";
const PRACTICE_URL = (window as any).__PRACTICE_URL || "/practice";

export function getWeakTopicsForSubject(subject: string): string[] {
  const atts = loadAttempts().filter(a => a.subject === subject);
  const stats = computeTopicStats(atts);
  return Array.from(new Set(
    stats
      .filter(t => t.accuracy < 0.6 || (((t as any).trend ?? 0) < 0 && t.accuracy < 0.75))
      .sort((a,b)=>(a.accuracy-b.accuracy)||(b.attempts-a.attempts))
      .map(t => t.topic)
  ));
}
function pickTopicQueue(subject: string): string[] {
  const syl = SYLLABUS_TOPICS[subject] || [];
  const weak = getWeakTopicsForSubject(subject);
  const base = syl.filter(t => !weak.includes(t));
  const queue: string[] = [];
  const max = Math.max(syl.length, 1);
  for (let i=0;i<max;i++){ if (weak[i]) queue.push(weak[i]); if (i%2===0 && base[i]) queue.push(base[i]); }
  return queue.length ? queue.concat(base.filter(t=>!queue.includes(t))) : syl;
}

export function generatePlan(params: {
  subject: string; weeks: number; daysPerWeek: number; minutesPerDay: number; level: Level; goal: string;
}): StudyPlan {
  const { subject, weeks, daysPerWeek, minutesPerDay, level, goal } = params;
  const id = `plan-${subject}-${Date.now()}`;
  const queue = pickTopicQueue(subject);
  const tasks: PlanTask[] = [];
  let cursor = 0;
  const ratioPractice = level === "yeu" ? 0.7 : level === "trung-binh" ? 0.6 : level === "kha" ? 0.55 : 0.5;

  for (let w = 1; w <= weeks; w++) {
    for (let d = 1; d <= daysPerWeek; d++) {
      const isReviewDay = d === daysPerWeek;
      const minutes = minutesPerDay;
      let type: PlanTask["type"] = isReviewDay ? "review" : "practice";
      if (!isReviewDay && (d % 5 === 2)) type = "theory";
      const topic = queue[cursor % queue.length]; cursor++;

      const taskMinutes = Math.round(type === "practice" ? minutes * ratioPractice : minutes * (1 - ratioPractice));
      const exercise: ExercisePack = buildExercisePack(subject, level, topic, type);

      tasks.push({
        id: `${id}-w${w}-d${d}`, week: w, subject, topic, type,
        minutes: taskMinutes, recommended: getWeakTopicsForSubject(subject).includes(topic), done:false,
        exercise
      });
    }
  }
  return { id, subject, weeks, daysPerWeek, minutesPerDay, level, goal, createdAt: Date.now(), tasks };
}
export function saveCurrentPlan(plan: StudyPlan){ localStorage.setItem(KEY_CURRENT, JSON.stringify(plan)); }
export function loadCurrentPlan(): StudyPlan | null { const raw=localStorage.getItem(KEY_CURRENT); try { return raw?JSON.parse(raw) as StudyPlan:null; } catch { return null; } }
export function toggleTaskDone(plan: StudyPlan, taskId: string): StudyPlan { return { ...plan, tasks: plan.tasks.map(t=>t.id===taskId?{...t,done:!t.done}:t) }; }
export const slug = (s:string)=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
export function practiceLink(subject: string, topic: string){ return `${PRACTICE_URL}?subject=${slug(subject)}&topic=${slug(topic)}`; }
/** Tạo link bắt đầu “gói bài tập”: ưu tiên quiz nếu có startParams; fallback về /practice */
export function practiceLinkForPack(subject: string, topic: string, pack?: ExercisePack) {
  if (pack?.startParams) {
    const p = pack.startParams;
    return `${PRACTICE_URL}?subject=${slug(subject)}&topic=${slug(topic)}&mode=${p.mode}&num=${p.num}&diff=${p.diff}`;
  }
  return practiceLink(subject, topic);
}
export function exportPlanCSV(plan: StudyPlan, filename = `ke-hoach-${plan.subject}.csv`) {
  const headers = ["Tuần","Môn","Chủ đề","Loại","Phút","Ưu tiên","Gói bài tập"];
  const escape = (v:any)=>`"${String(v).replace(/"/g,'""')}"`;
  const lines = [
    headers.map(escape).join(","),
    ...plan.tasks.map(t=>[
      t.week, labelOf(t.subject), t.topic, t.type, t.minutes, t.recommended?"✓":"",
      t.exercise?.title || ""
    ].map(escape).join(","))
  ].join("\r\n");
  const blob=new Blob([lines],{type:"text/csv;charset=utf-8"}); const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}
