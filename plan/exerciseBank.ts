/**
 * Ngân hàng GÓI BÀI TẬP theo môn × trình độ × chủ đề.
 * Mục tiêu: sau khi tạo kế hoạch theo tuần, mỗi nhiệm vụ có sẵn "gói bài tập"
 * phù hợp năng lực, giúp bấm là học ngay.
 */
import { labelOf } from "../profile/logic";
export type Level = "yeu" | "trung-binh" | "kha" | "gioi";
export type ExerciseItem = {
  mode: "quiz" | "short" | "reading" | "essay" | "project";
  minutes: number;
  count?: number;                    // số câu (nếu có)
  difficulty?: "E" | "M" | "H";      // độ khó (quiz/short)
  note?: string;                     // ghi chú/rubic ngắn
};
export type ExercisePack = {
  title: string;
  minutes: number;                   // tổng thời lượng ước tính
  items: ExerciseItem[];
  knowledgePoints: string[];         // gợi ý kiến thức cần ôn
  startParams?: { mode: "quiz"|"short"; num: number; diff: "E"|"M"|"H" }; // để mở /practice
};

/** Tạo gói bài tập theo môn×trình độ×loại nhiệm vụ */
export function buildExercisePack(subject: string, level: Level, topic: string, type: "practice"|"theory"|"review"): ExercisePack {
  const subjName = labelOf(subject);

  // ======== Preset theo môn ========
  const bySubject: Record<string, (lvl: Level) => ExercisePack> = {
    // TOÁN
    "toan": (lvl) => {
      const baseKP = [`Ôn công thức cốt lõi của: ${topic}`, "Tập nhận dạng dạng bài", "Tối ưu bước giải & bấm máy"];
      if (type === "theory") return {
        title: `${subjName} – Lý thuyết nhanh: ${topic}`,
        minutes: 15,
        items: [{ mode:"reading", minutes: 10, note:"Xem công thức + ví dụ mẫu" }, { mode:"short", minutes: 5, count:3, difficulty:"E", note:"3 câu tự luận ngắn" }],
        knowledgePoints: baseKP
      };
      const map: Record<Level, ExercisePack> = {
        "yeu": { title:`${subjName} – Củng cố cơ bản: ${topic}`, minutes: 20,
          items:[ {mode:"quiz", minutes:15, count:10, difficulty:"E"}, {mode:"short", minutes:5, count:2, difficulty:"E"} ],
          knowledgePoints: baseKP,
          startParams:{mode:"quiz", num:10, diff:"E"} },
        "trung-binh": { title:`${subjName} – Luyện chuẩn: ${topic}`, minutes: 25,
          items:[ {mode:"quiz", minutes:18, count:12, difficulty:"M"}, {mode:"short", minutes:7, count:2, difficulty:"M"} ],
          knowledgePoints: baseKP,
          startParams:{mode:"quiz", num:12, diff:"M"} },
        "kha": { title:`${subjName} – Tăng tốc: ${topic}`, minutes: 30,
          items:[ {mode:"quiz", minutes:22, count:15, difficulty:"M"}, {mode:"short", minutes:8, count:2, difficulty:"H"} ],
          knowledgePoints: baseKP,
          startParams:{mode:"quiz", num:15, diff:"M"} },
        "gioi": { title:`${subjName} – Chinh phục: ${topic}`, minutes: 35,
          items:[ {mode:"quiz", minutes:25, count:12, difficulty:"H"}, {mode:"short", minutes:10, count:3, difficulty:"H"} ],
          knowledgePoints: baseKP,
          startParams:{mode:"quiz", num:12, diff:"H"} }
      }; return map[lvl];
    },

    // NGỮ VĂN
    "ngu-van": (lvl) => {
      const baseKP = [`Đọc hiểu – nhận diện PTBĐ/biện pháp tu từ về: ${topic}`, "Kĩ năng đoạn NLXH 200 chữ", "Dàn ý NLVH 6–8 ý"];
      if (type === "review") return {
        title:`${subjName} – Tổng kết nhanh: ${topic}`, minutes: 25,
        items:[{mode:"reading", minutes:10, note:"Tóm tắt tác phẩm/dẫn chứng"}, {mode:"essay", minutes:15, note:"Viết đoạn 200 chữ (5 tiêu chí)"}],
        knowledgePoints: baseKP
      };
      const map: Record<Level, ExercisePack> = {
        "yeu": { title:`${subjName} – Củng cố nền: ${topic}`, minutes: 30,
          items:[ {mode:"reading", minutes:10, note:"1 bài đọc hiểu 5–7 câu"},
                  {mode:"essay", minutes:20, note:"Đoạn NLXH 150–200 chữ (2–3 dẫn chứng)"} ],
          knowledgePoints: baseKP },
        "trung-binh": { title:`${subjName} – Chuẩn đề thi: ${topic}`, minutes: 40,
          items:[ {mode:"reading", minutes:10, note:"1 bài đọc hiểu 7–10 câu"},
                  {mode:"essay", minutes:30, note:"Đoạn NLXH 200 chữ (5 tiêu chí)"} ],
          knowledgePoints: baseKP },
        "kha": { title:`${subjName} – Tăng chất lượng diễn đạt: ${topic}`, minutes: 45,
          items:[ {mode:"essay", minutes:20, note:"Đoạn NLXH 200 chữ – tránh lỗi lập luận"},
                  {mode:"essay", minutes:25, note:"Dàn ý Nghị luận văn học (6–8 ý)"} ],
          knowledgePoints: baseKP },
        "gioi": { title:`${subjName} – Hoàn chỉnh bài thi: ${topic}`, minutes: 60,
          items:[ {mode:"essay", minutes:25, note:"Đoạn NLXH 200 chữ đạt 5/5 tiêu chí"},
                  {mode:"essay", minutes:35, note:"Bài NLVH 35’ (mở/kết + liên hệ)"} ],
          knowledgePoints: baseKP }
      }; return map[lvl];
    },

    // TIẾNG ANH
    "tieng-anh": (lvl) => {
      const baseKP = [`Grammar trọng tâm của: ${topic}`, "Error finding", "Reading comprehension"];
      const map: Record<Level, ExercisePack> = {
        "yeu": { title:`${subjName} – Basic drill: ${topic}`, minutes:20,
          items:[{mode:"quiz", minutes:15, count:12, difficulty:"E"}, {mode:"reading", minutes:5, note:"đoạn ngắn A1–A2"}],
          knowledgePoints: baseKP, startParams:{mode:"quiz", num:12, diff:"E"} },
        "trung-binh": { title:`${subjName} – Core practice: ${topic}`, minutes:25,
          items:[{mode:"quiz", minutes:18, count:15, difficulty:"M"}, {mode:"short", minutes:7, count:3, difficulty:"M"}],
          knowledgePoints: baseKP, startParams:{mode:"quiz", num:15, diff:"M"} },
        "kha": { title:`${subjName} – Mixed set: ${topic}`, minutes:30,
          items:[{mode:"quiz", minutes:22, count:18, difficulty:"M"}, {mode:"reading", minutes:8, note:"đoạn B1"}],
          knowledgePoints: baseKP, startParams:{mode:"quiz", num:18, diff:"M"} },
        "gioi": { title:`${subjName} – Challenge: ${topic}`, minutes:35,
          items:[{mode:"quiz", minutes:25, count:20, difficulty:"H"}, {mode:"reading", minutes:10, note:"đoạn B1–B2"}],
          knowledgePoints: baseKP, startParams:{mode:"quiz", num:20, diff:"H"} }
      }; return map[lvl];
    },

    // VẬT LÍ / HÓA / SINH (mẫu giống nhau: quiz + short)
    "vat-li": (lvl) => sciPack(subjName, lvl, topic),
    "hoa-hoc": (lvl) => sciPack(subjName, lvl, topic),
    "sinh-hoc": (lvl) => sciPack(subjName, lvl, topic),

    // LỊCH SỬ / ĐỊA LÍ (nhận xét biểu đồ/atlat)
    "lich-su": (lvl) => {
      const baseKP = [`Mốc thời gian/nhân vật của: ${topic}`, "Dạng so sánh – nguyên nhân – ý nghĩa"];
      return levelPackList(subjName, lvl, topic, baseKP);
    },
    "dia-li": (lvl) => {
      const baseKP = [`Khai thác Atlat, dạng biểu đồ: ${topic}`, "Nhận xét – giải thích số liệu"];
      return levelPackList(subjName, lvl, topic, baseKP);
    },

    // TIN HỌC
    "tin-hoc": (lvl) => {
      const baseKP = [`Thao tác thực hành: ${topic}`, "Tư duy thuật toán cơ bản"];
      const map: Record<Level, ExercisePack> = {
        "yeu": { title:`${subjName} – Thực hành cơ bản: ${topic}`, minutes:20,
          items:[{mode:"project", minutes:20, note:"Bài thực hành ngắn (Word/Excel/Scratch)"}],
          knowledgePoints: baseKP },
        "trung-binh": { title:`${subjName} – Bài tập thao tác: ${topic}`, minutes:25,
          items:[{mode:"project", minutes:25, note:"Tạo bảng + hàm SUM/IF hoặc khối lệnh cơ bản"}],
          knowledgePoints: baseKP },
        "kha": { title:`${subjName} – Ứng dụng nhỏ: ${topic}`, minutes:30,
          items:[{mode:"project", minutes:30, note:"Bài tập Excel COUNTIF/VLOOKUP hoặc mini-project Scratch"}],
          knowledgePoints: baseKP },
        "gioi": { title:`${subjName} – Mini project: ${topic}`, minutes:40,
          items:[{mode:"project", minutes:40, note:"Bài tập tổng hợp / automation nhỏ"}],
          knowledgePoints: baseKP }
      }; return map[lvl];
    },

    // TIẾNG PHÁP
    "tieng-phap": (lvl) => {
      const baseKP = [`Ngữ pháp/chủ điểm: ${topic}`, "Từ vựng A1–A2", "Câu hỏi – hội thoại ngắn"];
      const map: Record<Level, ExercisePack> = {
        "yeu": { title:`${subjName} – Basis: ${topic}`, minutes:20,
          items:[{mode:"quiz", minutes:15, count:10, difficulty:"E"}, {mode:"short", minutes:5, count:2, difficulty:"E"}],
          knowledgePoints: baseKP, startParams:{mode:"quiz", num:10, diff:"E"} },
        "trung-binh": { title:`${subjName} – Drill: ${topic}`, minutes:25,
          items:[{mode:"quiz", minutes:18, count:12, difficulty:"M"}, {mode:"short", minutes:7, count:2, difficulty:"M"}],
          knowledgePoints: baseKP, startParams:{mode:"quiz", num:12, diff:"M"} },
        "kha": { title:`${subjName} – Mix: ${topic}`, minutes:30,
          items:[{mode:"quiz", minutes:20, count:16, difficulty:"M"}, {mode:"reading", minutes:10, note:"đoạn A2"}],
          knowledgePoints: baseKP, startParams:{mode:"quiz", num:16, diff:"M"} },
        "gioi": { title:`${subjName} – Challenge: ${topic}`, minutes:35,
          items:[{mode:"quiz", minutes:25, count:18, difficulty:"H"}, {mode:"reading", minutes:10, note:"đoạn A2–B1"}],
          knowledgePoints: baseKP, startParams:{mode:"quiz", num:18, diff:"H"} }
      }; return map[lvl];
    },
  };

  // ===== Helper cho khối KHTN & LS/ĐL =====
  function sciPack(name: string, lvl: Level, topic: string): ExercisePack {
    const baseKP = [`Công thức/định luật của: ${topic}`, "Áp dụng tính toán – đơn vị – đổi đơn vị"];
    const map: Record<Level, ExercisePack> = {
      "yeu": { title:`${name} – Cơ bản: ${topic}`, minutes:20,
        items:[{mode:"quiz", minutes:15, count:10, difficulty:"E"}, {mode:"short", minutes:5, count:2, difficulty:"E"}],
        knowledgePoints: baseKP, startParams:{mode:"quiz", num:10, diff:"E"} },
      "trung-binh": { title:`${name} – Chuẩn đề: ${topic}`, minutes:25,
        items:[{mode:"quiz", minutes:18, count:12, difficulty:"M"}, {mode:"short", minutes:7, count:2, difficulty:"M"}],
        knowledgePoints: baseKP, startParams:{mode:"quiz", num:12, diff:"M"} },
      "kha": { title:`${name} – Tăng tốc: ${topic}`, minutes:30,
        items:[{mode:"quiz", minutes:22, count:15, difficulty:"M"}, {mode:"short", minutes:8, count:2, difficulty:"H"}],
        knowledgePoints: baseKP, startParams:{mode:"quiz", num:15, diff:"M"} },
      "gioi": { title:`${name} – Nâng cao: ${topic}`, minutes:35,
        items:[{mode:"quiz", minutes:25, count:15, difficulty:"H"}, {mode:"short", minutes:10, count:3, difficulty:"H"}],
        knowledgePoints: baseKP, startParams:{mode:"quiz", num:15, diff:"H"} }
    }; return map[lvl];
  }
  function levelPackList(name: string, lvl: Level, topic: string, baseKP: string[]): ExercisePack {
    const map: Record<Level, ExercisePack> = {
      "yeu": { title:`${name} – Nhận biết: ${topic}`, minutes:20,
        items:[{mode:"quiz", minutes:15, count:10, difficulty:"E"}, {mode:"reading", minutes:5, note:"ghi nhớ mốc/khái niệm"}],
        knowledgePoints: baseKP, startParams:{mode:"quiz", num:10, diff:"E"} },
      "trung-binh": { title:`${name} – Thông hiểu: ${topic}`, minutes:25,
        items:[{mode:"quiz", minutes:18, count:12, difficulty:"M"}, {mode:"short", minutes:7, count:2, difficulty:"M"}],
        knowledgePoints: baseKP, startParams:{mode:"quiz", num:12, diff:"M"} },
      "kha": { title:`${name} – Vận dụng: ${topic}`, minutes:30,
        items:[{mode:"quiz", minutes:22, count:15, difficulty:"M"}, {mode:"short", minutes:8, count:2, difficulty:"H"}],
        knowledgePoints: baseKP, startParams:{mode:"quiz", num:15, diff:"M"} },
      "gioi": { title:`${name} – Vận dụng cao: ${topic}`, minutes:35,
        items:[{mode:"quiz", minutes:25, count:15, difficulty:"H"}, {mode:"short", minutes:10, count:3, difficulty:"H"}],
        knowledgePoints: baseKP, startParams:{mode:"quiz", num:15, diff:"H"} }
    }; return map[lvl];
  }

  // ===== Chọn pack theo môn =====
  const fn = bySubject[subject] || bySubject["toan"];
  return fn(level);
}
