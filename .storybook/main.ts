import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
    addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
    framework: "@storybook/react-vite",
    staticDirs: [
        "../public",
        // Brand source folders stay where they were dropped; serve them at stable URLs.
        { from: "../brand", to: "/brand" },
        { from: "../crane-logo", to: "/crane-logo" },
        // Crane Web shop imagery + card-brand logos (copied from tf-fox-ds-v1).
        { from: "../images/store", to: "/store-images" },
        { from: "../images/cards", to: "/card-images" },
        // Curated balls / pro-shop / food imagery (from references/111226).
        { from: "../images/shop", to: "/shop-images" },
    ],
    // GitHub Pages serves from a repo subpath; dev stays at root.
    viteFinal: async (viteConfig, { configType }) => {
        if (configType === "PRODUCTION" && process.env.PAGES) {
            viteConfig.base = "/tf-crane-ds-v1/";
        }
        return viteConfig;
    },
};
export default config;
