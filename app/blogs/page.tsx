import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import Reveal from "@/components/ui/Reveal";
import { blogOrder, blogs } from "@/lib/content/blogs";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Practical perspectives from Aurify on precious metals technology, supply chains, operations, and risk.",
  openGraph: {
    title: "Aurify Blogs",
    description:
      "Practical perspectives on building a more connected precious metals industry.",
  },
};

export default function BlogsPage() {
  const featured = blogs[blogOrder[0]];
  const remainingBlogs = blogOrder.slice(1).map((slug) => blogs[slug]);

  return (
    <div className="bg-white pb-section">
      <header className="mx-auto max-w-wide px-6 pb-14 pt-24 md:px-10 md:pb-20">
        <Reveal className="max-w-4xl">
          <h1 className="text-title text-navy">
            Ideas for a more connected precious metals industry.
          </h1>
          <p className="mt-6 max-w-2xl text-body text-ink/60">
            Practical thinking on the technology, operations, and controls
            shaping the next era of precious metals.
          </p>
        </Reveal>
      </header>

      <main className="mx-auto max-w-content px-6 md:px-10">
        <Reveal className="grid overflow-hidden rounded-3xl bg-mist/55 ring-1 ring-inset ring-navy/10 lg:grid-cols-[1fr_1.05fr]">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink/55">
              <span className="font-medium text-blue">{featured.category}</span>
              <time dateTime={featured.published}>{featured.publishedLabel}</time>
              <span className="inline-flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  className="h-4 w-4"
                  strokeWidth={1.7}
                  aria-hidden
                />
                {featured.readTime}
              </span>
            </div>
            <h2 className="mt-5 text-[clamp(1.5rem,2.8vw,2.35rem)] font-medium leading-[1.16] tracking-[-0.025em] text-navy">
              {featured.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/65">
              {featured.excerpt}
            </p>
            <Link
              href={`/blogs/${featured.slug}`}
              className="group mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-[transform,background-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-blue active:translate-y-0 active:scale-[0.98]"
            >
              Read article
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                strokeWidth={1.8}
                aria-hidden
              />
            </Link>
          </div>

          <Link
            href={`/blogs/${featured.slug}`}
            className="group relative block aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[26rem]"
            aria-label={`Read ${featured.title}`}
          >
            <Image
              src={featured.image}
              alt={featured.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 56vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.025]"
            />
          </Link>
        </Reveal>

        <section className="pt-20 md:pt-28" aria-labelledby="more-articles">
          <Reveal>
            <h2 id="more-articles" className="text-title-sm text-navy">
              More perspectives
            </h2>
          </Reveal>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {remainingBlogs.map((blog, index) => (
              <Reveal key={blog.slug} delay={index * 0.08}>
                <article className="group h-full overflow-hidden rounded-3xl bg-mist/40 ring-1 ring-inset ring-navy/10 transition-transform duration-500 ease-out-expo hover:-translate-y-1">
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="relative block aspect-[16/9] overflow-hidden"
                    aria-label={`Read ${blog.title}`}
                  >
                    <Image
                      src={blog.image}
                      alt={blog.imageAlt}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.025]"
                    />
                  </Link>

                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink/55">
                      <span className="font-medium text-blue">
                        {blog.category}
                      </span>
                      <time dateTime={blog.published}>
                        {blog.publishedLabel}
                      </time>
                      <span className="inline-flex items-center gap-1.5">
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          className="h-4 w-4"
                          strokeWidth={1.7}
                          aria-hidden
                        />
                        {blog.readTime}
                      </span>
                    </div>

                    <h3 className="mt-5 text-[clamp(1.35rem,2.2vw,1.8rem)] font-medium leading-[1.2] tracking-[-0.02em] text-navy">
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="transition-colors duration-300 hover:text-blue"
                      >
                        {blog.title}
                      </Link>
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-ink/65">
                      {blog.excerpt}
                    </p>
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue transition-colors duration-300 hover:text-navy"
                    >
                      Read article
                      <HugeiconsIcon
                        icon={ArrowRight02Icon}
                        className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                        strokeWidth={1.8}
                        aria-hidden
                      />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
