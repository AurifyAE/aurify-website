/**
 * Slow-drifting blurred gradient mesh — pure CSS, three composited blobs.
 * Sits behind hero and closing-CTA content; reduced motion freezes the
 * drift via the global animation kill-switch in globals.css.
 */

interface GradientMeshProps {
  /** "light" for white hero, "dark" for navy closing moment */
  variant?: "light" | "dark";
  className?: string;
}

const opacities: Record<"light" | "dark", [string, string, string]> = {
  light: ["opacity-[0.10]", "opacity-[0.12]", "opacity-[0.10]"],
  dark: ["opacity-[0.25]", "opacity-[0.18]", "opacity-[0.15]"],
};

export default function GradientMesh({
  variant = "light",
  className = "",
}: GradientMeshProps) {
  const [a, b, c] = opacities[variant];
  const blob =
    "absolute rounded-full blur-[120px] will-change-transform";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className={`${blob} ${a} animate-mesh-a -left-[10%] -top-[15%] h-[55vmax] w-[55vmax] ${
          variant === "light" ? "bg-navy" : "bg-blue"
        }`}
      />
      <div
        className={`${blob} ${b} animate-mesh-b -right-[12%] top-[10%] h-[45vmax] w-[45vmax] bg-sky`}
      />
      <div
        className={`${blob} ${c} animate-mesh-c -bottom-[20%] left-[25%] h-[50vmax] w-[50vmax] bg-teal`}
      />
    </div>
  );
}
