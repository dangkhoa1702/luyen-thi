/**
 * Hồ sơ học tập THEO MÔN:
 * - Hàng chip chọn môn ở đầu trang (nhớ lựa chọn vào localStorage).
 * - Toàn bộ thống kê/điểm mạnh/điểm yếu/kế hoạch/bảng chủ đề đều lọc theo môn đã chọn.
 * - Nếu môn chưa có dữ liệu: hiện gợi ý + nút thêm dữ liệu mẫu.
 */
import React from "react";
import ProgressBar from "../profile/ProgressBar";
import Sparkline from "../profile/Sparkline";
import {
  addTodaySamples, computeSubjectMastery, computeTopicStats, exportJSON,
  loadAttempts, seedDemoIfEmpty, setWeeklyGoalMin, summarizeProfile, labelOf
} from "../profile/logic";

interface LearningProfileProps {
  onStartPractice: (subject: string, topic: string) => void;
}

const KNOWN_SUBJECTS = [
  "toan","ngu-van","tieng-anh"
];

export const LearningProfile: React.FC<LearningProfileProps> = ({ onStartPractice }) => {
  const [, force] = React.useReducer(x=>x+1,0);

  // Seed demo data nếu chưa có để nhìn trang ngay
  React.useEffect(()=>{ seedDemoIfEmpty(); force(); }, []);

  const attsAll = loadAttempts();

  // Chỉ hiển thị 3 môn chính trong Hồ sơ học tập
  const subjectList = KNOWN_SUBJECTS;

  // Khởi tạo môn được chọn
  const saved = (localStorage.getItem("ai.profile.subject") || "");
  const defaultSubject = subjectList.includes(saved) ? saved : (subjectList[0] || KNOWN_SUBJECTS[0]);
  const [subject, setSubject] = React.useState<string>(defaultSubject);

  React.useEffect(()=>{ localStorage.setItem("ai.profile.subject", subject); force(); }, [subject]);

  // DỮ LIỆU THEO MÔN
  const atts = attsAll.filter(a => a.subject === subject);
  const summary = summarizeProfile(atts);
  const masteryOne = computeSubjectMastery(atts).find(m => m.subject === subject); // Lọc đúng môn
  const topics = computeTopicStats(atts);

  // Accuracy 7 ngày gần nhất (0..1) cho MÔN đang chọn
  const dailyAcc = (() => {
    const arr:number[]=[]; const now=Date.now();
    for(let d=6; d>=0; d--){
      const start=new Date(new Date(now-d*24*3600*1000).toDateString()).getTime();
      const end=start+24*3600*1000;
      const list=atts.filter(a=>a.timestamp>=start && a.timestamp<end);
      const acc = list.length > 0 ? list.filter(x => x.correct).length / list.length : 0;
      arr.push(acc);
    } return arr;
  })();

  // Giới hạn hiển thị + “Xem thêm/Thu gọn”
  const [showAllStrengths, setShowAllStrengths] = React.useState(false);
  const [showAllWeaknesses, setShowAllWeaknesses] = React.useState(false);
  const [showAllAlerts, setShowAllAlerts] = React.useState(false);
  const MAX_ITEMS = 3;
  const strengthsToRender = showAllStrengths ? summary.strengths : summary.strengths.slice(0, MAX_ITEMS);
  const weaknessesToRender = showAllWeaknesses ? summary.weaknesses : summary.weaknesses.slice(0, MAX_ITEMS);
  const alertsToRender     = showAllAlerts ? summary.alerts : summary.alerts.slice(0, 1);

  // Khi môn chưa có dữ liệu
  const emptyState = atts.length === 0;

  // THÊM STATE + HÀM HỖ TRỢ
  const [topicFilter, setTopicFilter] = React.useState<string>("__all__");

  // Danh sách chủ đề của môn đang chọn (để làm option)
  const topicOptions = Array.from(new Set(topics.map(t => t.topic))).sort();

  // Áp dụng lọc vào danh sách hiển thị ở bảng
  const filteredTopics = (topicFilter === "__all__"
    ? topics
    : topics.filter(t => t.topic === topicFilter)
  );
  
  const slug = (s:string)=>s
    .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

  // Xuất CSV (thống kê theo chủ đề của MÔN đang chọn)
  function exportCSV(rows = filteredTopics, filename = `learning-profile-${subject}.csv`) {
    if (!rows.length) return;
    const headers = ["Chủ đề","Chính xác (%)","Lần làm","TB 7 ngày (%)","Xu hướng (điểm)"];
    const escape = (v:any) => `"${String(v).replace(/"/g,'""')}"`;
    const lines = [
      headers.map(escape).join(","),
      ...rows.map(r => [
        r.topic,
        r.accuracy != null ? Math.round(r.accuracy*100) : "",
        r.attempts,
        r.last7Acc != null ? Math.round(r.last7Acc*100) : "",
        r.trend != null ? (r.trend>=0?"+":"")+r.trend : ""
      ].map(escape).join(","))
    ].join("\r\n");
    const blob = new Blob([lines], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // Helpers để hiển thị dữ liệu có thể null
  const pct = (v: number | null | undefined) => v == null ? "—" : `${Math.round(v * 100)}%`;
  const trend = (v: number | null | undefined) => {
    if (v == null) {
      return <span className="opacity-50">—</span>;
    }
    const color = v >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    const icon = v >= 0 ? "▲ +" : "▼ ";
    return <span className={`font-semibold ${color}`}>{icon}{Math.abs(v)} điểm</span>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HÀNG CHỌN MÔN */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {subjectList.map((s)=>(
          <button
            key={s}
            onClick={()=>setSubject(s)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
              subject===s ? "bg-blue-600 border-blue-600 text-white" : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            title={`Xem hồ sơ môn ${labelOf(s)}`}
          >
            {labelOf(s)}
          </button>
        ))}
      </div>

      {/* Banner động lực + hành động nhanh */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg">
        <p className="text-lg italic">“{summary.message}”</p>
        <div className="mt-1 text-sm opacity-90">
          Môn: <b>{labelOf(subject)}</b> • Chuỗi học: <b>{summarizeProfile(attsAll).streakDays} ngày</b> • Mục tiêu tuần: <b>{summarizeProfile(attsAll).weeklyGoalMin} phút</b>
          {summary._ignoredOutOfScope > 0 && <span className="ml-2 opacity-70">({summary._ignoredOutOfScope} câu ngoài phạm vi đã được lọc)</span>}
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button onClick={()=>{ setWeeklyGoalMin(summarizeProfile(attsAll).weeklyGoalMin+30); force(); }} className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold">Tăng mục tiêu 30’</button>
          <button onClick={()=>{ addTodaySamples(); force(); }} className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold">Thêm dữ liệu mẫu</button>
          <button onClick={()=>window.print()} className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold">In / PDF</button>
          <button onClick={()=>exportJSON()} className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold">Xuất JSON</button>
          <button onClick={()=>exportCSV()} className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold">Xuất CSV</button>
        </div>
      </div>

      {/* Nếu chưa có dữ liệu cho môn này */}
      {emptyState && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 text-center">
          <p className="text-lg font-semibold mb-1">Chưa có dữ liệu cho môn {labelOf(subject)}</p>
          <p className="text-sm opacity-80">Hãy làm một vài bài trong “Luyện đề” hoặc bấm “Thêm dữ liệu mẫu” để xem báo cáo thử.</p>
        </div>
      )}

      {/* Lưới: Điểm mạnh / Điểm yếu + Cảnh báo (theo môn) */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-3">Điểm mạnh – {labelOf(subject)}</h2>
          {strengthsToRender.length === 0 ? (
            <p className="text-sm opacity-70">Chưa có chủ đề nổi trội — tiếp tục luyện tập nhé.</p>
          ) : strengthsToRender.map((s,i)=>(
            <div key={i} className="border border-green-200 dark:border-green-800 rounded-xl p-3 mb-2 bg-green-50 dark:bg-green-900/20">
              <p className="font-medium">✓ {s.label.split(' – ')[1]}</p>
              <p className="text-sm opacity-80">{s.reason}</p>
            </div>
          ))}
          {summary.strengths.length > MAX_ITEMS && (
            <button onClick={()=>setShowAllStrengths(v=>!v)} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              {showAllStrengths ? "Thu gọn" : `Xem thêm (${summary.strengths.length - MAX_ITEMS})`}
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-3">Điểm yếu cần cải thiện – {labelOf(subject)}</h2>
          {weaknessesToRender.length === 0 ? (
            <p className="text-sm opacity-70">Không có điểm yếu nổi bật — hãy duy trì nhịp học hiện tại.</p>
          ) : weaknessesToRender.map((s,i)=>(
            <div key={i} className="border border-red-200 dark:border-red-800 rounded-xl p-3 mb-2 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">✗ {s.label.split(' – ')[1]}</p>
                  <p className="text-sm opacity-80">{s.reason}</p>
                </div>
                <button
                  onClick={() => onStartPractice(labelOf(s.subject), s.topic)}
                  className="shrink-0 px-3 py-1 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  title="Tạo 10 câu ôn nhanh theo chủ đề này"
                >
                  Ôn ngay
                </button>
              </div>
            </div>
          ))}
          {summary.weaknesses.length > MAX_ITEMS && (
            <button onClick={()=>setShowAllWeaknesses(v=>!v)} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              {showAllWeaknesses ? "Thu gọn" : `Xem thêm (${summary.weaknesses.length - MAX_ITEMS})`}
            </button>
          )}

          {summary.alerts.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <p className="font-medium text-yellow-800 dark:text-yellow-300">Cảnh báo sớm</p>
                {summary.alerts.length > 1 && (
                  <button onClick={()=>setShowAllAlerts(v=>!v)} className="text-sm text-yellow-800 dark:text-yellow-300 hover:underline">
                    {showAllAlerts ? "Thu gọn" : `Xem tất cả (${summary.alerts.length})`}
                  </button>
                )}
              </div>
              <ul className="list-disc pl-5 text-sm text-yellow-900 dark:text-yellow-400 mt-1">
                {alertsToRender.map((a,i)=>(<li key={i}>{a}</li>))}
              </ul>
            </div>
          )}

          {summary.watchlist?.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">Cần chú ý (điểm cao nhưng đang giảm)</p>
              <ul className="list-disc pl-5 text-sm text-blue-900 dark:text-blue-200">
                {summary.watchlist.map((t:string, i:number)=>(<li key={i}>{t}</li>))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mức làm chủ & Sparkline */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-3">Mức làm chủ – {labelOf(subject)}</h2>
            {masteryOne ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                <div className="flex items-center justify-between">
                <p className="font-medium">{labelOf(subject)}</p>
                <div className={`text-sm font-semibold ${masteryOne.trend>=0?"text-green-600 dark:text-green-400":"text-red-600 dark:text-red-400"}`}>
                    {masteryOne.trend>=0?"▲ +":"▼ "}{Math.abs(masteryOne.trend)} điểm (7 ngày)
                </div>
                </div>
                <ProgressBar value={masteryOne.accuracy} text={`${Math.round(masteryOne.accuracy*100)}% • ${masteryOne.attempts} câu`} />
            </div>
            ) : (
            <p className="text-sm opacity-70">Chưa có dữ liệu để tính mức làm chủ.</p>
            )}
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Xu hướng 7 ngày</h2>
            <p className="text-sm font-bold">{dailyAcc.length > 0 ? Math.round(dailyAcc[dailyAcc.length-1]*100) : 0}%</p>
            </div>
            <p className="text-sm opacity-70 mb-2">Độ chính xác trung bình mỗi ngày của môn học.</p>
            <div className="text-blue-600 dark:text-blue-400"><Sparkline points={dailyAcc} /></div>
        </div>
      </div>
      
      {/* Kế hoạch tuần 15’/ngày (theo môn) */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-3">Kế hoạch tuần đề xuất – {labelOf(subject)}</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {summary.plan.map((p,i)=>(
            <div key={i} className="border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 bg-indigo-50/50 dark:bg-indigo-900/20">
              <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Nhiệm vụ #{i+1} — {p.minutes}’</p>
              <p className="mt-1">{p.task}</p>
              <p className="mt-1 text-xs opacity-70">Lý do: {p.why}</p>
            </div>
          ))}
          {summary.plan.length === 0 && <p className="text-sm opacity-70 md:col-span-3">Chưa có kế hoạch đề xuất. Hãy luyện tập thêm để AI có dữ liệu phân tích.</p>}
        </div>
      </div>

      {/* Bảng chi tiết chủ đề (theo môn) */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-3">Chi tiết theo chủ đề – {labelOf(subject)}</h2>
        
        <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm opacity-70">
            {topicFilter === "__all__" ? "Hiển thị top 10 chủ đề gần đây." : <>Đang lọc theo chủ đề: <b>{topicFilter}</b></>}
            </p>
            <div className="flex items-center gap-2 self-end sm:self-center">
            <label htmlFor="topic-filter-select" className="text-sm opacity-70 shrink-0">Lọc chủ đề:</label>
            <select
                id="topic-filter-select"
                value={topicFilter}
                onChange={(e)=>setTopicFilter(e.target.value)}
                className="border rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="__all__">Tất cả chủ đề</option>
                {topicOptions.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-600 dark:text-gray-400">
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-3 font-medium">Chủ đề</th>
                <th className="py-2 px-3 font-medium text-center">Chính xác</th>
                <th className="py-2 px-3 font-medium text-center">Lần làm</th>
                <th className="py-2 px-3 font-medium text-center">TB 7 ngày</th>
                <th className="py-2 px-3 font-medium text-center">Xu hướng</th>
                <th className="py-2 pl-3 font-medium text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.slice(0,10).map((t,i)=>(
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <td className="py-2 pr-3 font-semibold">{t.topic}</td>
                  <td className="py-2 px-3 text-center">{pct(t.accuracy)}</td>
                  <td className="py-2 px-3 text-center">{t.attempts}</td>
                  <td className="py-2 px-3 text-center">{pct(t.last7Acc)}</td>
                  <td className="py-2 px-3 text-center">{trend(t.trend)}</td>
                  <td className="py-2 pl-3 text-center">
                    <button
                      onClick={() => onStartPractice(labelOf(subject), t.topic)}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                      title={`Tạo đề ôn tập cho chủ đề: ${t.topic}`}
                    >
                      Ôn ngay
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTopics.length===0 && (
                <tr><td colSpan={6} className="py-3 text-center text-sm opacity-70">{topicFilter === '__all__' ? 'Chưa có chủ đề nào cho môn này.' : 'Không tìm thấy chủ đề phù hợp.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}