import type { ReactNode } from "react";
import { Dialog as AriaDialog, Modal as AriaModal, ModalOverlay as AriaModalOverlay } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface DrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    /** Accessible name when the drawer has no visible heading wired via slot="title". */
    "aria-label"?: string;
    children: ReactNode | ((opts: { close: () => void }) => ReactNode);
    className?: string;
}

/**
 * Drawer — a leading-edge side panel (~75% width) over a dimmed screen. Crane uses it
 * for the course switcher ("My Locations"). Tap the scrim or press Escape to close.
 */
export const Drawer = ({ isOpen, onOpenChange, children, className, ...props }: DrawerProps) => (
    <AriaModalOverlay
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable
        className="absolute inset-0 z-50 bg-(--scrim) data-[entering]:animate-in data-[entering]:fade-in data-[entering]:duration-300 data-[exiting]:animate-out data-[exiting]:fade-out data-[exiting]:duration-200"
    >
        <AriaModal
            className={cx(
                "absolute inset-y-0 left-0 w-[75%] bg-primary shadow-ios-float data-[entering]:animate-drawer-in data-[exiting]:animate-out data-[exiting]:slide-out-to-left data-[exiting]:duration-200",
                className,
            )}
        >
            <AriaDialog aria-label={props["aria-label"]} className="flex h-full flex-col outline-none">
                {({ close }) => (typeof children === "function" ? children({ close }) : children)}
            </AriaDialog>
        </AriaModal>
    </AriaModalOverlay>
);
