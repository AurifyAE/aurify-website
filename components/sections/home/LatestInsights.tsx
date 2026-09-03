import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import Reveal from "@/components/ui/Reveal";
import { blogOrder, blogs } from "@/lib/content/blogs";

export default function LatestInsights() {
  const [featuredSlug, ...supportingSlugs] = blogOrder;
  const featured = blogs[featuredSlug];
  const supporting = supportingSlugs.map((slug) => blogs[slug]);

  return (
    <section className="bg-paper py-section" aria-labelledby="latest-insights">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <Reveal className="max-w-3xl">
          <h2 id="latest-insights" className="text-title text-navy">
            Ideas shaping the future of precious metals.
          </h2>
          <p className="mt-6 max-w-measure text-body text-ink/60">
            Practical perspectives on digital infrastructure, refinery
            operations, supply chains, and risk.
          </p>
          <Link
            href="/blogs"
            className="group mt-7 inline-flex items-center gap-2 text-sm font-medium text-blue transition-colors duration-300 hover:text-navy"
          >
            View all blogs
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
              strokeWidth={1.8}
              aria-hidden
            />
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:gap-8">
          <Reveal>
            <article className="group h-full overflow-hidden rounded-3xl bg-white ring-1 ring-inset ring-navy/10 transition-transform duration-500 ease-out-expo hover:-translate-y-1">
              <Link
                href={`/blogs/${featured.slug}`}
                className="relative block aspect-[16/10] overflow-hidden"
                aria-label={`Read ${featured.title}`}
              >
                <Image
                  src={featured.image}
                  alt={featured.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.025]"
                />
              </Link>

              <div className="p-6 sm:p-8">
                <ArticleMeta
                  category={featured.category}
                  published={featured.published}
                  publishedLabel={featured.publishedLabel}
                  readTime={featured.readTime}
                />
                <h3 className="mt-5 text-[clamp(1.5rem,2.7vw,2.25rem)] font-medium leading-[1.18] tracking-[-0.025em] text-navy">
                  <Link
                    href={`/blogs/${featured.slug}`}
                    className="transition-colors duration-300 hover:text-blue"
                  >
                    {featured.title}
                  </Link>
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/65">
                  {featured.excerpt}
                </p>
                <ArticleLink href={`/blogs/${featured.slug}`} />
              </div>
            </article>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {supporting.map((blog, index) => (
              <Reveal key={blog.slug} delay={index * 0.08}>
                <article className="group h-full overflow-hidden rounded-3xl bg-white ring-1 ring-inset ring-navy/10 transition-transform duration-500 ease-out-expo hover:-translate-y-1">
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="relative block aspect-[16/9] overflow-hidden lg:aspect-[16/7]"
                    aria-label={`Read ${blog.title}`}
                  >
                    <Image
                      src={blog.image}
                      alt={blog.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 38vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.035]"
                    />
                  </Link>

                  <div className="flex flex-col p-5 sm:p-6">
                    <ArticleMeta
                      category={blog.category}
                      published={blog.published}
                      publishedLabel={blog.publishedLabel}
                      readTime={blog.readTime}
                      compact
                    />
                    <h3 className="mt-4 text-[1.125rem] font-medium leading-[1.35] tracking-[-0.01em] text-navy">
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="transition-colors duration-300 hover:text-blue"
                      >
                        {blog.title}
                      </Link>
                    </h3>
                    <ArticleLink href={`/blogs/${blog.slug}`} className="mt-5" />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticleMeta({
  category,
  published,
  publishedLabel,
  readTime,
  compact = false,
}: {
  category: string;
  published: string;
  publishedLabel: string;
  readTime: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-ink/55 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <span className="font-medium text-blue">{category}</span>
      <time dateTime={published}>{publishedLabel}</time>
      <span className="inline-flex items-center gap-1.5">
        <HugeiconsIcon
          icon={Clock01Icon}
          className="h-4 w-4"
          strokeWidth={1.7}
          aria-hidden
        />
        {readTime}
      </span>
    </div>
  );
}

function ArticleLink({
  href,
  className = "mt-6",
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group/link inline-flex w-fit items-center gap-2 text-sm font-medium text-blue transition-colors duration-300 hover:text-navy ${className}`}
    >
      Read article
      <HugeiconsIcon
        icon={ArrowRight02Icon}
        className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover/link:translate-x-1"
        strokeWidth={1.8}
        aria-hidden
      />
    </Link>
  );
}
