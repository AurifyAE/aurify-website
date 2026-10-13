import { ExtrudeGeometry, Shape } from "three";

/**
 * A w × h × d (x × y × z) slab with rounded plan-view corners (radius r) and
 * bevelled edges, sitting on y = 0 and centred in x / z. Every laptop part
 * is one of these.
 */
export function roundedSlab(w: number, h: number, d: number, r: number, bevel: number, segments = 3) {
  // The bevel grows the shape outward, so draw it inset by the bevel
  const iw = w / 2 - bevel;
  const id = d / 2 - bevel;
  const ir = Math.max(r - bevel, 0.0001);
  const s = new Shape();
  s.moveTo(-iw + ir, -id);
  s.lineTo(iw - ir, -id);
  s.quadraticCurveTo(iw, -id, iw, -id + ir);
  s.lineTo(iw, id - ir);
  s.quadraticCurveTo(iw, id, iw - ir, id);
  s.lineTo(-iw + ir, id);
  s.quadraticCurveTo(-iw, id, -iw, id - ir);
  s.lineTo(-iw, -id + ir);
  s.quadraticCurveTo(-iw, -id, -iw + ir, -id);
  const g = new ExtrudeGeometry(s, {
    depth: Math.max(h - 2 * bevel, 0.00001),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segments,
    curveSegments: 8,
  });
  g.rotateX(-Math.PI / 2); // extrude along +Y instead of +Z
  g.translate(0, bevel, 0);
  return g;
}
