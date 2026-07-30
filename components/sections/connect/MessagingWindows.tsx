import { HugeiconsIcon } from "@hugeicons/react";
import { MessageCircleReplyIcon, Clock01Icon } from "@hugeicons/core-free-icons";
import Reveal from "@/components/ui/Reveal";
import { connectMessaging } from "@/lib/content/connect";

const ICONS = [MessageCircleReplyIcon, Clock01Icon];

/**
 * Free-form vs. template-only messaging windows - the explainer Meta's
 * reviewers check for WhatsApp Business API compliance.
 */
export default function MessagingWindows() {
  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <h2 className="text-eyebrow uppercase text-ink/60">{connectMessaging.eyebrow}</h2>
      <Reveal stagger className="mt-8 grid gap-6 md:grid-cols-2">
        {connectMessaging.windows.map((window, i) => (
          <div
            key={window.title}
            className="rounded-3xl bg-white p-8 ring-1 ring-inset ring-ink/10"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-mist/70 text-navy ring-1 ring-inset ring-navy/10">
              <HugeiconsIcon icon={ICONS[i]} className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </span>
            <h3 className="mt-6 text-title-sm text-navy">{window.title}</h3>
            <p className="mt-3 text-body text-ink/60">{window.text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
