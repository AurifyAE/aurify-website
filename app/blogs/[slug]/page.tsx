import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import Reveal from "@/components/ui/Reveal";
import {
  blogOrder,
  blogs,
  type BlogBlock,
  type BlogSlug,
} from "@/lib/content/blogs";
import { site } from "@/lib/content/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogOrder.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = blogs[slug as BlogSlug];
  if (!blog) return {};

  return {
    title: blog.title,
    description: blog.excerpt,
    authors: [{ name: blog.author }],
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.excerpt,
      publishedTime: blog.published,
      authors: [blog.author],
      images: [{ url: blog.image, alt: blog.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [blog.image],
    },
  };
}

function BlogContent({ blocks }: { blocks: readonly BlogBlock[] }) {
  return blocks.map((block, index) => {
    if (block.type === "heading") {
      return (
        <h2
          id={block.id}
          key={block.id}
          className="scroll-mt-28 pt-16 text-[clamp(1.8rem,3.3vw,2.7rem)] font-medium leading-[1.16] tracking-[-0.02em] text-navy first:pt-0"
        >
          {block.text}
        </h2>
      );
    }

    if (block.type === "list") {
      return (
        <ul
          key={`list-${index}`}
          className="mt-7 space-y-4 pl-6 text-[1.0625rem] leading-[1.85] text-ink/75 marker:text-blue md:text-[1.125rem]"
        >
          {block.items.map((item) => (
            <li key={item} className="pl-2">
              {item}
            </li>
          ))}
        </ul>
      );
    }

    if (block.type === "leadParagraph") {
      return (
        <p
          key={`lead-${index}`}
          className="mt-7 text-[1.0625rem] leading-[1.9] text-ink/75 md:text-[1.125rem]"
        >
          <strong className="font-medium text-navy">{block.lead}</strong>{" "}
          {block.text}
        </p>
      );
    }

    return (
      <p
        key={`paragraph-${index}`}
        className="mt-7 text-[1.0625rem] leading-[1.9] text-ink/75 md:text-[1.125rem]"
      >
        {block.text}
      </p>
    );
  });
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const blog = blogs[slug as BlogSlug];
  if (!blog) notFound();

  const headings = blog.blocks.filter(
    (block): block is Extract<BlogBlock, { type: "heading" }> =>
      block.type === "heading"
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt,
    image: `${site.url}${blog.image}`,
    datePublished: blog.published,
    dateModified: blog.published,
    author: { "@type": "Organization", name: blog.author },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: `${site.url}/blogs/${blog.slug}`,
  };

  return (
    <div className="bg-white pb-section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <header className="bg-mist/45 pt-24">
        <div className="mx-auto max-w-wide px-6 pb-14 md:px-10 md:pb-20">
          <Reveal>
            <Link
              href="/blogs"
              className="group inline-flex items-center gap-2 text-sm font-medium text-blue transition-colors duration-300 hover:text-navy"
            >
              <HugeiconsIcon
                icon={ArrowLeft02Icon}
                className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:-translate-x-1"
                strokeWidth={1.8}
                aria-hidden
              />
              All blogs
            </Link>

            <h1 className="mt-8 max-w-6xl text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[1.06] tracking-[-0.035em] text-navy">
              {blog.title}
            </h1>
            <p className="mt-7 max-w-3xl text-body text-ink/65">
              {blog.excerpt}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink/55">
              <span className="font-medium text-blue">{blog.category}</span>
              <span>{blog.author}</span>
              <time dateTime={blog.published}>{blog.publishedLabel}</time>
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
          </Reveal>

          <Reveal className="relative mt-12 aspect-[16/9] overflow-hidden rounded-3xl ring-1 ring-inset ring-navy/10 md:mt-16">
            <Image
              src={blog.image}
              alt={blog.imageAlt}
              fill
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </header>

      <main className="mx-auto grid max-w-wide gap-14 px-6 pt-16 md:px-10 md:pt-24 lg:grid-cols-[15rem_minmax(0,46rem)] lg:justify-center lg:gap-20">
        <aside className="hidden lg:block">
          <nav className="sticky top-28" aria-label="Article contents">
            <p className="text-sm font-medium text-navy">In this article</p>
            <ol className="mt-5 space-y-3 border-l border-navy/10 pl-5">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className="text-sm leading-relaxed text-ink/50 transition-colors duration-300 hover:text-blue"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0">
          <BlogContent blocks={blog.blocks} />

          <div className="mt-20 rounded-3xl bg-mist/65 p-7 ring-1 ring-inset ring-navy/10 sm:p-10">
            <h2 className="text-title-sm text-navy">
              Building a connected precious metals operation?
            </h2>
            <p className="mt-3 max-w-xl text-body text-ink/60">
              See how Aurify connects workflows, data, compliance, and risk
              across the precious metals value chain.
            </p>
            <Link
              href="/contact"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-[0.9375rem] font-medium text-white transition-[transform,background-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-blue active:translate-y-0 active:scale-[0.98]"
            >
              Talk to our team
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                strokeWidth={1.8}
                aria-hidden
              />
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
