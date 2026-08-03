import type { Metadata } from "next";
import { JournalMagazine } from "@/components/blog/JournalMagazine";
import { getPublishedPosts } from "@/lib/blog";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Guides, collecting notes, and stories from COSY AURA THE WATCH JOURNAL.",
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return <JournalMagazine posts={posts} />;
}
