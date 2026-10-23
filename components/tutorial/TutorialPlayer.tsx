"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Plays the signed R2 link with a moving email watermark. Fullscreen goes on
 * the container, never the <video>, so the watermark stays on screen. When the
 * signed link expires mid-video, a fresh one is fetched and playback resumes.
 */
export default function TutorialPlayer({ src, email }: { src: string; email: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playingRef = useRef(false);
  const lastTimeRef = useRef(0);
  const lastRefreshRef = useRef(0);
  const [mark, setMark] = useState({ top: 8, left: 8 });
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => setCanFullscreen(document.fullscreenEnabled), []);

  // controlsList="nofullscreen" is Chromium-only. Safari, iOS and Firefox still
  // offer native fullscreen on the bare <video>, which hides the watermark: undo it.
  useEffect(() => {
    const video = videoRef.current as
      | (HTMLVideoElement & { webkitExitFullscreen?: () => void })
      | null;
    if (!video) return;
    const exitWebkit = () => video.webkitExitFullscreen?.();
    const exitStandard = () => {
      if (document.fullscreenElement === video) document.exitFullscreen().catch(() => {});
    };
    video.addEventListener("webkitbeginfullscreen", exitWebkit);
    document.addEventListener("fullscreenchange", exitStandard);
    return () => {
      video.removeEventListener("webkitbeginfullscreen", exitWebkit);
      document.removeEventListener("fullscreenchange", exitStandard);
    };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const move = () => {
      // Left stays under 55% so a long email never runs off the right edge.
      setMark({ top: 5 + Math.random() * 80, left: 5 + Math.random() * 50 });
      timer = setTimeout(move, 30_000 + Math.random() * 30_000);
    };
    move();
    return () => clearTimeout(timer);
  }, []);

  async function refreshLink() {
    const video = videoRef.current;
    if (!video || Date.now() - lastRefreshRef.current < 10_000) return;
    lastRefreshRef.current = Date.now();
    // A failed load can reset currentTime to 0; fall back to the last played position.
    const at = video.currentTime || lastTimeRef.current;
    const resume = playingRef.current;

    const res = await fetch("/api/tutorial/video-link", { cache: "no-store" });
    if (res.status === 401) {
      const { reason } = await res.json().catch(() => ({ reason: "" }));
      window.location.href = reason === "expired" ? "/login?expired=1" : "/login";
      return;
    }
    if (!res.ok) return;
    const { url } = await res.json();
    video.addEventListener(
      "loadedmetadata",
      () => {
        video.currentTime = at;
        if (resume) video.play().catch(() => {});
      },
      { once: true }
    );
    video.src = url;
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else boxRef.current?.requestFullscreen();
  }

  return (
    <div ref={boxRef} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        src={src}
        controls
        controlsList="nodownload noremoteplayback nofullscreen"
        disablePictureInPicture
        playsInline
        preload="metadata"
        className="block h-full w-full object-contain"
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={(e) => {
          // Chrome's double-click would fullscreen the bare <video>, hiding the watermark.
          e.preventDefault();
          if (canFullscreen) toggleFullscreen();
        }}
        onPlay={() => (playingRef.current = true)}
        onPause={() => (playingRef.current = false)}
        onTimeUpdate={(e) => {
          // readyState 0 means a reload just reset the clock; keep the real position.
          if (e.currentTarget.readyState > 0) lastTimeRef.current = e.currentTarget.currentTime;
        }}
        onError={refreshLink}
      />
      <span
        aria-hidden="true"
        // Dark halo keeps the email readable over the white app screens in the video.
        className="pointer-events-none absolute select-none whitespace-nowrap text-sm font-medium text-white/80 transition-all duration-1000 [text-shadow:0_0_3px_rgba(0,0,0,0.9),0_1px_2px_rgba(0,0,0,0.9)] sm:text-base"
        style={{ top: `${mark.top}%`, left: `${mark.left}%` }}
      >
        {email}
      </span>
      {canFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute right-3 top-3 rounded-full bg-navy/90 px-3 py-1.5 text-xs text-white ring-1 ring-white/30 hover:bg-navy"
        >
          Fullscreen
        </button>
      )}
    </div>
  );
}
