import type { FC, ReactNode } from "react";
import { cx } from "@/utils/cx";
import { IconTile } from "@/components/base/card";

export interface EmptyStateProps {
    icon: FC<{ className?: string; strokeWidth?: number }>;
    title: ReactNode;
    description?: ReactNode;
    /** Usually a Button. */
    action?: ReactNode;
    /**
     * `quiet` — large gray line icon + one gray line, near the top (Memberships, Punch Cards).
     * `featured` — brand icon in a soft circle, vertically centred (Waitlist).
     */
    variant?: "quiet" | "featured";
    className?: string;
}

/** EmptyState — what a list screen shows before it has content. */
export const EmptyState = ({ icon: Icon, title, description, action, variant = "quiet", className }: EmptyStateProps) => {
    if (variant === "featured") {
        return (
            <div className={cx("flex flex-1 flex-col items-center justify-center px-10 text-center", className)}>
                <IconTile icon={Icon} size="xl" shape="circle" className="mb-4 size-[100px] [&>svg]:size-11" />
                <h2 className="text-ios-title3 text-primary">{title}</h2>
                {description && <p className="mt-1.5 text-ios-subheadline text-tertiary">{description}</p>}
                {action && <div className="mt-6">{action}</div>}
            </div>
        );
    }

    return (
        <div className={cx("flex flex-col items-center px-10 pt-12 text-center", className)}>
            <Icon className="mb-3 size-[60px] text-fg-quaternary" strokeWidth={1.4} aria-hidden="true" />
            <h2 className={cx("text-ios-callout", description ? "font-semibold text-tertiary" : "text-quaternary")}>{title}</h2>
            {description && <p className="mt-1 text-ios-subheadline text-quaternary">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
};
