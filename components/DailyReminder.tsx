import React from "react";

type RemindCfg = { enabled: boolean; hour: number; minute: number };
const KEY = "ai.daily.reminder.v1";

function loadCfg(): RemindCfg {
  try { return JSON.parse(localStorage.getItem(KEY) || "") as RemindCfg; }
  catch { return { enabled: false, hour: 19, minute: 0 }; }
}
function saveCfg(c: RemindCfg) { localStorage.setItem(KEY, JSON.stringify(c)); }

function ensureTicker(cfg: RemindCfg) {
  if ((window as any).__reminderTicker) {
    clearInterval((window as any).__reminderTicker);
  }
  if (!cfg.enabled || !("Notification" in window)) return;

  (window as any).__reminderTicker = setInterval(() => {
    const now = new Date();
    const ok = now.getHours() === cfg.hour && now.getMinutes() === cfg.minute;
    const last = Number(localStorage.getItem(KEY + ".last") || 0);
    const sameDay =
      last && new Date(last).toDateString() === now.toDateString()
      && new Date(last).getHours() === cfg.hour;

    if (ok && !sameDay && Notification.permission === "granted") {
      new Notification("Đến giờ học rồi 🎯", { body: "Mở mục Kế hoạch hôm nay và bấm Học tiếp nhé!" });
      localStorage.setItem(KEY + ".last", String(Date.now()));
    }
  }, 60_000);
}

export default function DailyReminder() {
  const [cfg, setCfg] = React.useState<RemindCfg>(() => loadCfg());
  const [time, setTime] = React.useState(
    `${String(cfg.hour).padStart(2, "0")}:${String(cfg.minute).padStart(2, "0")}`
  );
  const [status, setStatus] = React.useState("");

  React.useEffect(() => { 
      ensureTicker(cfg); 
      // Cleanup on component unmount
      return () => {
          if ((window as any).__reminderTicker) {
            clearInterval((window as any).__reminderTicker);
          }
      }
  }, [cfg]);

  function parseTime(s: string) {
    const [h, m] = s.split(":").map((x) => parseInt(x || "0", 10));
    return { hour: Math.max(0, Math.min(23, h||0)), minute: Math.max(0, Math.min(59, m||0)) };
  }

  async function save() {
    const t = parseTime(time);
    const next = { ...cfg, ...t };

    if (next.enabled) {
      if (!("Notification" in window)) { setStatus("Trình duyệt không hỗ trợ Notifications."); return; }
      if (Notification.permission !== "granted") {
        const p = await Notification.requestPermission();
        if (p !== "granted") { 
            setStatus("Bạn chưa cho phép thông báo."); 
            // Uncheck the box if permission is denied
            setCfg(c => ({...c, enabled: false}));
            return; 
        }
      }
    }

    saveCfg(next);
    setCfg(next);
    setStatus("Đã lưu cài đặt nhắc học.");
  }

  function testNow() {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Thông báo thử 🔔", { body: "Bạn đã bật nhắc học thành công." });
    } else setStatus("Hãy Lưu & cấp quyền thông báo trước khi thử.");
  }
  
  const handleEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const isEnabled = e.target.checked;
      const t = parseTime(time);
      const next = { enabled: isEnabled, ...t };
      setCfg(next);
      // Immediately try to save and request permission if enabling
      if(isEnabled) {
          save();
      } else {
          saveCfg(next);
          setStatus("Đã tắt nhắc học.");
      }
  }

  return (
    <div className="p-4">
      <div className="max-w-xl mx-auto rounded-2xl border bg-white dark:bg-gray-800 p-4 space-y-3">
        <div className="text-lg font-semibold">Nhắc học hàng ngày</div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={cfg.enabled}
              onChange={handleEnableChange}/>
            Bật nhắc học
          </label>
          <input type="time" className="border rounded-lg px-3 py-1 bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
            value={time} onChange={(e)=>setTime(e.target.value)} disabled={!cfg.enabled} />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="px-3 py-1 rounded-lg bg-black dark:bg-blue-600 text-white text-sm disabled:opacity-50" disabled={!cfg.enabled}>Lưu cài đặt</button>
          <button onClick={testNow} className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50" disabled={!cfg.enabled}>Thử thông báo</button>
        </div>
        {status && <div className="text-xs opacity-70">{status}</div>}
        <div className="text-xs opacity-60">
          * Thông báo hiển thị khi trang đang mở trong một tab.
        </div>
      </div>
    </div>
  );
}