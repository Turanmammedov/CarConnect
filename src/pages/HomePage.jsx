import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import TopBar from "../components/layout/TopBar";
import StoriesBar from "../components/stories/StoriesBar";
import PostCard from "../components/stories/PostCard";
import AddStoryModal from "../components/stories/AddStoryModal";

import { useApp } from "../context/AppContext";
import "../css/HomePage.css";

export default function HomePage() {
  const { posts, postsLoading, fetchPosts } = useApp();

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="home-page">

      {/* TOP BAR */}
      <TopBar
        showLogo
        rightAction={
          <button className="add-btn" onClick={() => setShowAdd(true)}>
            <Plus size={14} />
            Paylaş
          </button>
        }
      />

      {/* STORIES */}
      <div className="stories-wrapper">
        <StoriesBar onAdd={() => setShowAdd(true)} />
      </div>

      {/* FEED HEADER */}
      <div className="feed-header">
        <h2>Son Paylaşımlar</h2>

        <div className="feed-actions">
          <span>{posts.length} paylaşım</span>

          <button onClick={fetchPosts}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* FEED */}
      <div className="feed">

        {postsLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="skeleton-post" />
          ))
        ) : posts.length === 0 ? (
          <div className="empty-feed">
            <div className="emoji">🚗</div>
            <p>Hələ paylaşım yoxdur</p>
            <span>İlk paylaşımı sən et!</span>

            <button onClick={() => setShowAdd(true)}>
              İlk paylaşımı əlavə et
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}

      </div>

      {/* MODAL */}
      {showAdd && (
        <AddStoryModal onClose={() => setShowAdd(false)} />
      )}

    </div>
  );
}