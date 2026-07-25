import { whoWeServe } from "@/lib/content/home";
import SectionHeading from "@/components/ui/SectionHeading";
import Marquee from "@/components/ui/Marquee";

/**
 * §8 - Who We Serve. Two counter-scrolling marquee rows of audience chips,
 * tilted to opposite angles so they visually cross, easing to a stop on
 * hover. This section itself stays a server component - Marquee and
 * SectionHeading are the client boundaries.
 */
export default function WhoWeServe() {
  const [rowOne, rowTwo] = whoWeServe.rows;

  return (
    <section className="overflow-hidden py-section">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <SectionHeading
          align="center"
          eyebrow={whoWeServe.eyebrow}
          title={whoWeServe.title}
          body={whoWeServe.body}
        />
      </div>
      <div className="mt-20 space-y-2 md:mt-24">
        <div className="">
          <Marquee items={rowOne} direction="left" duration={64} />
        </div>
        <div className="-mt-4  md:-mt-6">
          <Marquee items={rowTwo} direction="right" duration={64} />
        </div>
      </div>
    </section>
  );
}
