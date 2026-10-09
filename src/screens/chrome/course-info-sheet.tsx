import { Flag01, Mail01, MarkerPin01, Phone01, XClose } from "@untitledui/icons";
import { Dialog as AriaDialog, Heading as AriaHeading, Modal as AriaModal, ModalOverlay as AriaModalOverlay } from "react-aria-components";
import { GlassIconButton } from "@/components/base/glass-button";
import { ListGroup, ListRow } from "@/components/lists/list";
import { useCourse } from "./course-context";

/**
 * Course info — opened by tapping the course name in the header. Hero logo/photo,
 * then tappable phone / email / address rows (call, compose, open Maps).
 */
export const CourseInfoSheet = () => {
    const { course, infoOpen, setInfoOpen } = useCourse();
    return (
        <AriaModalOverlay
            isOpen={infoOpen}
            onOpenChange={setInfoOpen}
            isDismissable
            className="absolute inset-0 z-50 flex items-end bg-(--scrim) data-[entering]:animate-in data-[entering]:fade-in data-[entering]:duration-300 data-[exiting]:animate-out data-[exiting]:fade-out"
        >
            <AriaModal className="mx-[6px] mb-[6px] h-[calc(100%-54px)] w-[calc(100%-12px)] overflow-hidden rounded-ios-sheet bg-secondary shadow-ios-float data-[entering]:animate-sheet-up">
                <AriaDialog className="relative flex h-full flex-col outline-none">
                    {({ close }) => (
                        <>
                            {/* Placeholder hero until real course imagery is wired up. */}
                            <div
                                data-placeholder-asset="course-hero"
                                className="relative flex h-[200px] shrink-0 items-center justify-center bg-gradient-to-br from-brand-500 to-brand-800"
                            >
                                <Flag01 className="size-16 text-white/85" aria-hidden="true" />
                                <GlassIconButton icon={XClose} aria-label="Close" onPress={close} className="absolute top-3 right-3" />
                            </div>
                            <AriaHeading slot="title" className="px-gutter pt-4 pb-3 text-ios-title2 text-primary">
                                {course.name}
                            </AriaHeading>
                            <ListGroup>
                                <ListRow icon={Phone01} subtitle="Phone" title={course.phone ?? "(603) 555-0134"} onPress={() => {}} />
                                <ListRow icon={Mail01} subtitle="Email" title={course.email ?? "info@example.com"} onPress={() => {}} />
                                <ListRow
                                    icon={MarkerPin01}
                                    subtitle="Address"
                                    title={<span className="whitespace-normal">{course.address ?? `${course.city}, ${course.state}`}</span>}
                                    onPress={() => {}}
                                />
                            </ListGroup>
                        </>
                    )}
                </AriaDialog>
            </AriaModal>
        </AriaModalOverlay>
    );
};
