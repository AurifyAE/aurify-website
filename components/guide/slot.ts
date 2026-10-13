/** A box in viewport pixels (DOMRect-like). */
export type Box = { left: number; top: number; width: number; height: number };

/**
 * Converts a DOM box into the laptop's pose units: x/y are the box centre as
 * a fraction of the viewport from its middle (y up), scale is the laptop
 * width as a fraction of viewport width (`widthFactor` × box width).
 */
export function slotFromBox(box: Box, vw: number, vh: number, widthFactor = 1) {
  return {
    x: (box.left + box.width / 2) / vw - 0.5,
    y: 0.5 - (box.top + box.height / 2) / vh,
    scale: (box.width * widthFactor) / vw,
  };
}
