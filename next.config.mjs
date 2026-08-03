/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose publishable key to the browser even if only STRIPE_PUBLISHABLE_KEY is set
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.STRIPE_PUBLISHABLE_KEY ||
      "",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "www.watchfinder.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
