/**
 * Club home for white-label Crane apps (customization R&D, Nov 24, 2026 call): the hero, the
 * announcements feed, and the themed home preview Buck's App appearance page drops in.
 */
export { ClubHomeHeader, ClubLogo, HeroActionButton, clubName, type ClubHomeHeaderProps, type HeroActionButtonProps } from "./club-home-header";
export { ClubFeedStrip, FeedKindTag, FEED_KINDS, PinnedMark, endsLabel, postedLabel, visibleFeed, type ClubFeedStripProps } from "./club-feed-strip";
export { ClubFeedScreen, type ClubFeedScreenProps } from "./club-feed-screen";
export { ClubHomeScreen, CLUB_ROUTES, type ClubHomeScreenProps } from "./club-home-screen";
export { ClubApp, ClubPortalScope, clubScreens, type ClubAppProps, type ClubScreenOptions } from "./club-app";
export { ClubHomePreview, CLUB_PREVIEW_SIZE, type ClubHomePreviewProps } from "./club-home-preview";
export {
    DEFAULT_HERO_FOCUS,
    HERO_ASPECT,
    HERO_MIN_WIDTH,
    HERO_SIZE,
    SCRIM_RANGE,
    heroFallbackPhotos,
    heroQuality,
    loadImage,
    objectPosition,
    scrimAlphaFor,
    useHeroScrim,
    useImageSize,
    type HeroFocus,
    type HeroQuality,
    type HeroQualityLevel,
    type HeroScrim,
} from "./hero-guardrails";

/** A 480 px copy of the Kettle Hills photo: what a too-small upload looks like (Low-res photo story). */
export { default as LOW_RES_SAMPLE_PHOTO } from "./images/kettle-hills-480.webp";
