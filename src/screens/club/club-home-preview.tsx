import { useEffect, useState } from "react";
import { ClubTheme } from "@/components/club-theme/club-theme";
import { IPhoneFrame, IPHONE_17 } from "@/components/device/iphone-frame";
import type { ClubProfile } from "@/data/club-profiles";
import { cx } from "@/utils/cx";
import { ClubApp } from "./club-app";
import { CLUB_ROUTES } from "./club-home-screen";
import type { HeroFocus } from "./hero-guardrails";

/** Unscaled size of the preview: the iPhone 17 screen, plus the 13 pt bezel for `device`. */
export const CLUB_PREVIEW_SIZE = {
    device: { width: IPHONE_17.width + 26, height: IPHONE_17.height + 26 },
    bare: { width: IPHONE_17.width, height: IPHONE_17.height },
} as const;

export interface ClubHomePreviewProps {
    profile: ClubProfile;
    /** Preview another palette than the profile's (Buck's picker). */
    paletteId?: string;
    /** Preview another photo (a fresh upload's object URL). `null` previews "no photo" (the default set). */
    heroPhoto?: string | null;
    /** Preview another focus point. */
    heroFocus?: HeroFocus;
    /** Warm Dark. */
    dark?: boolean;
    /** 1 = actual size (428 × 900 with the bezel). The box takes the scaled size, so it lays out normally. */
    scale?: number;
    /** `device` draws the bezel; `bare` is just the rounded 402 × 874 screen. */
    frame?: "device" | "bare";
    /** Open on the home or on News & updates. */
    screen?: "home" | "feed";
    /** Crossfade the default photos when there's no photo (turn off for screenshots). */
    animateFallback?: boolean;
    className?: string;
}

/**
 * ClubHomePreview: the themed club home in an iPhone frame at any scale, for Buck's App appearance live
 * preview and side-by-side stories. Self-contained: it brings its own theme, course state, stack and
 * overlays, and needs no router or provider around it. It stays interactive (scroll, See all, sheets).
 */
export const ClubHomePreview = ({
    profile,
    paletteId,
    heroPhoto,
    heroFocus,
    dark = false,
    scale = 1,
    frame = "device",
    screen = "home",
    animateFallback = true,
    className,
}: ClubHomePreviewProps) => {
    const first = screen === "feed" ? CLUB_ROUTES.feed : CLUB_ROUTES.home;
    const [route, setRoute] = useState<string>(first);
    useEffect(() => setRoute(first), [first]);
    const size = CLUB_PREVIEW_SIZE[frame];
    // White status bar over the photo and the brand bar; the feed's light nav bar needs dark glyphs.
    const statusBar = route === CLUB_ROUTES.feed && !dark ? "dark" : "light";

    return (
        <div
            data-club-preview={profile.courseId}
            data-palette={paletteId ?? profile.paletteId}
            className={cx("relative shrink-0", className)}
            style={{ width: size.width * scale, height: size.height * scale }}
        >
            <div className="absolute top-0 left-0 origin-top-left" style={{ width: size.width, height: size.height, transform: scale === 1 ? undefined : `scale(${scale})` }}>
                <ClubTheme paletteId={paletteId ?? profile.paletteId}>
                    <IPhoneFrame variant={frame} dark={dark} statusBar={statusBar}>
                        <ClubApp
                            key={`${profile.courseId}:${screen}`}
                            profile={profile}
                            heroPhoto={heroPhoto}
                            heroFocus={heroFocus}
                            animateFallback={animateFallback}
                            initialStack={screen === "feed" ? [CLUB_ROUTES.home, CLUB_ROUTES.feed] : undefined}
                            onRouteChange={setRoute}
                        />
                    </IPhoneFrame>
                </ClubTheme>
            </div>
        </div>
    );
};
