/**
 * Trang Kho tài liệu – bản FIX PDF AI:
 * - Bọc try/catch khi tạo PDF AI, cảnh báo rõ nguyên nhân nếu thiếu font/jsPDF.
 * - Không chặn thao tác khác khi lỗi cục bộ.
 */
import React from "react";
import { SYLLABUS_TOPICS, labelOf } from "../profile/logic";
import {
  listMaterials, addUploadedPDF, deleteMaterial, pdfBlobUrl, downloadPDF,
  linkFromPlanner, suggestFromProfileToPDF, createAIPDF, startExternalListener,
  TRUSTED_SOURCES, EXTRA_SOURCES,
  buildSiteSearchURL, addURLSmart
} from "../materials/materialHub";

export const StudyMaterials: React.FC = () => {
  const [items, setItems] = React.useState(listMaterials());
  const [q, setQ] = React.useState("");

  const subjects = ["toan", "tieng-anh"];
  const [subject, setSubject] = React.useState<string>(subjects[0] || "toan");
  const [topic, setTopic] = React.useState<string>((SYLLABUS_TOPICS[subject]||[])[0] || "");
  const [level, setLevel] = React.useState<"yeu"|"trung-binh"|"kha"|"gioi">("trung-binh");

  // Finder/Trusted
  const [finderQ, setFinderQ] = React.useState<string>(""); 
  const [finderSources, setFinderSources] = React.useState<string[]>([...TRUSTED_SOURCES]);
  const [pasteURL, setPasteURL] = React.useState<string>("");

  React.useEffect(()=>{ setTopic((SYLLABUS_TOPICS[subject]||[])[0] || ""); },[subject]);
  const refresh = () => setItems(listMaterials());

  React.useEffect(()=>{ startExternalListener(refresh); },[]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { await addUploadedPDF(f, subject, topic); refresh(); }
    catch (err:any) { alert(err?.message || "Không thể tải tệp."); }
    finally { if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const onLinkPlanner = () => { const n = linkFromPlanner(1); refresh(); alert(n?`Đã thêm ${n} gói luyện từ Kế hoạch tuần hiện tại.`:"Không có kế hoạch phù hợp."); };
  const onSuggestProfile = () => { const n = suggestFromProfileToPDF(subject, 3); refresh(); alert(n?`Đã tạo ${n} PDF từ chủ đề yếu trong Hồ sơ.`:"Chưa có dữ liệu phù hợp."); };

  const onCreateAI = async () => {
    try {
      await createAIPDF(subject, topic, level);
      refresh();
      // Nếu chạy được nhưng thiếu font, tên file sẽ có "• no-font" → nhắc cô thêm font để có dấu đẹp
      alert("Đã tạo tài liệu AI. Nếu thấy \"• no-font\" hãy thêm public/fonts/NotoSans-Regular.ttf để hiển thị tiếng Việt đẹp.");
    } catch (e:any) {
      console.error(e);
      alert("Không tạo được PDF AI. Kiểm tra: đã cài 'jspdf' chưa và đã thêm public/fonts/NotoSans-Regular.ttf chưa?");
    }
  };

  const toggleSource = (dom: string) => setFinderSources(p => p.includes(dom) ? p.filter(d=>d!==dom) : [...p, dom]);
  const openSearchTabs = () => {
    const terms = `${finderQ} ${labelOf(subject)} ${topic || ""}`.trim();
    finderSources.forEach(dom => window.open(buildSiteSearchURL(dom, terms), "_blank"));
  };
  const onAddURLSmart = async () => {
    const url = pasteURL.trim(); if (!url) return;
    const { ok, mode } = await addURLSmart(url, subject, topic); refresh();
    alert(ok ? (mode==="pdf" ? "Đã tải và lưu PDF vào Kho." : "Đã thêm link vào Kho.") : "Trang chặn tải trực tiếp — đã lưu link vào Kho.");
    setPasteURL("");
  };

  const filtered = items.filter(it => {
    const kw = q.trim().toLowerCase(); if (!kw) return true;
    return (it.name + " " + it.subject + " " + (it.topic||"") + " " + it.source).toLowerCase().includes(kw);
  });

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
        <h1 className="text-2xl font-semibold mb-3">Kho tài liệu học tập</h1>
        <p className="text-sm opacity-70 mb-3">PDF AI luôn tạo được (nếu thiếu font sẽ dùng fallback) — thêm font NotoSans để hiển thị tiếng Việt đẹp.</p>

        {/* Thanh công cụ */}
        <div className="rounded-2xl border p-3 mb-3">
          <div className="flex flex-wrap gap-2">
            <button onClick={onLinkPlanner} className="px-3 py-2 rounded-lg bg-black text-white">Liên kết từ Kế hoạch</button>
            <button onClick={onSuggestProfile} className="px-3 py-2 rounded-lg bg-indigo-600 text-white">Đề xuất từ Hồ sơ → PDF</button>
            <div className="ml-auto flex flex-wrap gap-2 items-center">
              <select className="border rounded-lg p-2" value={subject} onChange={e=>setSubject(e.target.value)}>
                {subjects.map(s=><option key={s} value={s}>{labelOf(s)}</option>)}
              </select>
              <select className="border rounded-lg p-2" value={topic} onChange={e=>setTopic(e.target.value)}>
                {(SYLLABUS_TOPICS[subject]||[]).map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <select className="border rounded-lg p-2" value={level} onChange={e=>setLevel(e.target.value as any)}>
                <option value="yeu">Yếu</option><option value="trung-binh">Trung bình</option><option value="kha">Khá</option><option value="gioi">Giỏi</option>
              </select>
              <button onClick={onCreateAI} className="px-3 py-2 rounded-lg bg-emerald-600 text-white">Tạo PDF AI</button>
              <button onClick={onPickFile} className="px-3 py-2 rounded-lg bg-gray-800 text-white">Tải lên PDF</button>
              <input ref={fileInputRef} onChange={onFileChange} type="file" accept="application/pdf" className="hidden" />
            </div>
          </div>
        </div>

        {/* WEB FINDER */}
        <div className="rounded-2xl border p-3 mb-3 bg-slate-50 dark:bg-slate-900">
          <div className="font-medium mb-2">Tìm tài liệu từ trang khác</div>
          <div className="grid md:grid-cols-6 gap-2">
            <input className="md:col-span-6 border rounded-lg p-2 bg-white dark:bg-gray-800" placeholder="Nhập từ khoá (vd: 'Hệ phương trình đề thi vào 10 PDF')" value={finderQ} onChange={e=>setFinderQ(e.target.value)} />
            <div className="md:col-span-6 text-xs opacity-70">Chọn nguồn (mở site:domain trong tab mới):</div>
            <div className="md:col-span-6 flex flex-wrap gap-2">
              {[...TRUSTED_SOURCES, ...EXTRA_SOURCES].map(dom => (
                <label key={dom} className={`px-2 py-0.5 rounded-lg border cursor-pointer text-sm ${finderSources.includes(dom)?"bg-white dark:bg-gray-700":"bg-white/60 dark:bg-gray-800/60"}`}>
                  <input type="checkbox" className="mr-1" checked={finderSources.includes(dom)} onChange={()=>toggleSource(dom)} />{dom}
                </label>
              ))}
            </div>
            <div className="md:col-span-6">
              <button onClick={openSearchTabs} className="px-3 py-2 rounded-lg bg-black text-white">Mở kết quả tìm kiếm</button>
            </div>
          </div>

          {/* Thêm URL cụ thể */}
          <div className="mt-3 grid md:grid-cols-6 gap-2 items-center">
            <input className="md:col-span-5 border rounded-lg p-2 bg-white dark:bg-gray-800" placeholder="Dán URL tài liệu tìm được (tải PDF nếu trang cho phép)" value={pasteURL} onChange={e=>setPasteURL(e.target.value)} />
            <button onClick={onAddURLSmart} className="md:col-span-1 px-3 py-2 rounded-lg bg-emerald-600 text-white">Thêm vào Kho</button>
          </div>
        </div>

        {/* Tìm trong Kho */}
        <input className="w-full border rounded-lg p-2 mb-3 bg-white dark:bg-gray-700" placeholder="Tìm kiếm trong Kho tài liệu..." value={q} onChange={e=>setQ(e.target.value)} />

        {/* Danh sách tài liệu */}
        <div className="space-y-2">
          {filtered.length===0 && <div className="text-sm opacity-70 p-4 text-center">Chưa có tài liệu. Hãy dùng các nút / Web Finder ở trên.</div>}
          {filtered.map(it=>(
            <div key={it.id} className="flex items-center justify-between rounded-xl border p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 ${
                  it.type==="pdf" ? (it.source==="ai"?"bg-emerald-600":"bg-gray-800")
                  : it.source==="trusted" ? "bg-blue-600" : it.source==="planner" ? "bg-black" : "bg-indigo-600"
                }`}>
                  {it.type==="pdf" ? "PDF" : (it.source==="trusted" ? "★" : "↗")}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate" title={it.name}>{it.name}</div>
                  <div className="text-xs opacity-70 truncate">
                    {labelOf(it.subject)} {it.topic?`• ${it.topic}`:""} • {new Date(it.createdAt).toLocaleDateString()}
                    • Tin cậy {it.quality.score}% — {it.quality.badges.slice(0,2).join(" • ")}
                    {it.type==="pdf" && it.sizeKB ? ` • ${it.sizeKB} KB` : ""}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {it.type==="pdf" && (<><a href={pdfBlobUrl(it)} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-lg bg-white dark:bg-gray-600 border dark:border-gray-500 text-sm">Xem</a><button onClick={()=>downloadPDF(it)} className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-500 text-sm">Tải xuống</button></>)}
                {it.type==="link" && it.url && <a href={it.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-lg bg-gray-800 text-white text-sm">Mở</a>}
                <button onClick={()=>{ deleteMaterial(it.id); setItems(listMaterials()); }} className="px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">Xoá</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}