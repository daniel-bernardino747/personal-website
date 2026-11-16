/** @type {import('next').NextConfig} */
const nextConfig = {
  // The site runs as a server now (ADR-0007). `standalone` emits a self-contained
  // server under `.next/standalone`, which is the only thing the image copies —
  // the build happens here, where the Corpus lives, and `content/` never travels.
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // One address of our own for booking, so the Google Business Profile, cards
  // and social bios never point at a third party directly. Temporary (307), so
  // the destination can change tool without breaking any printed link.
  async redirects() {
    return [
      {
        source: '/agendar',
        destination: 'https://cal.com/daniel-bernardino-cdrdn0/tire-o-projeto-do-papel',
        permanent: false,
      },
      // Static demos live in `public/demos/<name>/`. Next does not serve a
      // folder's index.html, so the bare address points at it.
      {
        source: '/demos/db-barbearia',
        destination: '/demos/db-barbearia/index.html',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
