import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchField } from "@/components/forms/search-field";
import { ListGroup, ListRow } from "@/components/lists/list";
import { COURSES } from "@/data/crane";
import { Panel } from "../story-kit";

/**
 * SearchField — iOS search: magnifier, placeholder, and a clear (×) button once there's
 * text. Escape also clears. Built on React Aria SearchField.
 */
const meta: Meta<typeof SearchField> = {
    title: "Components/Forms/Search Field",
    component: SearchField,
    tags: ["autodocs"],
    args: { placeholder: "Search courses" },
    render: (args) => (
        <Panel className="w-[402px]">
            <SearchField {...args} />
        </Panel>
    ),
};
export default meta;
type Story = StoryObj<typeof SearchField>;

export const Default: Story = {};

export const WithValue: Story = { name: "With value (clear button)", args: { defaultValue: "Sagamore" } };

const Filter = () => {
    const [q, setQ] = useState("");
    const results = COURSES.filter((c) => `${c.name} ${c.city}`.toLowerCase().includes(q.toLowerCase()));
    return (
        <Panel className="flex w-[402px] flex-col gap-4 px-0">
            <div className="px-gutter">
                <SearchField placeholder="Search courses" value={q} onChange={setQ} />
            </div>
            <ListGroup header={`${results.length} courses`}>
                {results.map((c) => (
                    <ListRow key={c.id} title={c.name} subtitle={`${c.city}, ${c.state}`} trailing={c.distanceMi ? `${c.distanceMi} mi` : undefined} />
                ))}
            </ListGroup>
        </Panel>
    );
};

/** Filters the course list as you type. */
export const Filtering: Story = { render: () => <Filter /> };
