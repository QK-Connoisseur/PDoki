# Pumdoki Home/Login Page

This package contains the current final React/Vite version of the Pumdoki home/login page.

## What is included

- React + Vite project
- Tailwind CSS already wired into Vite
- The current page exactly as packaged in `src/App.jsx`
- One README only

## Important note about exact visual matching

This project is designed to reproduce the same layout, spacing, colors, animations, and interactions you approved. Minor differences can still happen across browsers and operating systems because of font rendering, GPU acceleration, browser zoom, and image CDN delivery.

For the closest match:

- Use Chrome or Edge
- Keep browser zoom at 100%
- Use a normal desktop viewport first

## Requirements

Vite currently requires Node.js 20.19+ or 22.12+. citeturn0search0

## Tailwind setup in this package

This project already includes Tailwind configured the modern Vite-plugin way:

- `tailwindcss`
- `@tailwindcss/vite`
- `vite.config.js` includes the Tailwind plugin
- `src/index.css` includes `@import "tailwindcss";`

That means you do **not** need to separately run the older Tailwind v3-style steps like:

- `npm install -D tailwindcss postcss autoprefixer`
- `npx tailwindcss init -p`
- adding manual `content` scan paths in `tailwind.config.js`

Those older steps are valid for older setups, but they are **not** how this packaged project is configured. Tailwind’s current Vite guide recommends the Vite plugin approach. citeturn0search2turn0search21turn0search17

## Folder structure

```text
pumdoki-home-final-v2/
├─ index.html
├─ package.json
├─ vite.config.js
├─ README.md
└─ src/
   ├─ App.jsx
   ├─ index.css
   └─ main.jsx
```

## Quick start

From the project folder:

```bash
npm install
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173/
```

Open that URL in your browser.

## Run it in VS Code

1. Install Node.js first.
2. Open VS Code.
3. Go to **File > Open Folder**.
4. Select the extracted project folder.
5. Open the integrated terminal.
6. Run:

```bash
npm install
npm run dev
```

7. Open the local URL shown in the terminal.

## Run it in PowerShell

Open PowerShell in the extracted project folder and run:

```powershell
npm install
npm run dev
```

If script execution policy causes unrelated environment issues on your machine, use Command Prompt instead for this project.

## Run it in Command Prompt

Open Command Prompt in the extracted project folder and run:

```bat
npm install
npm run dev
```

## Run it in Git Bash

Open Git Bash in the extracted project folder and run:

```bash
npm install
npm run dev
```

## Run it on macOS Terminal or Linux terminal

Open Terminal in the extracted project folder and run:

```bash
npm install
npm run dev
```

## Run it in Antigravity

The exact UI labels can vary by version, but the process is the same:

1. Create or open a local project/workspace.
2. Import or open the extracted folder.
3. Make sure the workspace terminal is using the project root.
4. Run:

```bash
npm install
npm run dev
```

5. Use Antigravity’s browser preview, local web preview, or the printed localhost URL.

If Antigravity asks how to start the app, use:

```bash
npm run dev
```

If it asks for the framework/runtime, use:

- React
- Vite
- Node.js

## Build for production

```bash
npm run build
```

Vite’s production build outputs into a `dist/` folder by default. citeturn0search9turn0search12

## Preview the production build locally

```bash
npm run preview
```

## If you want to recreate this project manually from scratch

React officially documents using a build tool such as Vite for React apps. citeturn0search1

1. Create the app:

```bash
npm create vite@latest pumdoki-home
```

Choose:

- Framework: React
- Variant: JavaScript + SWC
- Vite 8 beta / experimental: No

2. Enter the folder:

```bash
cd pumdoki-home
```

3. Install packages:

```bash
npm install
npm install -D tailwindcss @tailwindcss/vite
```

4. Replace `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

5. Replace `src/index.css` with:

```css
@import "tailwindcss";
```

6. Replace `src/App.jsx` and `src/main.jsx` with the files in this package.

7. Run:

```bash
npm run dev
```

## Troubleshooting

### The page looks unstyled

Possible causes:

- you did not run `npm install`
- you are not in the project root folder
- `src/index.css` was changed or not imported in `src/main.jsx`
- `vite.config.js` does not include `@tailwindcss/vite`

### The local URL does not open

Try:

- stopping the server with `Ctrl + C`
- running `npm run dev` again
- checking whether another app is using the same port

### `npm` is not recognized

Node.js is not installed correctly or is not on your PATH.

### Images load differently sometimes

The creator images come from remote URLs. If those external image responses change, crop/quality behavior may vary slightly.

## Commands reference

```bash
npm install
npm run dev
npm run build
npm run preview
```
