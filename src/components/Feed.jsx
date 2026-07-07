import { useState, useRef, useEffect } from 'react'
import {
  LeafIllustration, SmokeIllustration,
  HeartIllustration, CommentIllustration, ShareIllustration,
} from '../icons.jsx'

const MAX_MEDIA_BYTES = 50 * 1024 * 1024  // 50 MB

const DAYS_AGO = (iso) => {
  const diff = (Date.now() - Date.parse(iso)) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function toleranceBadgeClass(score) {
  if (score == null) return 'md'
  if (score > 60) return 'hi'
  if (score > 30) return 'md'
  return 'lo'
}

export default function Feed({ feed, likedPosts, onToggleLike, onCreatePost, profile, loading }) {
  const [composing,  setComposing]  = useState(false)
  const [draft,      setDraft]      = useState('')
  const [mediaFile,  setMediaFile]  = useState(null)
  const [mediaError, setMediaError] = useState('')
  const [posting,    setPosting]    = useState(false)
  const fileInputRef = useRef(null)

  const previewUrl = mediaFile ? URL.createObjectURL(mediaFile) : null
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const pickMedia = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setMediaError('Only photos and videos can be attached.')
      return
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setMediaError('File is too large (max 50 MB).')
      return
    }
    setMediaError('')
    setMediaFile(file)
  }

  const submitPost = async () => {
    if (!draft.trim() && !mediaFile) return
    setPosting(true)
    await onCreatePost(draft.trim(), null, mediaFile)
    setPosting(false)
    setDraft('')
    setMediaFile(null)
    setComposing(false)
  }

  return (
    <>
      {/* Stories row */}
      <div className="stories-row">
        <div className="story" onClick={() => setComposing(true)}>
          <div className="story-ring yours">
            <div className="story-inner story-add-inner">+</div>
          </div>
          <div className="story-name">you</div>
        </div>
        {feed.slice(0, 8).map(p => (
          <div key={p.id} className="story">
            <div className="story-ring">
              <div className="story-inner" style={{ background: p.avatar_color || 'var(--parch2)' }}>
                <LeafIllustration size={26} color="var(--emerald-l)" />
              </div>
            </div>
            <div className="story-name">{p.author_username}</div>
          </div>
        ))}
      </div>

      {/* Compose modal */}
      {composing && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setComposing(false)}>
          <div className="sheet">
            <button className="sheet-close" onClick={() => setComposing(false)}>✕</button>
            <div className="sheet-handle" />
            <div className="sheet-title">share a <em>moment</em></div>
            <div className="sheet-sub">what's on your mind?</div>
            <textarea
              value={draft} onChange={e => setDraft(e.target.value)}
              placeholder="just hit a PR on my t-break streak…"
              rows={4}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 14,
                border: '1.5px solid var(--border2)', background: 'var(--parch)',
                fontFamily: "'Mulish', sans-serif", fontSize: 13, fontWeight: 600,
                color: 'var(--ink)', resize: 'none', outline: 'none',
                boxSizing: 'border-box', marginBottom: 12,
              }}
            />

            {/* Media attach */}
            <input
              ref={fileInputRef} type="file" accept="image/*,video/*"
              onChange={pickMedia} style={{ display: 'none' }}
            />
            {mediaFile ? (
              <div style={{ position: 'relative', marginBottom: 14 }}>
                {mediaFile.type.startsWith('video/') ? (
                  <video src={previewUrl} controls className="compose-media-preview" />
                ) : (
                  <img src={previewUrl} alt="attachment preview" className="compose-media-preview" />
                )}
                <button
                  onClick={() => setMediaFile(null)}
                  style={{
                    position: 'absolute', top: 8, right: 8, width: 28, height: 28,
                    borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: 'rgba(14,10,6,0.7)', color: '#fff', fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', padding: '11px', marginBottom: 14,
                  background: 'none', border: '1.5px dashed var(--border2)', borderRadius: 14,
                  color: 'var(--ink4)', fontFamily: "'Mulish', sans-serif",
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                }}
              >+ add photo or video</button>
            )}
            {mediaError && (
              <div style={{ fontSize: 12, color: '#c0392b', fontWeight: 700, marginBottom: 12 }}>{mediaError}</div>
            )}

            <button className="log-btn" onClick={submitPost} disabled={posting} style={{ marginBottom: 0 }}>
              {posting ? 'posting…' : 'post'}
            </button>
          </div>
        </div>
      )}

      {/* Feed posts */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink4)', fontSize: 13, fontWeight: 700 }}>
          loading feed…
        </div>
      )}

      {!loading && feed.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          color: 'var(--ink4)', fontSize: 13, fontWeight: 700, lineHeight: 1.8,
        }}>
          <SmokeIllustration size={40} color="var(--ink5)" />
          <p style={{ marginTop: 16 }}>no posts yet.</p>
          <p>be the first to share something.</p>
        </div>
      )}

      {feed.map(p => (
        <PostCard
          key={p.id}
          post={p}
          liked={likedPosts.has(p.id)}
          onLike={() => onToggleLike(p.id)}
        />
      ))}
    </>
  )
}

function PostCard({ post, liked, onLike }) {
  const score = post.tolerance_score
  return (
    <div className="post">
      <div className="post-header">
        <div className="p-av" style={{ background: post.avatar_color || 'var(--parch2)' }}>
          <LeafIllustration size={22} color="var(--emerald)" />
        </div>
        <div>
          <div className="p-name">{post.author_username}</div>
          <div className="p-sub">{DAYS_AGO(post.created_at)}{score != null ? ` · index ${score}` : ''}</div>
        </div>
        {score != null && (
          <div className={`tol-badge ${toleranceBadgeClass(score)}`}>{score}</div>
        )}
      </div>

      {post.content && <div className="post-caption">{post.content}</div>}

      {post.media_url && (
        <div className="post-media">
          {post.media_type === 'video' ? (
            <video src={post.media_url} controls playsInline preload="metadata" />
          ) : (
            <img src={post.media_url} alt="" loading="lazy" />
          )}
        </div>
      )}

      <div className="post-actions">
        <button className={`pact ${liked ? 'liked' : ''}`} onClick={onLike}>
          <HeartIllustration size={16} color={liked ? 'var(--gold-l)' : 'var(--ink3)'} filled={liked} />
          {Number(post.like_count) + (liked ? 0 : 0)}
        </button>
        <button className="pact">
          <CommentIllustration size={16} color="var(--ink3)" />
          {post.comment_count}
        </button>
        <div className="pact-spacer" />
        <button className="pact" onClick={() => navigator.share?.({ text: post.content })}>
          <ShareIllustration size={16} color="var(--ink3)" />
          share
        </button>
      </div>
    </div>
  )
}
