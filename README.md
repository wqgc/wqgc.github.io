# Portfolio Site

This is my portfolio website. It includes a static site and a small arcade-style game under the `ts/game` folder.

## Prerequisites

- Node.js and npm installed

## Local setup

1. Open a terminal in the project root.
2. Install dependencies:

```bash
npm install
```

3. Build the TypeScript bundle:

```bash
npm run build
```

This uses esbuild to bundle `ts/index.ts` into `script.js`.

## Previewing the site

The site is intended to be previewed as a static page. You can either:

- open `index.html` directly in a browser, or
- serve the folder locally with a simple static server, for example:

```bash
npx serve .
```
