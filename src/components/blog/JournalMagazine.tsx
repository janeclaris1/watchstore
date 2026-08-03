"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@prisma/client";
import { Search } from "lucide-react";
import { formatBlogPostedOn } from "@/lib/blog";

export function JournalMagazine({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div className="bg-[#ececec] min-h-screen">
      <section className="relative bg-wf-black text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-y-0 right-0 w-full md:w-[52%]">
            <Image
              src="/images/watches/rolex/126233-2020.jpg"
              alt=""
              fill
              priority
              className="object-cover object-center opacity-90"
              sizes="(max-width: 768px) 100vw, 52vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-wf-black via-wf-black/85 to-wf-black/25 md:via-wf-black/55 md:to-transparent" />
          </div>
        </div>

        <div className="relative max-w-[1500px] mx-auto px-4 py-14 md:py-20 lg:py-24">
          <div className="max-w-xl">
            <p className="font-cantora text-5xl sm:text-6xl md:text-7xl tracking-tight leading-none">
              CA
            </p>
            <p className="mt-2 text-xs sm:text-sm uppercase tracking-[0.35em] text-white/80">
              The Watch Journal
            </p>
            <h1 className="mt-8 font-playfair text-2xl sm:text-3xl md:text-4xl text-gold leading-snug">
              Your number one watch resource.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/75 leading-relaxed max-w-md">
              Bringing you the latest guides, collecting notes, and stories from
              the world of luxury watches, curated by COSY AURA.
            </p>

            <label className="mt-8 flex items-center gap-3 max-w-sm">
              <span className="inline-flex items-center gap-1.5 text-sm text-white/90 shrink-0">
                Search
                <Search className="w-4 h-4" />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder=""
                className="flex-1 bg-transparent border border-white/70 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold"
                aria-label="Search journal"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="max-w-[1500px] mx-auto px-4 py-6 md:py-8">
        {filtered.length === 0 ? (
          <p className="text-center text-wf-gray py-16">
            No stories match your search.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 md:gap-3">
            {filtered.map((post) => (
              <JournalCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function JournalCard({ post }: { post: BlogPost }) {
  const posted = formatBlogPostedOn(post.publishedAt || post.createdAt);

  return (
    <article className="bg-white border border-black/10 flex flex-col h-full group">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        <div className="relative aspect-[5/4] bg-[#f5f5f5] overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
            />
          ) : (
            <div className="absolute inset-0 bg-wf-light" />
          )}
        </div>
        <div className="bg-[#e8e8e8] px-2 py-2 min-h-[3.25rem] flex items-start">
          <h2 className="text-[12px] md:text-[13px] font-bold text-wf-black leading-snug group-hover:text-gold transition-colors line-clamp-3">
            {post.title}
          </h2>
        </div>
        <div className="px-2 py-2 flex-1 flex flex-col">
          <p className="text-[11px] md:text-[12px] text-[#555] leading-relaxed line-clamp-3 flex-1">
            {post.excerpt}
          </p>
          {posted && (
            <p className="mt-2 text-[10px] md:text-[11px] font-semibold text-[#444]">
              Posted on {posted}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
