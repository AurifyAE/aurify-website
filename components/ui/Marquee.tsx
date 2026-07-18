/**
 * CSS-only marquee row of pill chips. The track holds the items twice and
 * translates -50% on a linear loop; chips use right-margins (not container
 * gap) so both halves measure identically and the loop is seamless.
 *
 * Reduced motion: the global kill-switch freezes the animation; the
 * duplicate set is hidden and the row wraps into a static centered cloud.
 */

interface MarqueeProps {
  items: string[];
  direction?: "left" | "right";
  /** Seconds per loop */
  duration?: number;
}

export default function Marquee({
  items,
  direction = "left",
  duration = 40,
}: MarqueeProps) {
  return (
    <div className="marquee-mask overflow-hidden">
      <div
        className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: direction === "right" ? "reverse" : undefined,
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            aria-hidden={i >= items.length || undefined}
            className={`mb-3 mr-3 whitespace-nowrap rounded-full border border-ink/10 px-5 py-2.5 text-sm text-ink/70 ${
              i >= items.length ? "motion-reduce:hidden" : ""
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
