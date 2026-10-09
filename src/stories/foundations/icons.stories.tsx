import type { Meta, StoryObj } from "@storybook/react-vite";
import * as UntitledIcons from "@untitledui/icons";

type IconComponent = React.FC<{ className?: string }>;

/** Collect every export from @untitledui/icons that is a React component. */
const ALL_ICONS: { name: string; Icon: IconComponent }[] = Object.entries(UntitledIcons)
    .filter(([name, value]) => typeof value === "function" && /^[A-Z]/.test(name))
    .map(([name, value]) => ({ name, Icon: value as IconComponent }))
    .sort((a, b) => a.name.localeCompare(b.name));

interface IconGalleryProps {
    /** Case-insensitive substring filter applied to icon export names. */
    query?: string;
}

/**
 * Renders the complete @untitledui/icons set in a responsive grid, optionally
 * filtered by a case-insensitive substring of the export name. Monochromatic
 * TF Crane theme — every glyph in greyscale.
 */
const IconGallery = ({ query = "" }: IconGalleryProps) => {
    const normalized = query.trim().toLowerCase();
    const icons = normalized ? ALL_ICONS.filter(({ name }) => name.toLowerCase().includes(normalized)) : ALL_ICONS;

    return (
        <div className="min-h-screen bg-primary p-6">
            <p className="mb-4 text-sm text-secondary">
                Showing <span className="font-semibold text-primary">{icons.length}</span> of {ALL_ICONS.length} icons
                {normalized ? ` matching “${query}”` : ""}.
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
                {icons.map(({ name, Icon }) => (
                    <div
                        key={name}
                        className="flex flex-col items-center gap-2 rounded-lg p-3 ring-1 ring-border-secondary"
                    >
                        <Icon className="size-6 text-fg-secondary" />
                        <span className="w-full truncate text-center text-xs text-tertiary" title={name}>
                            {name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const meta = {
    title: "Foundations/Icons",
    component: IconGallery,
    parameters: { layout: "fullscreen" },
    argTypes: { query: { control: "text" } },
    args: { query: "" },
} satisfies Meta<typeof IconGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full grid — every icon in the @untitledui/icons set. */
export const AllIcons: Story = {
    args: { query: "" },
};

/** Type into the `query` control to filter icons by name (defaults to "arrow"). */
export const Filterable: Story = {
    args: { query: "arrow" },
};
