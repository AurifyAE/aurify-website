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
  const lastRefreshRef = useRef(0);
  const [mark, setMark] = useState({ top: 8, left: 8 });
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => setCanFullscreen(document.fullscreenEnabled), []);

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
    const at = video.currentTime;
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
        onError={refreshLink}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute select-none whitespace-nowrap text-xs text-white/35 transition-all duration-1000 sm:text-sm"
        style={{ top: `${mark.top}%`, left: `${mark.left}%` }}
      >
        {email}
      </span>
      {canFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-black/70"
        >
          Fullscreen
        </button>
      )}
    </div>
  );
}
