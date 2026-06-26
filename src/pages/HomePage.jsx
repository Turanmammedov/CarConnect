import { useState } from "react";
import { Plus, RefreshCw, Users, Globe } from "lucide-react";

import TopBar from "../components/layout/TopBar";
import StoriesBar from "../components/stories/StoriesBar";
import PostCard from "../components/stories/PostCard";
import AddStoryModal from "../components/stories/AddStoryModal";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import "../css/HomePage.css";

export default function HomePage() {
  const { 
    posts, postsLoading, fetchPosts,
    followedPosts, followedPostsLoading, fetchFollowedPosts 
  } = useApp();
  const { user } = useAuth();

  const [showAdd, setShowAdd] = useState(false);
  const [feedTab, setFeedTab] = useState("following"); // "following" | "all"

  const isFollowingTab = feedTab === "following";
  const currentPosts = isFollowingTab ? followedPosts : posts;
  const currentLoading = isFollowingTab ? followedPostsLoading : postsLoading;
  const handleRefresh = isFollowingTab ? fetchFollowedPosts : fetchPosts;

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

      {/* FEED TABS */}
      <div className="feed-tabs">
        <button
          className={`feed-tab ${feedTab === "following" ? "active" : ""}`}
          onClick={() => setFeedTab("following")}
        >
          <Users size={13} />
          İzlənilənlər
        </button>
        <button
          className={`feed-tab ${feedTab === "all" ? "active" : ""}`}
          onClick={() => setFeedTab("all")}
        >
          <Globe size={13} />
          Hamısı
        </button>
      </div>

      {/* FEED HEADER */}
      <div className="feed-header">
        <h2>
          {isFollowingTab ? "İzlənilənlərin Paylaşımları" : "Son Paylaşımlar"}
        </h2>

        <div className="feed-actions">
          <span>{currentPosts.length} paylaşım</span>

          <button onClick={handleRefresh}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* FEED */}
      <div className="feed">

        {currentLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="skeleton-post" />
          ))
        ) : currentPosts.length === 0 ? (
          <div className="empty-feed">
            <div className="emoji">{isFollowingTab ? "👥" : "🚗"}</div>
            {isFollowingTab ? (
              <>
                <p>Hələ paylaşım yoxdur</p>
                <span>İstifadəçiləri izləyin ki, onların paylaşımlarını görəsiniz!</span>
              </>
            ) : (
              <>
                <p>Hələ paylaşım yoxdur</p>
                <span>İlk paylaşımı sən et!</span>
                <button onClick={() => setShowAdd(true)}>
                  İlk paylaşımı əlavə et
                </button>
              </>
            )}
          </div>
        ) : (
          currentPosts.map((post) => (
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
