import { Menu01, ShoppingCart01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/utils/cx";
import { CountBadge } from "@/components/base/badge";
import { useSafeArea } from "@/components/device/iphone-frame";

export interface CourseHeaderProps {
    courseName: string;
    city?: string;
    cartCount?: number;
    onMenu?: () => void;
    onCart?: () => void;
    /** Pressing the course name opens course info (phone, email, address). */
    onCourseInfo?: () => void;
    className?: string;
}

/**
 * CourseHeader — Home tab top chrome: hamburger (My Locations drawer), the active
 * course name + city, and the cart. Course context is global: everything below it
 * (tee sheet, store, clinics) is scoped to this course.
 */
export const CourseHeader = ({ courseName, city, cartCount = 0, onMenu, onCart, onCourseInfo, className }: CourseHeaderProps) => {
    const { top: safeTop } = useSafeArea();
    return (
        <header className={cx("bg-primary/85 backdrop-blur-xl backdrop-saturate-150", className)} style={{ paddingTop: safeTop - 8 }}>
            <div className="flex h-[54px] items-center gap-2 px-2">
                <AriaButton
                    aria-label="My locations"
                    onPress={onMenu}
                    className="press-scale flex size-[44px] cursor-pointer items-center justify-center rounded-full text-primary outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60"
                >
                    <Menu01 className="size-6" aria-hidden="true" />
                </AriaButton>
                <AriaButton
                    onPress={onCourseInfo}
                    aria-label={`${courseName} course info`}
                    className="flex min-w-0 flex-1 cursor-pointer flex-col items-center rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60"
                >
                    <span className="max-w-full truncate text-ios-headline text-primary">{courseName}</span>
                    {city && <span className="text-ios-caption1 text-tertiary">{city}</span>}
                </AriaButton>
                <AriaButton
                    aria-label={cartCount ? `Cart, ${cartCount} items` : "Cart"}
                    onPress={onCart}
                    className="press-scale relative flex size-[44px] cursor-pointer items-center justify-center rounded-full text-primary outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60"
                >
                    <ShoppingCart01 className="size-6" aria-hidden="true" />
                    {cartCount > 0 && <CountBadge count={cartCount} className="absolute top-0.5 right-0.5 h-[18px] min-w-[18px] text-[11px]" />}
                </AriaButton>
            </div>
        </header>
    );
};
