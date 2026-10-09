import type { ReactNode } from "react";
import { XClose } from "@untitledui/icons";
import { Dialog as AriaDialog, Heading as AriaHeading, Modal as AriaModal, ModalOverlay as AriaModalOverlay } from "react-aria-components";
import { cx } from "@/utils/cx";
import { GlassIconButton } from "@/components/base/glass-button";

export interface BottomSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title?: ReactNode;
    /** Pinned action row (Cancel / Continue). Stays visible while the body scrolls. */
    footer?: ReactNode;
    /** `large` ≈ the iOS large detent (top ~22% of the screen stays visible). `full` covers to the status bar. */
    detent?: "medium" | "large" | "full";
    /** Hide the × button (sheets that must be completed or cancelled via the footer). */
    hideClose?: boolean;
    /** Custom header — replaces title + close (e.g. hero image header). */
    header?: ReactNode;
    /** Accessible name when there's no visible `title` (e.g. a summary step or custom header). */
    "aria-label"?: string;
    children: ReactNode;
    className?: string;
}

const detents = { medium: "h-[52%]", large: "h-[78%]", full: "h-[calc(100%-54px)]" };

/**
 * BottomSheet — an iOS page sheet with a grabber, header, scrolling body and pinned
 * footer. Dismisses on scrim tap or Escape. Renders inside the IPhoneFrame.
 */
export const BottomSheet = ({ isOpen, onOpenChange, title, footer, detent = "large", hideClose, header, children, className, ...props }: BottomSheetProps) => (
    <AriaModalOverlay
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable
        className="absolute inset-0 z-50 flex items-end bg-(--scrim) data-[entering]:animate-in data-[entering]:fade-in data-[entering]:duration-300 data-[exiting]:animate-out data-[exiting]:fade-out data-[exiting]:duration-200"
    >
        <AriaModal
            className={cx(
                "mx-[6px] mb-[6px] w-[calc(100%-12px)] overflow-hidden rounded-ios-sheet bg-primary shadow-ios-float data-[entering]:animate-sheet-up data-[exiting]:animate-out data-[exiting]:slide-out-to-bottom data-[exiting]:duration-200",
                detents[detent],
                className,
            )}
        >
            <AriaDialog aria-label={title && !header ? undefined : (props["aria-label"] ?? "Sheet")} className="relative flex h-full flex-col outline-none">
                {({ close }) => (
                    <>
                        <div aria-hidden="true" className="mx-auto mt-[6px] h-[5px] w-[36px] shrink-0 rounded-full bg-quaternary" />
                        {header ??
                            (title || !hideClose ? (
                                <div className="flex shrink-0 items-center gap-3 border-b border-secondary px-5 pt-2 pb-3">
                                    <AriaHeading slot="title" className="flex-1 text-ios-title2 text-primary">
                                        {title}
                                    </AriaHeading>
                                    {!hideClose && <GlassIconButton icon={XClose} aria-label="Close" onPress={close} className="size-[36px] bg-tertiary [&>svg]:size-5" />}
                                </div>
                            ) : null)}
                        <div className="scrollbar-hide flex-1 overflow-y-auto overscroll-contain">{children}</div>
                        {footer && <div className="shrink-0 border-t border-secondary bg-primary px-5 pt-3 pb-[30px]">{footer}</div>}
                    </>
                )}
            </AriaDialog>
        </AriaModal>
    </AriaModalOverlay>
);
