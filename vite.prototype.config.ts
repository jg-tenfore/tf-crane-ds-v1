import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo-root asset folders the screens reference with relative URLs (crane-logo/…, brand/…). */
const ASSET_DIRS = ["brand", "crane-logo"];

/**
 * Serves the brand folders in dev and copies them into the build, so the prototype uses
 * the same files as Storybook without moving them out of the repo root.
 */
const brandAssets = (): Plugin => ({
    name: "crane-brand-assets",
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            const url = decodeURIComponent((req.url ?? "").split("?")[0]);
            const dir = ASSET_DIRS.find((d) => url.includes(`/${d}/`));
            if (!dir) return next();
            const file = path.join(dirname, dir, path.basename(url));
            if (!file.startsWith(path.join(dirname, dir)) || !fs.existsSync(file)) return next();
            res.setHeader("Content-Type", file.endsWith(".svg") ? "image/svg+xml" : file.endsWith(".webp") ? "image/webp" : "image/jpeg");
            fs.createReadStream(file).pipe(res);
        });
    },
    writeBundle(options) {
        for (const d of ASSET_DIRS) fs.cpSync(path.join(dirname, d), path.join(options.dir!, d), { recursive: true });
    },
});

// `npm run prototype` → http://localhost:6022. Built with PAGES=1 for GitHub Pages (/tf-crane-ds-v1/prototype/).
export default defineConfig({
    root: path.join(dirname, "prototype"),
    base: process.env.PAGES ? "/tf-crane-ds-v1/prototype/" : "/",
    plugins: [react(), tailwindcss(), brandAssets()],
    resolve: { alias: { "@": path.join(dirname, "src") } },
    server: { port: 6022, strictPort: true, host: true },
    preview: { port: 6022, strictPort: true, host: true },
    build: { outDir: path.join(dirname, "dist-prototype"), emptyOutDir: true },
});
