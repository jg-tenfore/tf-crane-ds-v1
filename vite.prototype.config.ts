import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Repo asset folders the screens reference with relative URLs, keyed by the URL prefix they're
 * served at (same mapping as Storybook's staticDirs): crane-logo/…, brand/…, store-images/…, etc.
 */
const ASSET_DIRS: Record<string, string> = {
    brand: "brand",
    "crane-logo": "crane-logo",
    "store-images": "images/store",
    "shop-images": "images/shop",
    "card-images": "images/cards",
};

const TYPES: Record<string, string> = { ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

/**
 * Serves those folders in dev (from any page depth, e.g. /web/store-images/…) and copies them
 * into the build next to each page (prototype/ and prototype/web/).
 */
const brandAssets = (): Plugin => ({
    name: "crane-brand-assets",
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            const url = decodeURIComponent((req.url ?? "").split("?")[0]);
            for (const [prefix, dir] of Object.entries(ASSET_DIRS)) {
                const at = url.indexOf(`/${prefix}/`);
                if (at < 0) continue;
                const root = path.join(dirname, dir);
                const file = path.join(root, url.slice(at + prefix.length + 2));
                if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return next();
                res.setHeader("Content-Type", TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream");
                fs.createReadStream(file).pipe(res);
                return;
            }
            next();
        });
    },
    writeBundle(options) {
        for (const page of ["", "web"])
            for (const [prefix, dir] of Object.entries(ASSET_DIRS)) fs.cpSync(path.join(dirname, dir), path.join(options.dir!, page, prefix), { recursive: true });
    },
});

// `npm run prototype` → http://localhost:6022 (iPhone) and http://localhost:6022/web/ (Crane Web). Built with PAGES=1 for GitHub Pages (/tf-crane-ds-v1/prototype/).
export default defineConfig({
    root: path.join(dirname, "prototype"),
    base: process.env.PAGES ? "/tf-crane-ds-v1/prototype/" : "/",
    plugins: [react(), tailwindcss(), brandAssets()],
    resolve: { alias: { "@": path.join(dirname, "src") } },
    server: { port: 6022, strictPort: true, host: true },
    preview: { port: 6022, strictPort: true, host: true },
    build: {
        outDir: path.join(dirname, "dist-prototype"),
        emptyOutDir: true,
        // Two pages: the iPhone prototype (/) and the Crane Web prototype (/web/).
        rollupOptions: { input: { main: path.join(dirname, "prototype/index.html"), web: path.join(dirname, "prototype/web/index.html") } },
    },
});
