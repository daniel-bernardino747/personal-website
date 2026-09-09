/** @type {import('next').NextConfig} */
const nextConfig = {
  // The site runs as a server now (ADR-0007). `standalone` emits a self-contained
  // server under `.next/standalone`, which is the only thing the image copies —
  // the build happens here, where the Corpus lives, and `content/` never travels.
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
