import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, CheckCircle } from "@untitledui/icons";
import { ClubTheme } from "@/components/club-theme/club-theme";
import { CLUB_PROFILES, type ClubProfile } from "@/data/club-profiles";
import { paletteById, paletteRamp } from "@/data/club-themes";
import { courseById } from "@/data/crane";
import { ClubApp, ClubHomePreview, HERO_MIN_WIDTH, LOW_RES_SAMPLE_PHOTO, clubName, heroQuality, useImageSize, type ClubAppProps } from "@/screens/club";
import { cx } from "@/utils/cx";

/**
 * The club home for white-label Crane apps (Nov 24, 2026 customization R&D). Four curated dials, set by
 * the course in Buck: a palette (one of 12), one hero photo, the logo + name, and an announcements feed.
 * Golfers just see their course's look. The hero's guardrails are built in: the photo is cropped at the
 * course's focus point, a scrim measured from the photo keeps white text readable, and a course without a
 * photo gets TenFore's default set (never a TenFore logo). Below it: the latest posts, then the same tee
 * sheet as the standard Home. Scroll the phone: the hero collapses into a bar in the club's colour.
 */
const meta: Meta = {
    title: "Explorations/Club customization/Club home",
    // The phone frame with white status-bar glyphs: the hero photo runs under them.
    parameters: { phone: { statusBar: "light" } },
};
export default meta;
type Story = StoryObj;

const club = (courseId: string): ClubProfile => {
    const p = CLUB_PROFILES.find((c) => c.courseId === courseId);
    if (!p) throw new Error(`No club profile for ${courseId}`);
    return p;
};

/** A club's home in its own palette. Clickable: See all, the cards, the menu, the name and the tee times all work. */
const Club = ({ profile, ...props }: ClubAppProps) => (
    <ClubTheme paletteId={profile.paletteId}>
        <ClubApp profile={profile} {...props} />
    </ClubTheme>
);

/** No hero photo on purpose: TenFore's default set (Overcast classic) crossfades in. Pine palette. */
export const SagamoreSpring: Story = { name: "Sagamore Spring · no photo, default set", render: () => <Club profile={club("sagamore-spring")} /> };

/** An org with nine courses: the org's name and mark on top, the course the tee sheet is for on the menu button. Fairway (Crane's own green). */
export const Mcg: Story = { name: "MCG", render: () => <Club profile={club("falls-road")} /> };

/** Olive Grove. */
export const KettleHills: Story = { name: "Kettle Hills", render: () => <Club profile={club("kettle-hills")} /> };

/** Navy Blazer; the photo's focus sits a little low to keep the green in the crop. */
export const MemorialPark: Story = { name: "Memorial Park", render: () => <Club profile={club("memorial-park")} /> };

/** Charcoal, for an indoor lounge: an interior photo works the same way. */
export const FloGolf: Story = { name: "FloGolf", render: () => <Club profile={club("flogolf")} /> };

/** Overlays take the palette too: the Configure Booking sheet's buttons and chips are Olive here. */
export const BookingSheet: Story = { name: "Kettle Hills · booking sheet", render: () => <Club profile={club("kettle-hills")} openTeeTimeIndex={1} /> };

/** News & updates, pushed from See all: every live post, pinned first, with its image and call to action. The expired Labor Day offer is hidden. */
export const FeedScreen: Story = {
    name: "News & updates",
    parameters: { phone: true },
    render: () => <Club profile={club("sagamore-spring")} initialStack={["club-home", "club-feed"]} />,
};

/** Warm Dark. The photo, scrim and white logo tile don't change; brand solids (date chip, bar, buttons) keep the palette. */
export const MemorialParkDark: Story = { name: "Memorial Park · dark", globals: { theme: "dark" }, render: () => <Club profile={club("memorial-park")} /> };

/** Warm Dark with Charcoal, the darkest palette: the selected chip and bar still separate from the page. */
export const FloGolfDark: Story = { name: "FloGolf · dark", globals: { theme: "dark" }, render: () => <Club profile={club("flogolf")} /> };

/* ------------------------------------------------------------------ */
/* Side by side (own frames, so no phone decorator)                    */
/* ------------------------------------------------------------------ */

const Swatch = ({ paletteId }: { paletteId: string }) => (
    <span className="inline-flex items-center gap-2">
        <span className="size-3.5 rounded-full ring-1 ring-black/10" style={{ background: paletteRamp(paletteId)[600] }} aria-hidden="true" />
        <span className="text-sm font-semibold text-primary">{paletteById(paletteId).name}</span>
    </span>
);

/** The same course in three palettes. Only the palette changes: the selected date, tab underline, badges, links, bar and buttons follow it. */
export const SameClubThreePalettes: Story = {
    name: "Same club, three palettes",
    parameters: { phone: false, layout: "padded" },
    render: () => (
        <div className="flex flex-wrap items-start gap-8 p-2">
            {["olive", "navy", "claret"].map((id) => (
                <figure key={id} className="flex flex-col items-center gap-3">
                    <ClubHomePreview profile={club("kettle-hills")} paletteId={id} scale={0.62} />
                    <figcaption>
                        <Swatch paletteId={id} />
                    </figcaption>
                </figure>
            ))}
        </div>
    ),
};

const QualityRow = ({ profile }: { profile: ClubProfile }) => {
    const size = useImageSize(profile.heroPhoto);
    const q = heroQuality(size?.width, size?.height);
    const name = clubName(profile, courseById(profile.courseId));
    return (
        <tr className="border-t border-secondary">
            <td className="py-2 pr-3 font-medium text-primary">{name}</td>
            <td className="py-2 pr-3 text-tertiary tabular-nums">{profile.heroPhoto ? (size ? `${size.width} × ${size.height}` : "…") : "None"}</td>
            <td className="py-2 pr-3 text-tertiary tabular-nums">{q.usableWidth ? `${q.usableWidth} px` : "–"}</td>
            <td className="py-2">
                {!profile.heroPhoto ? (
                    <span className="text-tertiary">Default set</span>
                ) : q.level === "low" ? (
                    <span className="font-semibold text-warning-primary">Warn</span>
                ) : q.level === "good" ? (
                    <span className="font-semibold text-success-primary">OK</span>
                ) : (
                    <span className="text-tertiary">…</span>
                )}
            </td>
        </tr>
    );
};

const LowResPhoto = () => {
    const kettle = club("kettle-hills");
    const size = useImageSize(LOW_RES_SAMPLE_PHOTO);
    const q = heroQuality(size?.width, size?.height);
    return (
        <div className="flex flex-wrap items-start gap-8 p-2">
            <figure className="flex flex-col items-center gap-3">
                <ClubHomePreview profile={{ ...kettle, heroPhoto: LOW_RES_SAMPLE_PHOTO }} scale={0.62} />
                <figcaption className="text-sm text-secondary">
                    <strong className="text-primary">480 px upload.</strong> Still renders, a little soft.
                </figcaption>
            </figure>
            <figure className="flex flex-col items-center gap-3">
                <ClubHomePreview profile={kettle} scale={0.62} />
                <figcaption className="text-sm text-secondary">
                    <strong className="text-primary">Same photo, 1200 px.</strong>
                </figcaption>
            </figure>
            <aside className="flex w-[380px] flex-col gap-4">
                <p className="text-sm text-secondary">
                    The phone never shows a warning: golfers just see the photo. The check runs in Buck's App appearance page, with{" "}
                    <code className="text-xs">heroQuality(width, height)</code> from <code className="text-xs">src/screens/club</code>. Under {HERO_MIN_WIDTH} px across
                    the header (after cropping), it returns <code className="text-xs">level: "low"</code> and this copy:
                </p>
                <div
                    data-hero-quality={q.level}
                    className={cx(
                        "flex gap-3 rounded-xl p-4 ring-1",
                        q.level === "low" ? "bg-warning-primary ring-secondary" : "bg-success-primary ring-secondary",
                    )}
                >
                    {q.level === "low" ? (
                        <AlertTriangle className="size-5 shrink-0 text-fg-warning-primary" aria-hidden="true" />
                    ) : (
                        <CheckCircle className="size-5 shrink-0 text-fg-success-primary" aria-hidden="true" />
                    )}
                    <p className="text-sm text-primary">{q.message ?? (q.level === "good" ? "Looks good." : "Measuring…")}</p>
                </div>
                <div>
                    <p className="mb-1 text-sm font-semibold text-primary">The sample clubs' photos, measured</p>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-xs text-tertiary">
                                <th className="pb-1 font-medium">Club</th>
                                <th className="pb-1 font-medium">Photo</th>
                                <th className="pb-1 font-medium">Across header</th>
                                <th className="pb-1 font-medium">Buck</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CLUB_PROFILES.map((p) => (
                                <QualityRow key={p.courseId} profile={p} />
                            ))}
                        </tbody>
                    </table>
                    <p className="mt-2 text-xs text-tertiary">
                        These are the repo's downsized copies (about 1,000–1,200 px), so some flag here; the clubs' originals are larger. A wide photo is judged on
                        what's left after cropping to the header.
                    </p>
                </div>
            </aside>
        </div>
    );
};

/** A too-small photo still renders on the phone; the warning belongs in Buck. Left: a 480 px upload. Middle: the same photo at full size. */
export const LowResPhotoWarning: Story = {
    name: "Low-res photo warning",
    parameters: { phone: false, layout: "padded" },
    render: () => <LowResPhoto />,
};
