import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { NavigationBar, type NavigationBarProps } from "@/components/navigation/navigation-bar";
import { ListRow, type ListRowProps } from "@/components/lists/list";
import { useStack } from "@/components/prototype/stack-navigator";
import { cx } from "@/utils/cx";

/**
 * Nav bar for every Profile sub-screen: glass "‹ Profile" capsule on the left,
 * title centred over the bar (Crane centres pushed-screen titles in this area).
 */
export const ProfileNav = ({ title, trailing, backIconOnly, ...props }: Omit<NavigationBarProps, "onBack" | "backLabel">) => {
    const stack = useStack();
    return (
        <NavigationBar
            {...props}
            title={title}
            backLabel={backIconOnly ? undefined : "Profile"}
            backIconOnly={backIconOnly}
            titleAlign="center"
            trailing={trailing}
            onBack={stack.pop}
        />
    );
};

/**
 * RowCard — an inset-grouped card of Profile rows. Unlike the shared ListGroup, the
 * hairlines here run edge to edge, which is how Crane's Profile list draws them.
 */
export const RowCard = ({ children, className }: { children: ReactNode; className?: string }) => {
    const rows = Children.toArray(children).filter(isValidElement);
    return (
        <div className={cx("px-gutter", className)}>
            <div className="overflow-hidden rounded-ios-card bg-primary shadow-ios-card ring-1 ring-secondary/60">
                {rows.map((row, i) => (
                    <Fragment key={row.key ?? i}>
                        {i > 0 && <div className="h-px bg-border-secondary" />}
                        {row}
                    </Fragment>
                ))}
            </div>
        </div>
    );
};

/** A 72pt Profile row (tile + title + subtitle + chevron). */
export const ProfileRow = ({ className, ...props }: ListRowProps) => <ListRow {...props} className={cx("min-h-[72px]", className)} />;
