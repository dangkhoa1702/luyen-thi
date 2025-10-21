/**
 * Trang "Phụ huynh theo dõi" – Đăng ký bằng Gmail & Gmail của con, xem Báo cáo tuần,
 * gửi email 1-click, in/PDF, huỷ theo dõi. Nổi trội: cảnh báo thông minh & gợi ý hành động.
 */
import React from "react";
import {
  Subscription,
  subscribeParent, listSubscriptions, removeSubscription,
  buildWeeklyDigest, buildMailtoFromDigest, buildShareLink, WeeklyDigest
} from "../parent/parentPortal";

export const ParentDashboard: React.FC = () => {
  const [parentEmail, setParentEmail] = React.useState("");
  const [childEmail, setChildEmail] = React.useState("");
  const [subs, setSubs] = React.useState(listSubscriptions());
  const [activeIdx, setActiveIdx] = React.useState(0);

  const refresh = () => { setSubs(listSubscriptions()); };

  const onSubscribe = () => {
    try {
      const sub = subscribeParent(parentEmail.trim(), childEmail.trim());
      setParentEmail(""); setChildEmail("");
      const updatedSubs = listSubscriptions();
      setSubs(updatedSubs);
      const newIdx = updatedSubs.findIndex(s => s.id === sub.id);
      setActiveIdx(newIdx >= 0 ? newIdx : 0);
      alert("Đăng ký thành công! Đã tạo liên kết theo dõi an toàn.");
    } catch (e:any) {
      alert(e?.message || "Không thể đăng ký. Vui lòng kiểm tra lại.");
    }
  };

  const current = subs[activeIdx];
  const digest = current ? buildWeeklyDigest(current.childEmail) : null;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Bảng theo dõi của Phụ huynh / Giáo viên</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Nhập Gmail để nhận báo cáo tuần và theo dõi tiến bộ. Dữ liệu được lưu an toàn trên thiết bị của bạn.</p>

          {/* FORM ĐĂNG KÝ */}
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <input className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Gmail phụ huynh"
              value={parentEmail} onChange={e=>setParentEmail(e.target.value)} />
            <input className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Gmail của con"
              value={childEmail} onChange={e=>setChildEmail(e.target.value)} />
            <button onClick={onSubscribe} className="px-4 py-2 rounded-lg bg-black dark:bg-blue-600 text-white font-semibold hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors">Đăng ký theo dõi</button>
          </div>

          {/* DANH SÁCH ĐÃ ĐĂNG KÝ */}
          {subs.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chọn học sinh để xem báo cáo:</div>
              <div className="flex flex-wrap gap-2">
                {subs.map((s, idx) => (
                  <div key={s.id} className={`p-3 rounded-xl border transition-all cursor-pointer ${idx === activeIdx ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700" : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`} onClick={() => setActiveIdx(idx)}>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{s.childEmail}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">PH: {s.parentEmail}</div>
                    <div className="mt-2 flex gap-3">
                      <a href={buildShareLink(s.token)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Link chia sẻ</a>
                      <button className="text-xs text-red-600 dark:text-red-400 hover:underline" onClick={(e) => { e.stopPropagation(); removeSubscription(s.id); refresh(); setActiveIdx(0); }}>Huỷ</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BÁO CÁO TUẦN */}
        {digest ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Báo cáo tuần – {digest.childEmail}</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">{digest.rangeLabel}</div>
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                <a href={buildMailtoFromDigest(current.parentEmail, digest)} className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-black transition-colors">Gửi email</a>
                <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">In / PDF</button>
              </div>
            </div>

            {/* TỔNG QUAN */}
            <div className="mt-4 grid md:grid-cols-4 gap-4">
              <StatCard title="Thời lượng tuần này" value={`${digest.minutesThisWeek}’`} subtitle={`Mục tiêu: ${digest.minutesTarget}’`} />
              <StatCard title="Chính xác 7 ngày" value={`${digest.accuracy7d}%`} subtitle={
                <span className={digest.accuracyChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                  {digest.accuracyChange >= 0 ? "▲" : "▼"} {Math.abs(digest.accuracyChange)} điểm so với tuần trước
                </span>
              } />
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 md:col-span-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Mức làm chủ theo môn</div>
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  {digest.mastery.map(m => (
                    <div key={m.subject} className="text-sm"><span className="opacity-80">{m.subject}:</span> <b className="font-semibold">{m.accuracy}%</b></div>
                  ))}
                </div>
              </div>
            </div>

            {/* CẢNH BÁO */}
            {digest.alerts.length > 0 && (
              <div className="mt-4 rounded-xl border border-yellow-300 dark:border-yellow-700 p-4 bg-yellow-50 dark:bg-yellow-900/20">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Cảnh báo và Gợi ý</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {digest.alerts.map((a, i) => (
                    <li key={i} className={a.level === "red" ? "text-red-600 dark:text-red-400 font-medium" : "text-yellow-700 dark:text-yellow-400"}>{a.text}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ĐIỂM MẠNH / CẦN CẢI THIỆN */}
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <TopicListCard title="Điểm mạnh" topics={digest.strengths} color="green" />
              <TopicListCard title="Cần cải thiện" topics={digest.weaknesses} color="red" />
            </div>

            {/* GỢI Ý PHỤ HUYNH NÊN LÀM GÌ */}
            <div className="mt-4 rounded-xl border border-emerald-300 dark:border-emerald-700 p-4 bg-emerald-50 dark:bg-emerald-900/20">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Hành động đề xuất cho phụ huynh</h3>
              <ul className="list-disc pl-5 text-sm space-y-1 text-emerald-900 dark:text-emerald-200">
                {digest.actions.map((a, i) => (<li key={i}>{a}</li>))}
              </ul>
            </div>
          </div>
        ) : (
             <div className="text-center py-10 px-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <p className="text-gray-500 dark:text-gray-400">Chưa có đăng ký theo dõi nào. Hãy điền thông tin bên trên để bắt đầu.</p>
            </div>
        )}
      </div>
    </div>
  );
}

// Helper components for styling
const StatCard: React.FC<{ title: string; value: string; subtitle: React.ReactNode }> = ({ title, value, subtitle }) => (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-700/30">
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
        <div className="text-xs mt-1">{subtitle}</div>
    </div>
);

const TopicListCard: React.FC<{title: string; topics: WeeklyDigest['strengths']; color: 'green' | 'red'}> = ({ title, topics, color }) => {
    const baseColor = color === 'green' ? 'emerald' : 'red';
    return (
        <div className={`rounded-xl border border-${baseColor}-200 dark:border-${baseColor}-700 p-4 bg-${baseColor}-50 dark:bg-${baseColor}-900/20`}>
            <h3 className={`font-semibold text-${baseColor}-800 dark:text-${baseColor}-300 mb-2`}>{title}</h3>
            <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-300">
                {topics.length ? topics.map((t, i) => (
                    <li key={i}>
                        <div className="font-medium">{t.subject} – {t.topic}</div>
                        <div className="text-xs opacity-80">{t.accuracy}% chính xác ({t.attempts} câu)</div>
                    </li>
                )) : <li className="text-xs opacity-70">Không có dữ liệu nổi bật.</li>}
            </ul>
        </div>
    );
};
