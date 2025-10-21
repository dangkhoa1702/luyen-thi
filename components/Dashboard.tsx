import React, { useMemo } from "react";
import { Play, Target, Clock, BookOpen, GraduationCap, LineChart, Brain, CalendarClock, Bolt, FileText, CheckCircle2, AlarmClock, RefreshCcw, TrendingUp, Sparkles } from "lucide-react";

/**
 * Dashboard.tsx — Bảng điều khiển theo mô hình Planner – Tutor – Assessor
 * Styling: TailwindCSS (no external CSS needed)
 * Icons: lucide-react (already available)
 *
 * CÁCH DÙNG NHANH:
 * <Dashboard onStartPlanner={...} onStartTutor={...} onStartAssess={...} />
 * 
 * Bạn có thể thay thế "mock" data ở dưới bằng dữ liệu thật từ API của bạn.
 */

// ============= Types =============
export type KnowledgeUnit = {
  id: string;
  title: string; // ví dụ: "Lập hệ phương trình"
  topic: string; // ví dụ: "Đại số: Hệ phương trình"
  mastery: number; // 0..100
};

export type WeeklyGoal = {
  minutesTarget: number; // mục tiêu phút/tuần
  minutesDone: number;   // đã học được bao nhiêu phút
  bySubject: { subject: string; done: number }[]; // chip theo môn
};

export type Suggestion = {
  unitId: string;
  unitTitle: string;
  reason: string; // vì sao đề xuất (yếu/ít luyện/chuẩn bị kiểm tra...)
  time: 15 | 30 | 45 | 60;
};

export type QuickExam = {
  id: string;
  label: string; // ví dụ: "Đề 2024 - THPT Chuyên"
  type: "preset" | "ai"; // có sẵn hoặc thông minh
};

export type Snapshot = {
  weakUnits: string[]; // top 2-3 đơn vị yếu
  heatmapAlt: string;  // alt text cho heatmap mini
};

export type TrendPoint = { label: string; value: number };

export type RecentLog = {
  id: string;
  time: string; // ISO hoặc text
  action: string; // mô tả ngắn: "Tutor: dùng 2 gợi ý", "Assessor: 8/10"
};

export type Role = "student" | "teacher" | "parent";

// ============= Props =============
export type DashboardProps = {
  role?: Role;
  userName?: string;

  continueUnit?: KnowledgeUnit; // đơn vị đang học dở
  weeklyGoal: WeeklyGoal;
  smartSuggestions: Suggestion[]; // đề xuất học hôm nay

  quickPresetExams: QuickExam[]; // đề có sẵn
  quickAIExams: QuickExam[];     // đề thông minh

  snapshot: Snapshot;            // hồ sơ tóm tắt

  trends: {
    studyMinutes: TrendPoint[];
    hintsUsed: TrendPoint[];
    assessScores: TrendPoint[];
    streakDays: number;          // chuỗi ngày học liên tiếp
  };

  knowledgePicks: KnowledgeUnit[]; // cẩm nang gợi ý
  recent: RecentLog[];             // hoạt động gần đây

  nextReminder?: { time: string; enabled: boolean };

  // Callbacks
  onStartPlanner?: () => void;
  onStartTutor?: (unitId?: string) => void;
  onStartAssess?: (mode: "preset" | "ai", examId?: string) => void;
  onChangeWeeklyGoal?: () => void;
  onOpenProfile?: () => void; // hồ sơ học tập chi tiết
};

// ============= UI Helpers =============
const Card: React.FC<React.PropsWithChildren<{ className?: string; title?: React.ReactNode; right?: React.ReactNode }>> = ({ className = "", title, right, children }) => (
  <div className={`rounded-2xl border dark:border-gray-700 shadow-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur p-5 ${className}`}>
    {(title || right) && (
      <div className="flex items-center justify-between mb-4">
        {title ? <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3> : <div />}
        {right}
      </div>
    )}
    {children}
  </div>
);

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
    <div className="h-full bg-black dark:bg-white" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
  </div>
);

const Chip: React.FC<React.PropsWithChildren<{ active?: boolean }>> = ({ active, children }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs border ${active ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 dark:border-gray-600"}`}>{children}</span>
);

// ============= Main Component =============
export default function Dashboard({
  role = "student",
  userName = "Học sinh",
  continueUnit,
  weeklyGoal,
  smartSuggestions,
  quickPresetExams,
  quickAIExams,
  snapshot,
  trends,
  knowledgePicks,
  recent,
  nextReminder,
  onStartPlanner,
  onStartTutor,
  onStartAssess,
  onChangeWeeklyGoal,
  onOpenProfile,
}: DashboardProps) {
  const pctWeek = useMemo(() => Math.round((weeklyGoal.minutesDone / Math.max(1, weeklyGoal.minutesTarget)) * 100), [weeklyGoal]);

  return (
    <div className="mx-auto max-w-7xl text-gray-900 dark:text-gray-100">
      {/* A. Hero */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <div className="text-lg font-semibold">Chào mừng trở lại, {userName}!</div>
        </div>
        <button className="sm:ml-auto w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black text-white dark:bg-white dark:text-black px-4 py-2 font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors" onClick={onStartPlanner}>
          <Play className="w-4 h-4" /> Bắt đầu 30' với Gia sư AI
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* B. Học tiếp 1-click */}
        <Card className="col-span-12 lg:col-span-6" title={<span className="inline-flex items-center gap-2"><Target className="w-4 h-4 text-blue-500"/>Học tiếp 1-click</span>} right={continueUnit && <Chip>{continueUnit.title}</Chip>}>
          {continueUnit ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-gray-700 dark:text-gray-300">{continueUnit.topic}</div>
              <ProgressBar value={continueUnit.mastery} />
              <div className="flex gap-2">
                <button className="rounded-xl bg-black text-white dark:bg-white dark:text-black px-4 py-2 font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors" onClick={() => onStartTutor?.(continueUnit.id)}>
                  <Play className="w-4 h-4 inline-block mr-1"/> Tiếp tục học
                </button>
                <button className="rounded-xl border dark:border-gray-300 dark:border-gray-600 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={onStartPlanner}>Đổi mục tiêu</button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">Chưa có phiên học gần đây. Hãy bắt đầu bằng việc đặt mục tiêu và chọn đơn vị kiến thức yếu nhất.</div>
          )}
        </Card>

        {/* C. Mục tiêu tuần */}
        <Card className="col-span-12 lg:col-span-6" title={<span className="inline-flex items-center gap-2"><Clock className="w-4 h-4 text-green-500"/>Mục tiêu tuần</span>} right={<Chip active>{weeklyGoal.minutesDone}/{weeklyGoal.minutesTarget} phút ({pctWeek}%)</Chip>}>
          <ProgressBar value={pctWeek} />
          <div className="mt-3 flex flex-wrap gap-2">
            {weeklyGoal.bySubject.map((s) => (
              <Chip key={s.subject}>{s.subject}: {s.done}'</Chip>
            ))}
          </div>
          <div className="mt-3">
            <button className="rounded-xl border dark:border-gray-300 dark:border-gray-600 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={onChangeWeeklyGoal}>Chỉnh mục tiêu tuần</button>
          </div>
        </Card>

        {/* D. Gợi ý thông minh hôm nay */}
        <Card className="col-span-12 xl:col-span-6" title={<span className="inline-flex items-center gap-2"><Brain className="w-4 h-4 text-purple-500"/>Gợi ý thông minh hôm nay</span>}>
          {smartSuggestions.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">Chưa có gợi ý — hãy chạy chẩn đoán từ Planner.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {smartSuggestions.map((s) => (
                <div key={s.unitId} className="rounded-xl border dark:border-gray-700 p-3 flex flex-col">
                  <div className="font-medium">{s.unitTitle}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{s.reason}</div>
                  <div className="flex gap-2 mt-auto">
                    <button className="flex-1 rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors" onClick={() => onStartTutor?.(s.unitId)}>
                      Học
                    </button>
                    <button className="flex-1 rounded-lg border dark:border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => onStartAssess?.("ai")}>Luyện {s.time}'</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* E. Luyện đề nhanh */}
        <Card className="col-span-12 xl:col-span-6" title={<span className="inline-flex items-center gap-2"><Bolt className="w-4 h-4 text-yellow-500"/>Luyện đề nhanh</span>}>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="font-semibold mb-2 text-sm">Đề có sẵn</div>
              <div className="flex flex-col gap-2">
                {quickPresetExams.slice(0,3).map((e)=> (
                  <button key={e.id} className="text-sm rounded-xl border dark:border-gray-300 dark:border-gray-600 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2" onClick={()=>onStartAssess?.("preset", e.id)}>
                    <FileText className="w-4 h-4 text-gray-500"/>{e.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2 text-sm">Đề thông minh (AI)</div>
              <div className="flex flex-col gap-2">
                {quickAIExams.slice(0,3).map((e)=> (
                  <button key={e.id} className="text-sm rounded-xl border dark:border-gray-300 dark:border-gray-600 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2" onClick={()=>onStartAssess?.("ai", e.id)}>
                    <Sparkles className="w-4 h-4 text-blue-500"/>{e.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* F. Hồ sơ tóm tắt */}
        <Card className="col-span-12 lg:col-span-6" title={<span className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/>Hồ sơ học tập (tóm tắt)</span>} right={<button className="text-sm underline hover:no-underline" onClick={onOpenProfile}>Xem chi tiết</button>}>
          <div className="text-sm mb-2 text-gray-600 dark:text-gray-300">Top cạm bẫy hay mắc: <span className="font-semibold text-gray-800 dark:text-gray-100">{snapshot.weakUnits.join(", ") || "—"}</span></div>
          <div className="rounded-xl bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 p-6 text-center text-xs text-gray-500 dark:text-gray-400 h-24 flex items-center justify-center">(Heatmap mastery mini – {snapshot.heatmapAlt})</div>
        </Card>

        {/* G. Xu hướng học tập */}
        <Card className="col-span-12 lg:col-span-6" title={<span className="inline-flex items-center gap-2"><LineChart className="w-4 h-4 text-red-500"/>Xu hướng học tập</span>}>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <MetricList title="Phút học/tuần" points={trends.studyMinutes} suffix="'" />
            <MetricList title="Số gợi ý đã dùng" points={trends.hintsUsed} />
            <MetricList title="Điểm luyện đề" points={trends.assessScores} />
          </div>
          <div className="mt-3 text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500"/> Chuỗi ngày học: <b>{trends.streakDays}</b> ngày</div>
        </Card>
      </div>
    </div>
  );
}

// ============= Small Components =============
function MetricList({ title, points, suffix = "" }: { title: string; points: TrendPoint[]; suffix?: string }) {
  return (
    <div className="rounded-xl border dark:border-gray-700 p-3">
      <div className="font-semibold text-xs mb-2">{title}</div>
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-700 dark:text-gray-300">
        {points.slice(-6).map((p) => (
          <div key={p.label} className="flex flex-col items-start">
            <span className="text-gray-500 dark:text-gray-400">{p.label}</span>
            <span className="font-medium">{p.value}{suffix}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
