This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on GitHub Pages

This app builds as a static export (`output: "export"` in `next.config.ts`) and
deploys to GitHub Pages at `https://<user>.github.io/ooga-tabooga/`.

- `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
- One-time setup: in the repo's **Settings → Pages**, set **Source** to
  **GitHub Actions**.
- The site path (`/ooga-tabooga`) is set via `basePath` in `next.config.ts`
  and `lib/base-path.ts`. Change both if the repo is ever renamed.
