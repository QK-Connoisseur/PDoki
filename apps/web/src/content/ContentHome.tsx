import { useCallback, useEffect, useRef, useState } from "react";
import MemberLayout from "../components/MemberLayout";
import { useOptionalAuth } from "../auth/authContext";
import { contentApi, contentMediaUrl } from "./contentApi";
import type { ContentMedia, ContentPost } from "./contentApi";

const buttonClass =
  "member-composer-submit rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50";
const secondaryClass =
  "rounded-xl border border-pink-200 px-4 py-2 text-sm font-medium text-[#8c6d7f] disabled:cursor-not-allowed disabled:opacity-50";
const allowedTypes = new Set(["image/png", "image/jpeg", "video/mp4"]);
const maxFileBytes = 20 * 1024 * 1024;

type HomeProps = {
  userStatus?: string;
  onStatusChange?: (status: string) => void;
};
type User = { id: string; role: string; emailVerified: boolean };

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The request failed. Try again.";
}

function Media({ media }: { media: ContentMedia }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <p role="status" className="bg-pink-50 p-6 text-sm text-[#8c6d7f]">
        This media is unavailable. Refresh to check access again.
      </p>
    );
  }
  const src = contentMediaUrl(media.url);
  return media.mimeType === "video/mp4" ? (
    <video
      controls
      preload="metadata"
      crossOrigin="use-credentials"
      src={src}
      onError={() => setFailed(true)}
      className="max-h-[600px] w-full bg-black object-contain"
      aria-label="Post video"
    />
  ) : (
    <img
      src={src}
      alt="Post photo"
      crossOrigin="use-credentials"
      onError={() => setFailed(true)}
      className="max-h-[600px] w-full object-contain"
    />
  );
}

function PostCard({
  post,
  owner = false,
  busy = false,
  onPublish,
  onRemove,
}: {
  post: ContentPost;
  owner?: boolean;
  busy?: boolean;
  onPublish?: () => void;
  onRemove?: () => void;
}) {
  return (
    <article
      className="sakura-feed-card overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm"
      aria-label={`${post.state === "DRAFT" ? "Draft" : "Post"} by ${post.creator.displayName}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500"
          aria-hidden="true"
        >
          {post.creator.displayName.slice(0, 1)}
        </span>
        <div>
          <p className="text-sm font-semibold text-[#241a22]">
            {post.creator.displayName}
          </p>
          <p className="text-xs text-[#8c6d7f]">
            {post.state === "DRAFT" ? "Private draft · only you" : "Published"}
          </p>
        </div>
      </div>
      {post.body && (
        <p className="member-post-caption whitespace-pre-wrap break-words px-4 pb-3 text-sm leading-relaxed text-[#4a3340]">
          {post.body}
        </p>
      )}
      <div className="space-y-1">
        {post.media.map((media) => (
          <Media key={media.id} media={media} />
        ))}
      </div>
      {owner && (
        <div className="flex flex-wrap gap-3 p-4">
          {post.state === "DRAFT" && (
            <button
              type="button"
              className={buttonClass}
              disabled={busy}
              onClick={onPublish}
            >
              Publish
            </button>
          )}
          <button
            type="button"
            className={secondaryClass}
            disabled={busy}
            onClick={onRemove}
          >
            {post.state === "DRAFT" ? "Delete draft" : "Remove post"}
          </button>
        </div>
      )}
    </article>
  );
}

function Composer({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (post: ContentPost) => void;
}) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const uploaded = useRef<ContentMedia[]>([]);
  const uploadKeys = useRef<string[]>([]);
  const draftKey = useRef<{ signature: string; key: string } | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    return () => previous?.focus();
  }, []);

  async function save() {
    if (busy || !confirmed || files.length === 0) return;
    setBusy(true);
    setError("");
    try {
      for (let i = uploaded.current.length; i < files.length; i++) {
        setProgress(`Uploading file ${i + 1} of ${files.length}…`);
        uploadKeys.current[i] ??= crypto.randomUUID();
        const { media } = await contentApi.upload(
          files[i],
          uploadKeys.current[i]
        );
        uploaded.current.push(media);
      }
      setProgress("Saving draft…");
      const mediaIds = uploaded.current.map((media) => media.id);
      const signature = JSON.stringify({ body, mediaIds });
      if (draftKey.current?.signature !== signature) {
        draftKey.current = { signature, key: crypto.randomUUID() };
      }
      const { post } = await contentApi.createDraft(
        body,
        mediaIds,
        draftKey.current.key
      );
      onSaved(post);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <div className="member-create-overlay fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={panel}
        className="member-create-frame w-full max-w-lg rounded-[28px] bg-pink-200 p-[2px] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-composer-title"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) onClose();
          if (event.key !== "Tab") return;
          const controls = panel.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled), input:not(:disabled), textarea:not(:disabled)"
          );
          if (!controls?.length) {
            event.preventDefault();
            return;
          }
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        <div className="member-glass-modal-panel member-post-editor-panel max-h-[85vh] overflow-y-auto rounded-[26px] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="content-composer-title"
              className="member-composer-title font-semibold text-[#241a22]"
            >
              Create Post
            </h2>
            <button
              ref={closeButton}
              type="button"
              className={secondaryClass}
              disabled={busy}
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <p className="mb-4 text-xs text-[#8c6d7f]">
            Local test content · safe sample media only
          </p>
          <label className="block text-sm font-medium text-[#4a3340]">
            Caption
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={2000}
              disabled={busy}
              rows={4}
              className="mt-2 w-full resize-y rounded-xl border border-pink-200 bg-white p-3 text-sm text-[#4a3340]"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-[#4a3340]">
            Photos or videos
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,video/mp4"
              disabled={busy}
              className="mt-2 block w-full text-sm"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []);
                uploaded.current = [];
                uploadKeys.current = [];
                draftKey.current = null;
                setFiles([]);
                if (
                  selected.length > 4 ||
                  selected.some(
                    (file) =>
                      !allowedTypes.has(file.type) ||
                      file.size === 0 ||
                      file.size > maxFileBytes
                  )
                ) {
                  setError(
                    "Choose up to 4 PNG, JPEG or MP4 files, each no larger than 20 MiB and not empty."
                  );
                  event.target.value = "";
                  return;
                }
                setError("");
                setFiles(selected);
              }}
            />
          </label>
          <p className="mt-2 text-xs text-[#8c6d7f]">
            Up to 4 files · PNG, JPEG or MP4 · 20 MiB per file
          </p>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-[#8c6d7f]">
              {files.map((file, index) => (
                <li key={`${index}-${file.name}`}>{file.name}</li>
              ))}
            </ul>
          )}
          <label className="member-composer-confirmation mt-4 flex items-start gap-2 rounded-xl border border-pink-100 p-3 text-xs text-[#8c6d7f]">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              disabled={busy}
            />
            I own or have permission to use these safe sample files. They
            contain no nudity, identity documents or private information.
          </label>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {progress && (
            <p role="status" className="mt-3 text-sm text-[#8c6d7f]">
              {progress}
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className={buttonClass}
              disabled={busy || !confirmed || !files.length}
              onClick={save}
            >
              Save draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentHome(props: HomeProps) {
  const auth = useOptionalAuth() as { user?: User } | null;
  return (
    <ContentSession
      key={auth?.user?.id ?? "anonymous"}
      {...props}
      user={auth?.user}
    />
  );
}

function ContentSession({
  user,
  userStatus = "online",
  onStatusChange,
}: HomeProps & { user?: User }) {
  const isCreator = user?.role === "CREATOR" && user.emailVerified;
  const [showCompose, setShowCompose] = useState(false);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [mine, setMine] = useState<ContentPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [mineError, setMineError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const alive = useRef(true);
  const feedGeneration = useRef(0);
  const mineGeneration = useRef(0);

  const loadFeed = useCallback(async () => {
    const generation = ++feedGeneration.current;
    setLoading(true);
    setFeedError("");
    try {
      const result = await contentApi.feed();
      if (!alive.current || generation !== feedGeneration.current) return;
      setPosts(result.posts);
      setCursor(result.nextCursor);
    } catch (cause) {
      if (alive.current && generation === feedGeneration.current)
        setFeedError(errorMessage(cause));
    } finally {
      if (alive.current && generation === feedGeneration.current)
        setLoading(false);
    }
  }, []);

  const loadMine = useCallback(async () => {
    if (!isCreator) return;
    const generation = ++mineGeneration.current;
    setMineError("");
    try {
      const result = await contentApi.mine();
      if (alive.current && generation === mineGeneration.current)
        setMine(result.posts.filter((post) => post.state !== "REMOVED"));
    } catch (cause) {
      if (alive.current && generation === mineGeneration.current)
        setMineError(errorMessage(cause));
    }
  }, [isCreator]);

  useEffect(() => {
    alive.current = true;
    void loadFeed();
    void loadMine();
    return () => {
      alive.current = false;
    };
  }, [loadFeed, loadMine]);

  async function mutate(post: ContentPost, action: "publish" | "remove") {
    if (busyId) return;
    setBusyId(post.id);
    ++mineGeneration.current;
    setActionError("");
    setNotice("");
    try {
      if (action === "publish") {
        const result = await contentApi.publish(post.id);
        setMine((current) =>
          current.map((item) => (item.id === post.id ? result.post : item))
        );
        setNotice("Post published.");
      } else {
        await contentApi.remove(post.id);
        setMine((current) => current.filter((item) => item.id !== post.id));
        setPosts((current) => current.filter((item) => item.id !== post.id));
        setNotice(post.state === "DRAFT" ? "Draft deleted." : "Post removed.");
      }
      await loadFeed();
    } catch (cause) {
      setActionError(errorMessage(cause));
    } finally {
      setBusyId(null);
    }
  }

  async function loadMore() {
    if (!cursor || loadingMore) return;
    const generation = feedGeneration.current;
    setLoadingMore(true);
    setFeedError("");
    try {
      const result = await contentApi.feed(cursor);
      if (!alive.current || generation !== feedGeneration.current) return;
      setPosts((current) => [
        ...current,
        ...result.posts.filter(
          (post) => !current.some((item) => item.id === post.id)
        ),
      ]);
      setCursor(result.nextCursor);
    } catch (cause) {
      if (alive.current) setFeedError(errorMessage(cause));
    } finally {
      if (alive.current) setLoadingMore(false);
    }
  }

  return (
    <MemberLayout
      activePage="home"
      userStatus={userStatus}
      onStatusChange={onStatusChange}
      onComposePost={isCreator ? () => setShowCompose(true) : null}
      onComposeMoment={null}
    >
      <main className="member-glass-main min-h-[calc(100vh-4rem)] flex-1 overflow-hidden px-4 py-6 pb-24 lg:pb-6">
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-[#241a22]">Home</h1>
              <p className="text-xs text-[#8c6d7f]">
                Local test content · safe sample media only
              </p>
            </div>
            <button
              type="button"
              className={secondaryClass}
              disabled={loading}
              onClick={() => {
                void loadFeed();
                void loadMine();
              }}
            >
              Refresh
            </button>
          </div>
          {notice && (
            <p role="status" className="text-sm text-[#8c6d7f]">
              {notice}
            </p>
          )}
          {actionError && (
            <p role="alert" className="text-sm text-red-700">
              {actionError}
            </p>
          )}
          {isCreator && (
            <section aria-labelledby="your-posts-title" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="your-posts-title"
                  className="font-semibold text-[#241a22]"
                >
                  Your posts and drafts
                </h2>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => setShowCompose(true)}
                >
                  Create Post
                </button>
              </div>
              {mineError && (
                <div role="alert" className="text-sm text-red-700">
                  <p>{mineError}</p>
                  <button
                    type="button"
                    className={secondaryClass}
                    onClick={loadMine}
                  >
                    Retry your posts
                  </button>
                </div>
              )}
              {!mineError && mine.length === 0 && (
                <p className="text-sm text-[#8c6d7f]">
                  Your saved drafts will appear here. Publish when you are ready
                  to share with test members.
                </p>
              )}
              {mine.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  owner
                  busy={busyId !== null}
                  onPublish={() => void mutate(post, "publish")}
                  onRemove={() => void mutate(post, "remove")}
                />
              ))}
            </section>
          )}
          <section
            aria-labelledby="published-posts-title"
            className="space-y-5"
          >
            <h2
              id="published-posts-title"
              className="border-b border-pink-100 pb-3 font-semibold text-[#241a22]"
            >
              Published posts
            </h2>
            {loading && (
              <p role="status" className="text-sm text-[#8c6d7f]">
                Loading posts…
              </p>
            )}
            {feedError && (
              <div role="alert" className="text-sm text-red-700">
                <p>{feedError}</p>
                <button
                  type="button"
                  className={secondaryClass}
                  onClick={loadFeed}
                >
                  Retry feed
                </button>
              </div>
            )}
            {!loading && !feedError && posts.length === 0 && (
              <p className="text-sm text-[#8c6d7f]">No published posts yet.</p>
            )}
            {!loading &&
              posts.map((post) => <PostCard key={post.id} post={post} />)}
            {!loading && cursor && (
              <button
                type="button"
                className={secondaryClass}
                disabled={loadingMore}
                onClick={loadMore}
              >
                {loadingMore ? "Loading more…" : "Load more posts"}
              </button>
            )}
          </section>
        </div>
      </main>
      {showCompose && isCreator && (
        <Composer
          onClose={() => setShowCompose(false)}
          onSaved={(post) => {
            ++mineGeneration.current;
            setMine((current) => [post, ...current]);
            setShowCompose(false);
            setNotice("Draft saved. Only you can see it until you publish.");
          }}
        />
      )}
    </MemberLayout>
  );
}
