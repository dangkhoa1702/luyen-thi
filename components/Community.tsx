import React, { useState, useEffect } from "react";
import { labelOf, SYLLABUS_TOPICS } from "../profile/logic";
import { Post, Comment } from "../community/communityTypes";
import type { User } from '../types';

const SUBJECTS = Object.keys(SYLLABUS_TOPICS);

const POSTS_KEY = 'ai.community.posts.v1';
const COMMENTS_KEY = 'ai.community.comments.v1';
const LIKES_KEY = 'ai.community.likes.v1';

// --- LocalStorage Data Helpers ---
const getPosts = (): Post[] => JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
const savePosts = (posts: Post[]) => localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

const getComments = (): Record<string, Comment[]> => JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
const saveComments = (comments: Record<string, Comment[]>) => localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));

const getLikes = (): Record<string, string[]> => JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
const saveLikes = (likes: Record<string, string[]>) => localStorage.setItem(LIKES_KEY, JSON.stringify(likes));

// --- Initial Mock Data for Seeding ---
const seedInitialData = () => {
    if (localStorage.getItem(POSTS_KEY)) return;

    const MOCK_POSTS: Post[] = [
        { id: 'post-1', authorId: 'user-2', authorName: 'Trần Văn An', title: 'Mẹo giải nhanh bài toán hình học không gian?', subject: 'toan', replies: 0, likes: 12, createdAt: Date.now() - 2 * 3600 * 1000, lastActivityAt: Date.now() - 2 * 3600 * 1000 },
        { id: 'post-2', authorId: 'user-3', authorName: 'Lê Thị Bình', title: 'Tổng hợp các tác phẩm văn học trọng tâm cần ôn thi', subject: 'ngu-van', replies: 0, likes: 25, createdAt: Date.now() - 5 * 3600 * 1000, lastActivityAt: Date.now() - 5 * 3600 * 1000 },
        { id: 'post-3', authorId: 'user-4', authorName: 'Nguyễn Hoàng Cường', title: 'Làm sao để không bị mất điểm ở những câu dễ trong đề Tiếng Anh?', subject: 'tieng-anh', replies: 0, likes: 8, createdAt: Date.now() - 24 * 3600 * 1000, lastActivityAt: Date.now() - 24 * 3600 * 1000 },
    ];
    savePosts(MOCK_POSTS);
};

function timeAgo(ms: number) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s trước`;
  const m = Math.floor(s/60); if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m/60); if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h/24); return `${d} ngày trước`;
}

interface CommunityProps {
    user: User | null;
}

export const Community: React.FC<CommunityProps> = ({ user }) => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [comments, setComments] = React.useState<Record<string, Comment[]>>({});
  const [likes, setLikes] = React.useState<Record<string, string[]>>({});
  
  const [subject, setSubject] = React.useState<string>("");
  const [search, setSearch] = React.useState<string>("");
  const [sort, setSort] = React.useState<"new"|"trend">("new");

  const [showNew, setShowNew] = React.useState<boolean>(false);
  const [newSubject, setNewSubject] = React.useState<string>(SUBJECTS[0] || "toan");
  const [newTitle, setNewTitle] = React.useState<string>("");

  const [activeReplyPost, setActiveReplyPost] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState<string>("");
  
  const refreshData = () => {
      setPosts(getPosts());
      setComments(getComments());
      setLikes(getLikes());
  };

  React.useEffect(()=>{
    seedInitialData();
    refreshData();
  },[]);

  // Create Post
  const createPost = () => {
    if (!user) return alert("Vui lòng đăng nhập để tạo bài viết.");
    if (!newTitle.trim()) return alert("Vui lòng nhập tiêu đề.");
    
    const now = Date.now();
    const newPost: Post = {
      id: `post-${now}`,
      title: newTitle.trim(),
      subject: newSubject,
      authorId: user.id,
      authorName: user.name,
      createdAt: now,
      lastActivityAt: now,
      replies: 0,
      likes: 0,
    };
    const allPosts = getPosts();
    savePosts([newPost, ...allPosts]);
    setNewTitle(""); 
    setShowNew(false);
    refreshData();
  }

  // Toggle Like
  const toggleLike = (postId: string) => {
    if (!user) return alert("Vui lòng đăng nhập để thích bài viết.");
    const allLikes = getLikes();
    const postLikes = allLikes[postId] || [];
    const userIndex = postLikes.indexOf(user.id);

    if (userIndex > -1) {
        postLikes.splice(userIndex, 1);
    } else {
        postLikes.push(user.id);
    }
    allLikes[postId] = postLikes;
    saveLikes(allLikes);

    const allPosts = getPosts();
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
        allPosts[postIndex].likes = postLikes.length;
        savePosts(allPosts);
    }
    refreshData();
  }

  // Moderation Actions
  const updatePost = (postId: string, updates: Partial<Post>) => {
    const allPosts = getPosts();
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
        allPosts[postIndex] = { ...allPosts[postIndex], ...updates };
        savePosts(allPosts);
        refreshData();
    }
  };

  const removePost = (postId: string) => {
    if (!confirm("Bạn có chắc muốn xoá bài viết này?")) return;
    const allPosts = getPosts().filter(p => p.id !== postId);
    savePosts(allPosts);
    refreshData();
  }

  // Submit Reply
  const submitReply = (postId: string) => {
    if (!user) return alert("Vui lòng đăng nhập để trả lời.");
    if (!replyText.trim()) return;

    const now = Date.now();
    const newComment: Comment = {
      id: `comment-${now}`,
      content: replyText.trim(),
      authorId: user.id,
      authorName: user.name,
      createdAt: now,
    };
    
    const allComments = getComments();
    const postComments = allComments[postId] || [];
    postComments.unshift(newComment);
    allComments[postId] = postComments;
    saveComments(allComments);

    updatePost(postId, { replies: postComments.length, lastActivityAt: now });
    
    setReplyText(""); 
    setActiveReplyPost(null);
    refreshData();
  }

  const filtered = posts
    .filter(p => !(p.hidden && user?.role !== 'teacher'))
    .filter(p => !subject || p.subject === subject)
    .filter(p => {
      const kw = search.trim().toLowerCase();
      if (!kw) return true;
      return `${p.title} ${p.authorName||""}`.toLowerCase().includes(kw);
    })
    .sort((a,b)=>{
      if (b.pinned && !a.pinned) return 1;
      if (!b.pinned && a.pinned) return -1;
      
      const lastActivityA = a.lastActivityAt || a.createdAt;
      const lastActivityB = b.lastActivityAt || b.createdAt;

      if (sort === "new") {
        return lastActivityB - lastActivityA;
      } else { // trend
        const scoreA = a.replies * 3 + a.likes + (Date.now() - lastActivityA < 36e5 ? 2 : 0);
        const scoreB = b.replies * 3 + b.likes + (Date.now() - lastActivityB < 36e5 ? 2 : 0);
        return scoreB - scoreA;
      }
    });

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Cộng đồng học tập</h1>
          <button onClick={()=>setShowNew(true)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">+ Tạo bài viết</button>
        </div>

        <div className="rounded-2xl border dark:border-gray-700 p-3 mb-4 flex flex-wrap gap-2 items-center bg-white dark:bg-gray-800">
          <select value={subject} onChange={e => setSubject(e.target.value)} className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Tất cả môn</option>
            {SUBJECTS.map(s=><option key={s} value={s}>{labelOf(s)}</option>)}
          </select>
          <input className="flex-1 min-w-[150px] border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tìm bài viết..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" value={sort} onChange={e=>setSort(e.target.value as any)}>
            <option value="new">Mới nhất</option>
            <option value="trend">Xu hướng</option>
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map(p=>(
            <div key={p.id} className="rounded-2xl border dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${p.authorName}`} alt={p.authorName} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <div className="font-semibold">{p.authorName||"Ẩn danh"}</div>
                    <div className="text-xs opacity-60">{timeAgo(p.createdAt)}</div>
                  </div>
                </div>
                <div className="text-xs">
                  {p.pinned && <span className="px-2 py-0.5 rounded-full border border-yellow-500 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 mr-2">Ghim</span>}
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">{labelOf(p.subject)}</span>
                </div>
              </div>

              <h2 className="mt-3 font-bold text-lg">{p.title}</h2>

              <div className="mt-3 flex items-center gap-3 text-sm">
                <button onClick={()=>toggleLike(p.id)} className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors ${likes[p.id]?.includes(user?.id || '') ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>👍 {p.likes||0}</button>
                <div className="opacity-70">💬 {p.replies||0} trả lời</div>
                {user?.role === "teacher" && (
                  <>
                    <button onClick={()=>updatePost(p.id, { pinned: !p.pinned })} className="px-2 py-1 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700">{p.pinned?"Bỏ ghim":"Ghim"}</button>
                    <button onClick={()=>updatePost(p.id, { hidden: !p.hidden })} className="px-2 py-1 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700">{p.hidden?"Hiện":"Ẩn"}</button>
                    <button onClick={()=>removePost(p.id)} className="px-2 py-1 rounded-lg border text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">Xoá</button>
                  </>
                )}
                <button onClick={()=>setActiveReplyPost(activeReplyPost===p.id?null:p.id)} className="ml-auto px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-200 text-white dark:text-black font-semibold text-xs">Trả lời</button>
              </div>

              {comments[p.id]?.length>0 && (
                <div className="mt-3 border-t dark:border-gray-700 pt-3 space-y-2">
                  {comments[p.id].slice(0, 2).map(c=>(
                     <div key={c.id} className="text-sm"><b className="font-semibold">{c.authorName||"Bạn"}</b>: {c.content}</div>
                  ))}
                  {comments[p.id].length > 2 && <div className="text-xs opacity-70">Xem tất cả {comments[p.id].length} trả lời...</div>}
                </div>
              )}

              {activeReplyPost===p.id && (
                <div className="mt-3 flex gap-2">
                  <input className="border rounded-lg p-2 flex-1 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Viết câu trả lời..." value={replyText} onChange={e=>setReplyText(e.target.value)} />
                  <button onClick={()=>submitReply(p.id)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Gửi</button>
                </div>
              )}
            </div>
          ))}
          {filtered.length===0 && <div className="opacity-60 text-sm text-center py-8">Chưa có bài viết phù hợp.</div>}
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={()=>setShowNew(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg" onClick={e=>e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Tạo bài viết mới</h2>
            <div className="space-y-3">
              <select className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={newSubject} onChange={e=>setNewSubject(e.target.value)}>
                {SUBJECTS.map(s=><option key={s} value={s}>{labelOf(s)}</option>)}
              </select>
              <input className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="Tiêu đề (vd: Mẹo giải nhanh...)" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
            </div>
            <div className="text-xs opacity-70 my-3">Giữ nội dung lịch sự, đúng chủ đề ôn thi vào lớp 10.</div>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setShowNew(false)} className="px-4 py-2 rounded-lg border dark:border-gray-600">Huỷ</button>
              <button onClick={createPost} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Đăng bài</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}