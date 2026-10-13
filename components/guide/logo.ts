import { Matrix4, Mesh, MeshPhysicalMaterial, ShapeGeometry } from "three";
import { SVGLoader, type SVGResult } from "three/addons/loaders/SVGLoader.js";
import { DIM } from "./model";

export const LOGO_URL = "/logo/aurify-logo.svg";
const LOGO_WIDTH = 0.11; // metres across the lid

/** The Aurify wordmark as a polished inlay on the lid's outer face. */
export function buildLogo(svg: SVGResult): Mesh {
  const shapes = svg.paths
    // the file's mask / clip rectangles are paths too - keep only the artwork
    .filter((p) => !(p.userData?.node as Element | undefined)?.closest("mask, clipPath, defs"))
    .flatMap((p) => SVGLoader.createShapes(p));
  const geo = new ShapeGeometry(shapes);
  geo.computeBoundingBox();
  const { min, max } = geo.boundingBox!;
  const s = LOGO_WIDTH / (max.x - min.x);
  const cx = (min.x + max.x) / 2;
  const cy = (min.y + max.y) / 2;

  // SVG (x right, y down) → lid outer face (lid-local +Y), centred. Seen from
  // behind the open laptop, lid +X is the viewer's left and lid +Z is up.
  geo.applyMatrix4(
    new Matrix4().set(
      -s, 0, 0, s * cx,
      0, 0, 0, DIM.lidH + 0.00005,
      0, -s, 0, s * cy + DIM.d / 2,
      0, 0, 0, 1
    )
  );
  // That mapping mirrors the triangles; restore their winding, then rebuild normals
  const idx = geo.index!;
  for (let i = 0; i < idx.count; i += 3) {
    const b = idx.getX(i + 1);
    idx.setX(i + 1, idx.getX(i + 2));
    idx.setX(i + 2, b);
  }
  geo.computeVertexNormals();

  const logo = new Mesh(geo, new MeshPhysicalMaterial({ color: 0x9a9da3, metalness: 1, roughness: 0.12 }));
  logo.name = "Logo";
  return logo;
}
