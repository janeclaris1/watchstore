import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogMarkdown } from "@/components/blog/BlogMarkdown";
import {
  formatBlogDate,
  getPublishedPostBySlug,
  getPublishedPosts,
} from "@/lib/blog";

export const revalidate = 120;

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) return { title: "Journal" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) notFound();

  const date = formatBlogDate(post.publishedAt || post.createdAt);

  return (
    <article className="bg-[#ececec]">
      <header className="bg-wf-black text-white border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
          <Link
            href="/blog"
            className="text-xs uppercase tracking-[0.25em] text-gold hover:text-gold-light"
          >
            The Watch Journal
          </Link>
          <h1 className="font-playfair text-3xl md:text-5xl text-white mt-4 mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-4">
            {post.excerpt}
          </p>
          <p className="text-sm text-white/55">
            {date}
            {post.authorName ? ` · ${post.authorName}` : ""}
          </p>
        </div>
      </header>

      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-10">
          <div className="relative aspect-[16/10] overflow-hidden bg-white border border-black/10">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <div className="bg-white border border-black/10 px-5 py-8 sm:px-8 sm:py-10">
          <BlogMarkdown content={post.content} />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/blog" className="btn-outline bg-white">
            Back to Journal
          </Link>
          <Link href="/watches" className="btn-gold">
            Browse Watches
          </Link>
        </div>
      </div>
    </article>
  );
}
