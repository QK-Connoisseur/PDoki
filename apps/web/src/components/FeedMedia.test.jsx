import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import FeedMedia from "./FeedMedia";
import { feedPosts, fypPosts } from "../fixtures/homeFeed";

/* ─── Mocks ──────────────────────────────────────────────────────────── */

let observers;

class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = new Set();
    observers.push(this);
  }
  observe(el) {
    this.elements.add(el);
  }
  unobserve(el) {
    this.elements.delete(el);
  }
  disconnect() {
    this.elements.clear();
  }
  intersect(el, { isIntersecting, intersectionRatio }) {
    this.callback([{ target: el, isIntersecting, intersectionRatio }], this);
  }
}

let playMock;
let pauseMock;

beforeEach(() => {
  observers = [];
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  playMock = vi
    .spyOn(window.HTMLMediaElement.prototype, "play")
    .mockImplementation(function play() {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
  pauseMock = vi
    .spyOn(window.HTMLMediaElement.prototype, "pause")
    .mockImplementation(function pause() {
      this.dispatchEvent(new Event("pause"));
    });
});

afterEach(() => {
  // Unmount while the media mocks are still installed; otherwise the unmount
  // cleanup hits jsdom's unimplemented pause() and logs warnings.
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/* ─── Fixtures ───────────────────────────────────────────────────────── */

const publicVideoPost = {
  id: 900,
  creator: "Luna Bloom",
  mediaType: "video",
  videoSrc: "https://demo.example/public-clip.mp4",
  poster: "https://demo.example/poster.jpg",
  aspectRatio: "16/9",
  locked: false,
};

const ppvVideoPost = {
  id: 901,
  creator: "Mika Rose",
  mediaType: "video",
  poster: "https://demo.example/safe-poster.jpg",
  image: "https://demo.example/safe-poster.jpg",
  aspectRatio: "16/9",
  locked: true,
  price: 10,
};

const imagePost = {
  id: 902,
  creator: "Airi Vale",
  image: "https://demo.example/photo.jpg",
  aspectRatio: "4/3",
  locked: false,
};

const primary = { isIntersecting: true, intersectionRatio: 0.9 };
const gone = { isIntersecting: false, intersectionRatio: 0 };

function renderVideo(post = publicVideoPost, props = {}) {
  const utils = render(<FeedMedia post={post} locked={false} {...props} />);
  return { ...utils, video: utils.container.querySelector("video") };
}

/* ─── Public video autoplay ──────────────────────────────────────────── */

describe("FeedMedia public video", () => {
  it("renders a muted, looped, inline video", () => {
    const { video } = renderVideo();
    expect(video).not.toBeNull();
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("playsinline");
  });

  it("autoplays when it becomes the primary visible post", () => {
    const { video } = renderVideo();
    act(() => observers[0].intersect(video, primary));
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it("pauses when it leaves the viewport", () => {
    const { video } = renderVideo();
    act(() => observers[0].intersect(video, primary));
    act(() => observers[0].intersect(video, gone));
    expect(pauseMock).toHaveBeenCalled();
  });

  it("only lets one feed video play at a time", () => {
    const first = renderVideo();
    const second = renderVideo({ ...publicVideoPost, id: 903 });
    act(() => observers[0].intersect(first.video, primary));
    act(() => observers[1].intersect(second.video, primary));
    // Claiming playback for the second video pauses the first one.
    expect(pauseMock.mock.instances).toContain(first.video);
  });

  it("toggles play/pause on click and respects a manual pause while visible", () => {
    const { video } = renderVideo();
    act(() => observers[0].intersect(video, primary));
    expect(playMock).toHaveBeenCalledTimes(1);

    fireEvent.click(video);
    expect(pauseMock).toHaveBeenCalled();

    // Still visible: intersection updates must not restart a manually paused video.
    act(() => observers[0].intersect(video, primary));
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it("pauses when the tab becomes hidden", () => {
    const { video } = renderVideo();
    act(() => observers[0].intersect(video, primary));
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    fireEvent(document, new Event("visibilitychange"));
    expect(pauseMock).toHaveBeenCalled();
    delete document.hidden;
  });

  it("pauses on unmount", () => {
    const { video, unmount } = renderVideo();
    act(() => observers[0].intersect(video, primary));
    unmount();
    expect(pauseMock.mock.instances).toContain(video);
  });

  it("exposes accessible play/pause and mute/unmute controls and an expand action", () => {
    const onExpand = vi.fn();
    renderVideo(publicVideoPost, { onExpand });
    expect(
      screen.getByRole("button", { name: /play video/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /unmute video/i })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /expand video/i }));
    expect(onExpand).toHaveBeenCalledOnce();
  });

  it("survives a rejected play() promise without unhandled errors", async () => {
    playMock.mockImplementation(function rejectedPlay() {
      return Promise.reject(new Error("NotAllowedError"));
    });
    const { video } = renderVideo();
    act(() => observers[0].intersect(video, primary));
    // Flush the rejection; an uncaught rejection would fail the test run.
    await act(async () => {});
    expect(
      screen.getByRole("button", { name: /play video/i })
    ).toBeInTheDocument();
  });

  it("does not autoplay when prefers-reduced-motion is set, showing a play control instead", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    const { video } = renderVideo();
    expect(observers).toHaveLength(0);
    expect(video).toHaveAttribute("preload", "none");
    expect(playMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /play video/i })
    ).toBeInTheDocument();
  });

  it("does not autoplay when the browser requests reduced data usage", () => {
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true },
      configurable: true,
    });
    renderVideo();
    expect(observers).toHaveLength(0);
    expect(playMock).not.toHaveBeenCalled();
    delete navigator.connection;
  });

  it("does not autoplay explicitly hidden content", () => {
    renderVideo(publicVideoPost, { allowAutoplay: false });
    expect(observers).toHaveLength(0);
    expect(playMock).not.toHaveBeenCalled();
  });
});

/* ─── PPV / locked videos ────────────────────────────────────────────── */

describe("FeedMedia locked video", () => {
  it("renders only a safe poster with no video element while locked", () => {
    const { container } = render(<FeedMedia post={ppvVideoPost} locked />);
    expect(container.querySelector("video")).toBeNull();
    expect(playMock).not.toHaveBeenCalled();
  });

  it("never autoplays or mounts a video even after a simulated unlock", () => {
    const { container } = render(
      <FeedMedia post={ppvVideoPost} locked={false} />
    );
    expect(container.querySelector("video")).toBeNull();
    expect(observers).toHaveLength(0);
    expect(playMock).not.toHaveBeenCalled();
  });

  it("never renders a protected source in markup, even if one leaks into the data", () => {
    const leaked = {
      ...ppvVideoPost,
      videoSrc: "https://protected.example/secret-full-video.mp4",
    };
    const lockedRender = render(<FeedMedia post={leaked} locked />);
    expect(lockedRender.container.innerHTML).not.toContain("secret-full-video");
    lockedRender.unmount();

    const unlockedRender = render(<FeedMedia post={leaked} locked={false} />);
    expect(unlockedRender.container.innerHTML).not.toContain(
      "secret-full-video"
    );
  });

  it("home feed fixtures keep protected sources out of locked posts", () => {
    [...feedPosts, ...fypPosts]
      .filter((p) => p.locked)
      .forEach((p) => {
        expect(p.videoSrc).toBeUndefined();
      });
  });
});

/* ─── Image posts ────────────────────────────────────────────────────── */

describe("FeedMedia image post", () => {
  it("renders the image and opens the lightbox on click", () => {
    const onExpand = vi.fn();
    render(<FeedMedia post={imagePost} locked={false} onExpand={onExpand} />);
    const img = screen.getByAltText("Post by Airi Vale");
    expect(img).toHaveAttribute("src", imagePost.image);
    fireEvent.click(screen.getByRole("button", { name: /view media/i }));
    expect(onExpand).toHaveBeenCalledOnce();
  });

  it("renders a blurred image without lightbox access when locked", () => {
    const { container } = render(
      <FeedMedia post={{ ...imagePost, locked: true, price: 5 }} locked />
    );
    expect(screen.getByAltText("Post by Airi Vale")).toBeInTheDocument();
    expect(container.querySelector("button")).toBeNull();
  });
});
