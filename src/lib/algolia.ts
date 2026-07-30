import { liteClient as algoliasearch } from "algoliasearch/lite";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || "";

export const searchClient =
  appId && searchKey ? algoliasearch(appId, searchKey) : null;

export const WATCHES_INDEX = "watches";

export interface AlgoliaWatch {
  objectID: string;
  slug: string;
  brand: string;
  brandSlug: string;
  model: string;
  reference: string;
  description: string;
  price: number;
  condition: string;
  movement: string;
  caseMaterial: string;
  strapMaterial: string;
  year: number | null;
  gender: string;
  image: string;
  featured: boolean;
  category: string | null;
  createdAt: number;
}
