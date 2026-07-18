import { whoWeServe } from "@/lib/content/home";
import SectionHeading from "@/components/ui/SectionHeading";
import Marquee from "@/components/ui/Marquee";

/**
 * §8 — Who We Serve. Two counter-scrolling marquee rows of audience chips,
 * pausing on hover. Marquee itself is pure CSS — this section stays a
 * server component apart from the client SectionHeading.
 */
export default function WhoWeServe() {
  const [rowOne, rowTwo] = whoWeServe.rows;

  return (
    <section className="py-section">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <SectionHeading
          align="center"
          eyebrow={whoWeServe.eyebrow}
          title={whoWeServe.title}
          body={whoWeServe.body}
        />
      </div>
      <div className="mt-14 space-y-4">
        <Marquee items={rowOne} direction="left" duration={48} />
        <Marquee items={rowTwo} direction="right" duration={42} />
      </div>
    </section>
  );
}
