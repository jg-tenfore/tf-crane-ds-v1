import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

/**
 * Manager chrome: Crane lockup in the sidebar, Crane green as the accent, warm-cream
 * sidebar to match the docs pages (src/stories/docs-kit). Relative image paths work both
 * locally (/) and on GitHub Pages (/tf-crane-ds-v1/).
 */
const crane = create({
    base: "light",
    brandTitle: `<span style="display:flex;align-items:center;gap:10px;font-family:'Outfit',system-ui,sans-serif">
        <img src="crane-logo/400x400bb-75.jpg" width="30" height="30" alt="" style="border-radius:8px;box-shadow:0 0 0 1px rgba(20,33,26,.08)" />
        <span style="display:flex;flex-direction:column;line-height:1.1">
            <span style="font-size:16px;font-weight:700;color:#14211a">Crane</span>
            <span style="font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#6b7a70">Design System</span>
        </span>
    </span>`,
    brandUrl: "./",
    brandTarget: "_self",

    colorPrimary: "#2C7C4D",
    colorSecondary: "#2C7C4D",

    appBg: "#f8f6f1",
    appContentBg: "#ffffff",
    appPreviewBg: "#ffffff",
    appBorderColor: "#e6e1d6",
    appBorderRadius: 10,

    textColor: "#14211a",
    textMutedColor: "#6b7a70",

    barBg: "#ffffff",
    barTextColor: "#6b7a70",
    barSelectedColor: "#2C7C4D",
    barHoverColor: "#2C7C4D",

    inputBg: "#ffffff",
    inputBorder: "#e6e1d6",
    inputTextColor: "#14211a",
    inputBorderRadius: 8,

    fontBase: "'Outfit', system-ui, -apple-system, sans-serif",
});

addons.setConfig({
    theme: crane,
    sidebar: { showRoots: true },
});
