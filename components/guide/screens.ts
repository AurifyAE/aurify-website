import { lifecycle } from "@/lib/content/home";

// Next's image optimiser serves a ~1080px webp instead of the 2 MB originals.
const optimised = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;

const stages = lifecycle.stages.map((s) => s.image);

/** Named indexes into SCREENS (= Pose.screen values). */
export const SCREEN = {
  overview: 0,
  firstStage: 1,
  fragmented: stages.length + 1,
  unified: stages.length + 2,
} as const;

// shortcut: overview / fragmented / unified reuse home photos until real
// 1600×1000 product screenshots land in public/images/guide/.
export const SCREENS = [
  "/images/home/Bullion_trading_desk_with_monitors.jpeg",
  ...stages,
  "/images/home/Abstract_finance_scene_with_tablet.jpeg",
  "/images/home/Abstract_corporate_finance_scene.jpeg",
].map(optimised);
