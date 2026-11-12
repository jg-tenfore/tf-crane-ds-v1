import type { ReactNode } from "react";
import { XClose } from "@untitledui/icons";
import { Button as AriaButton, Dialog as AriaDialog, Heading as AriaHeading, Modal as AriaModal, ModalOverlay as AriaModalOverlay } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface WebDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    /** Short supporting line under the title. */
    description?: ReactNode;
    children?: ReactNode;
    /** Right-aligned action row (Cancel / Save). */
    footer?: ReactNode;
    /** Left side of the footer row — a quantity stepper, a "Remove" link. */
    footerStart?: ReactNode;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizes = { sm: "max-w-[420px]", md: "max-w-[520px]", lg: "max-w-[680px]" };

/**
 * WebDialog — centered modal for Crane Web (add address, payment methods, notices).
 * Portals into the WebFrame page; on mobile web it becomes a bottom sheet.
 */
export const WebDialog = ({ isOpen, onOpenChange, title, description, children, footer, footerStart, size = "md", className }: WebDialogProps) => (
    <AriaModalOverlay
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable
        className="@container absolute inset-0 z-50 flex items-end justify-center bg-(--scrim) data-[entering]:animate-in data-[entering]:fade-in data-[entering]:duration-200 data-[exiting]:animate-out data-[exiting]:fade-out data-[exiting]:duration-150 @tablet:items-center @tablet:p-6"
    >
        <AriaModal
            className={cx(
                "flex max-h-[92%] w-full flex-col overflow-hidden rounded-t-2xl bg-primary shadow-xl ring-1 ring-secondary_alt data-[entering]:animate-in data-[entering]:slide-in-from-bottom-4 data-[entering]:duration-200 @tablet:rounded-2xl @tablet:data-[entering]:zoom-in-95",
                sizes[size],
                className,
            )}
        >
            <AriaDialog className="flex min-h-0 flex-1 flex-col outline-none">
                {({ close }) => (
                    <>
                        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
                            <div>
                                <AriaHeading slot="title" className="text-xl font-semibold text-primary">
                                    {title}
                                </AriaHeading>
                                {description && <p className="mt-1 text-sm text-tertiary">{description}</p>}
                            </div>
                            <AriaButton
                                aria-label="Close"
                                onPress={close}
                                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg-secondary ring-1 ring-secondary outline-none ring-inset hover:bg-primary_hover focus-visible:ring-4 focus-visible:ring-brand-300/60"
                            >
                                <XClose className="size-5" aria-hidden="true" />
                            </AriaButton>
                        </div>
                        {children && <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>}
                        {(footer || footerStart) && (
                            <div className="flex items-center justify-end gap-3 border-t border-secondary px-6 py-4">
                                {footerStart && <div className="mr-auto flex items-center gap-3">{footerStart}</div>}
                                {footer}
                            </div>
                        )}
                    </>
                )}
            </AriaDialog>
        </AriaModal>
    </AriaModalOverlay>
);
