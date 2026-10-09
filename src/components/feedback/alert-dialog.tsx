import type { ReactNode } from "react";
import { Dialog as AriaDialog, Heading as AriaHeading, Modal as AriaModal, ModalOverlay as AriaModalOverlay } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";

export interface AlertAction {
    label: string;
    onPress?: () => void;
    /** `cancel` = neutral, `default` = brand, `destructive` = red label. */
    style?: "cancel" | "default" | "destructive";
}

export interface AlertDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    message?: ReactNode;
    /** 1–2 actions sit side by side; 3+ stack vertically (iOS behaviour). */
    actions: AlertAction[];
}

/**
 * AlertDialog — iOS 26 alert: a Liquid Glass card with capsule buttons, centred
 * over a dimmed scrim. Renders inside the IPhoneFrame via the portal provider.
 */
export const AlertDialog = ({ isOpen, onOpenChange, title, message, actions }: AlertDialogProps) => {
    const stacked = actions.length > 2;
    return (
        <AriaModalOverlay
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className="absolute inset-0 z-50 flex items-center justify-center bg-(--scrim) px-[34px] data-[entering]:animate-in data-[entering]:fade-in data-[entering]:duration-200 data-[exiting]:animate-out data-[exiting]:fade-out data-[exiting]:duration-150"
        >
            <AriaModal className="w-full max-w-[320px] data-[entering]:animate-alert-in">
                <AriaDialog role="alertdialog" className="glass-strong rounded-[34px] p-5 outline-none">
                    {({ close }) => (
                        <>
                            <AriaHeading slot="title" className="text-ios-headline text-primary">
                                {title}
                            </AriaHeading>
                            {message && <p className="mt-1 text-ios-subheadline text-tertiary">{message}</p>}
                            <div className={cx("mt-5 gap-2.5", stacked ? "flex flex-col" : "flex")}>
                                {actions.map((a) => (
                                    <Button
                                        key={a.label}
                                        size="md"
                                        color="gray"
                                        fullWidth
                                        onPress={() => {
                                            a.onPress?.();
                                            close();
                                        }}
                                        className={cx(
                                            "rounded-full",
                                            // Button is shrink-0 by default; side-by-side actions must share the row.
                                            !stacked && "min-w-0 flex-1 shrink",
                                            a.style === "default" ? "bg-brand-solid text-white" : "bg-black/[0.06] dark:bg-white/10",
                                            a.style === "destructive" && "text-error-primary",
                                        )}
                                    >
                                        {a.label}
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}
                </AriaDialog>
            </AriaModal>
        </AriaModalOverlay>
    );
};
