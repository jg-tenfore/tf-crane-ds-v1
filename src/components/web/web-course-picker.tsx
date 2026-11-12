import { useState } from "react";
import { CheckCircle, XClose } from "@untitledui/icons";
import { Button as AriaButton, Heading as AriaHeading } from "react-aria-components";
import { cx } from "@/utils/cx";
import { SearchField } from "@/components/forms/search-field";
import { Drawer } from "@/components/overlays/drawer";
import { COURSES, type Course } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";

export interface WebCoursePickerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    activeId?: string;
    onSelect?: (course: Course) => void;
}

/** Course picker — left drawer with search, like live CraneWeb's "Golf Courses" panel. */
export const WebCoursePicker = ({ isOpen, onOpenChange, activeId, onSelect }: WebCoursePickerProps) => {
    const [query, setQuery] = useState("");
    const list = COURSES.filter((c) => `${c.name} ${c.city} ${c.state}`.toLowerCase().includes(query.trim().toLowerCase()));

    return (
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange} className="w-[380px] max-w-[88%]">
            {({ close }) => (
                <>
                    <div className="flex items-center justify-between border-b border-secondary px-5 py-4">
                        <AriaHeading slot="title" className="text-xl font-semibold text-primary">
                            Golf Courses
                        </AriaHeading>
                        <AriaButton aria-label="Close" onPress={close} className="flex size-9 cursor-pointer items-center justify-center rounded-full text-fg-secondary outline-none hover:bg-primary_hover focus-visible:ring-4 focus-visible:ring-brand-300/60">
                            <XClose className="size-5" />
                        </AriaButton>
                    </div>
                    <div className="px-5 py-3">
                        <SearchField placeholder="Search golf courses..." value={query} onChange={setQuery} />
                    </div>
                    <ul className="scrollbar-hide flex-1 divide-y divide-border-secondary overflow-y-auto">
                        {list.map((c) => {
                            const active = c.id === activeId;
                            return (
                                <li key={c.id}>
                                    <AriaButton
                                        onPress={() => {
                                            onSelect?.(c);
                                            close();
                                        }}
                                        className={cx(
                                            "flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left outline-none transition duration-100 ease-linear hover:bg-primary_hover data-[focus-visible]:bg-primary_hover",
                                            active && "bg-secondary",
                                        )}
                                    >
                                        <CourseLogo course={c} size={44} />
                                        <span className="min-w-0 flex-1">
                                            <span className={cx("block text-md font-semibold", active ? "text-brand-secondary" : "text-primary")}>{c.name}</span>
                                            <span className="block text-sm text-tertiary">
                                                {c.city}, {c.state}
                                            </span>
                                        </span>
                                        {active && <CheckCircle className="size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />}
                                    </AriaButton>
                                </li>
                            );
                        })}
                        {list.length === 0 && <li className="px-5 py-10 text-center text-sm text-tertiary">No courses match “{query}”.</li>}
                    </ul>
                </>
            )}
        </Drawer>
    );
};
