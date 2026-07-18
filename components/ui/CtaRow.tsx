import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

interface CtaRowProps {
  line: string;
  label: string;
  href: string;
}

/**
 * Quiet closing CTA row for interior pages.
 */
export default function CtaRow({ line, label, href }: CtaRowProps) {
  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <Reveal className="flex flex-col items-start gap-6 border-t border-ink/10 pt-12 md:flex-row md:items-center md:justify-between">
        <p className="text-title-sm text-navy">{line}</p>
        <Button href={href}>{label}</Button>
      </Reveal>
    </section>
  );
}
