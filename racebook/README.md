# Next.js + Webflow Cloud

Example app for [Webflow Cloud](https://webflow.com/cloud): a Next.js + React project with OpenNext for Cloudflare and Webflow deploy tooling.

[![Deploy to Webflow](https://webflow.com/img/deploy-dark.svg)](https://webflow.com/dashboard/cloud/deploy?repo=https://github.com/Webflow-Examples/hello-world-nextjs)

## Project structure

```text
.
├── public/
│   ├── next.svg
│   └── webflow.svg
├── src/
│   └── app/
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── nextjs/
│   ├── public/
│   │   └── next.svg
│   ├── src/
│   │   └── app/
│   │       ├── favicon.ico
│   │       ├── globals.css
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── cloudflare-env.d.ts
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── open-next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   ├── webflow.json
│   └── wrangler.json
├── cloudflare-env.d.ts
├── eslint.config.mjs
├── next.config.ts
├── open-next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── webflow.json
└── wrangler.json
```

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the Next.js dev server ([http://localhost:3000](http://localhost:3000)). |
| `npm run build` | Create a production build. |
| `npm run start` | Run the production server locally (after `npm run build`). |


## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Webflow Cloud](https://webflow.com/cloud)
