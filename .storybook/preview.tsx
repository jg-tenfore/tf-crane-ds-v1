import type { Decorator, Preview } from "@storybook/react-vite";
import { IPhoneFrame, type IPhoneFrameProps } from "../src/components/device/iphone-frame";
import "../src/styles/globals.css";

/**
 * Stories opt into the iPhone 17 frame with `parameters: { phone: true }` (or an
 * options object). The toolbar flips every phone story between bezel / bare and
 * light / dark without touching story code.
 */
const withPhone: Decorator = (Story, ctx) => {
    const phone = ctx.parameters.phone as boolean | Partial<IPhoneFrameProps> | undefined;
    const dark = ctx.globals.theme === "dark";
    if (!phone) {
        return (
            <div className={dark ? "dark-mode bg-primary p-6 font-body text-primary antialiased" : "font-body text-primary antialiased"}>
                <Story />
            </div>
        );
    }
    const opts = phone === true ? {} : phone;
    return (
        <IPhoneFrame variant={ctx.globals.frame === "bare" ? "bare" : "device"} dark={dark} statusBar={dark ? "light" : "dark"} {...opts}>
            <Story />
        </IPhoneFrame>
    );
};

const preview: Preview = {
    parameters: {
        layout: "centered",
        options: {
            storySort: {
                method: "alphabetical",
                order: [
                    "Introduction",
                    "Foundations",
                    ["Colors", "Typography", "Spacing", "Radius", "Border", "Effect Styles", "Liquid Glass", "Icons", "Logos", "Device"],
                    "Components",
                    ["Actions", "Navigation", "Lists & Cards", "Forms", "Feedback", "Overlays"],
                    "Sign in ∕ Sign up",
                    ["Flow", "*"],
                    "Profile ∕ Account",
                    ["Flow", "Profile", "*"],
                    "App Chrome",
                    ["Global Nav", "*"],
                ],
            },
        },
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
        a11y: { test: "todo" },
        backgrounds: {
            options: {
                canvas: { name: "Canvas", value: "#f2f2f7" },
                paper: { name: "Paper", value: "#ffffff" },
                ink: { name: "Ink", value: "#161616" },
            },
        },
    },
    initialGlobals: {
        backgrounds: { value: "canvas" },
        theme: "light",
        frame: "device",
    },
    globalTypes: {
        theme: {
            description: "Color theme",
            toolbar: {
                title: "Theme",
                icon: "contrast",
                items: [
                    { value: "light", title: "Light", icon: "sun" },
                    { value: "dark", title: "Dark", icon: "moon" },
                ],
                dynamicTitle: true,
            },
        },
        frame: {
            description: "iPhone frame",
            toolbar: {
                title: "Frame",
                icon: "mobile",
                items: [
                    { value: "device", title: "iPhone 17 bezel" },
                    { value: "bare", title: "Screen only (402×874)" },
                ],
                dynamicTitle: true,
            },
        },
    },
    decorators: [withPhone],
};

export default preview;
