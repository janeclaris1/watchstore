import { prisma } from "./prisma";
import { slugify } from "./utils";

export async function getPublishedPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("[getPublishedPosts]", error);
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string) {
  try {
    return await prisma.blogPost.findFirst({
      where: { slug, published: true },
    });
  } catch (error) {
    console.error("[getPublishedPostBySlug]", error);
    return null;
  }
}

export async function getAllBlogPostsAdmin() {
  return prisma.blogPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getBlogPostById(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function ensureUniqueBlogSlug(titleOrSlug: string, excludeId?: string) {
  const base = slugify(titleOrSlug) || "post";
  let slug = base;
  let n = 2;

  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

export function formatBlogDate(date: Date | string | null | undefined) {
  if (!date) return null;
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return null;
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** DD/MM/YYYY for magazine-style journal cards */
export function formatBlogPostedOn(date: Date | string | null | undefined) {
  if (!date) return null;
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return null;
  const dd = String(value.getDate()).padStart(2, "0");
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const yyyy = value.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Pull H2 headings from markdown for an on-page table of contents. */
export function extractBlogToc(content: string): Array<{ id: string; label: string }> {
  const matches = content.matchAll(/^##\s+(.+)$/gm);
  const items: Array<{ id: string; label: string }> = [];
  for (const match of matches) {
    const label = match[1].replace(/\*\*/g, "").trim();
    if (!label) continue;
    items.push({ id: slugify(label), label });
  }
  return items;
}
