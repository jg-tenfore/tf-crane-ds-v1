import type { Meta, StoryObj } from "@storybook/react-vite";
import { MCG_ORG } from "@/data/orgs";
import { DEFAULT_PHOTO_SETS, defaultArt, FORMAT_LABEL, FORMAT_ORDER, type DefaultPhotoSetId } from "@/screens/web/instruction/data";
import { McgRoute } from "./mcg-story-kit";

/**
 * Default photo sets: the fallback when a course hasn't uploaded its own photos (decided on the
 * Nov 17 call with Weston and Jared). TenFore ships six sets, each covering the five Instruction
 * categories. An organization picks one in Buck's clinic template builder and can override any photo
 * per course. There's no TenFore-logo fallback.
 *
 * In Crane Web the category tiles, clinic cards, clinic detail banner and program thumbnails all go
 * through `useOfferingArt()`: the course's own photo when there is one, otherwise the org's set.
 * These stories render MCG with `photos: { own: false }`, as a course with no uploads would look.
 * In the prototype, add `?photos=<set>` to any Instruction link (and `?photos=own` to switch back).
 */
const meta: Meta = {
    title: "Prototypes/MCG Instruction/Default photo sets",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const noPhotos = (set: DefaultPhotoSetId) => ({ ...MCG_ORG, photos: { own: false, defaultSet: set } });

const AllSets = () => (
    <div className="crane-web min-h-screen bg-secondary p-8 font-body text-primary">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <header className="flex flex-col gap-1">
                <span className="caps text-brand-secondary">MCG Instruction · Default photo sets</span>
                <h1 className="text-display-sm font-bold">Six sets, five categories</h1>
                <p className="max-w-3xl text-md text-tertiary">
                    What a course gets when it hasn&rsquo;t uploaded photos. The org picks one set in Buck&rsquo;s clinic template builder and can override any photo per
                    course. No logos or text, and people are seen from behind or at a distance.
                </p>
            </header>
            <div className="grid grid-cols-[9rem_repeat(5,minmax(0,1fr))] gap-3">
                <span />
                {FORMAT_ORDER.map((f) => (
                    <span key={f} className="text-sm font-semibold text-secondary">
                        {FORMAT_LABEL[f]}
                    </span>
                ))}
                {DEFAULT_PHOTO_SETS.map((s, i) => (
                    <div key={s.id} className="contents">
                        <div className="flex flex-col justify-center">
                            <span className="text-sm font-semibold text-primary">
                                {i + 1}. {s.label}
                            </span>
                            <span className="text-xs text-tertiary">{s.blurb}</span>
                        </div>
                        {FORMAT_ORDER.map((f) => (
                            <img key={f} src={defaultArt(s.id, f)} alt={`${s.label} · ${FORMAT_LABEL[f]}`} className="aspect-[3/2] w-full rounded-lg object-cover ring-1 ring-secondary" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const Sets: Story = {
    name: "All six sets",
    render: () => <AllSets />,
    parameters: { docs: { description: { story: "Every set across the five categories: `src/screens/web/instruction/images/default-art/<set>/<category>.webp`." } } },
};

const hub = (set: DefaultPhotoSetId, name: string): Story => ({
    name,
    render: () => <McgRoute path="/instruction" org={noPhotos(set)} />,
    parameters: { docs: { description: { story: `The Instruction landing for a course with no photos, using the **${DEFAULT_PHOTO_SETS.find((s) => s.id === set)!.label}** set.` } } },
});

export const HubMorningParkland = hub("morning-parkland", "No course photos → Morning parkland");
export const HubBrightRange = hub("bright-range", "No course photos → Bright range");
export const HubEveningLinks = hub("evening-links", "No course photos → Evening links");
export const HubOvercastClassic = hub("overcast-classic", "No course photos → Overcast classic");
export const HubIndoorStudio = hub("indoor-studio", "No course photos → Indoor studio");
export const HubAutumn = hub("autumn", "No course photos → Autumn");

export const ClinicsAutumn: Story = {
    name: "Clinic cards → Autumn",
    render: () => <McgRoute path="/clinics" org={noPhotos("autumn")} />,
    parameters: { docs: { description: { story: "Clinics & programs: every group card falls back to the set's photo for its category." } } },
};
export const ClinicDetailAutumn: Story = {
    name: "Clinic detail → Autumn",
    render: () => <McgRoute path="/instruction/service/clinic-3wk-nov?course=falls-road" org={noPhotos("autumn")} />,
    parameters: { docs: { description: { story: "A clinic's detail banner from the set (the 3-Week November Clinic at Falls Road)." } } },
};
export const ClinicsMobileIndoor: Story = {
    name: "Clinic cards → Indoor studio · mobile",
    render: () => <McgRoute path="/clinics" width="mobile" org={noPhotos("indoor-studio")} />,
    parameters: { docs: { description: { story: "The same fallback at 390." } } },
};
