import { useState, type ReactNode } from "react";
import { InfoCircle } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { WebShell } from "@/screens/web/web-shell";
import { Breadcrumb, CategoriesDialog, CategorySidebar, CategoryTabs, MobileShopBar, useHeaderOffset, type CategoryNavVariant, type Crumb } from "./shop-nav";
import { ShopSearchField } from "./shop-ui";

export interface ShopFrameProps {
    variant: CategoryNavVariant;
    group?: string;
    subgroup?: string;
    /** Sidebar highlight for non-category pages (gift cards). */
    activeHref?: string;
    title: ReactNode;
    eyebrow?: ReactNode;
    subtitle?: ReactNode;
    crumbs?: Crumb[];
    query: string;
    onQuery: (q: string) => void;
    searchPlaceholder?: string;
    initialCategoriesOpen?: boolean;
    children: ReactNode;
}

const SidebarRail = (props: { group?: string; subgroup?: string; activeHref?: string }) => {
    const { ref, top } = useHeaderOffset();
    return (
        <aside className="hidden @tablet:block">
            <div ref={ref} className="sticky" style={{ top: top + 24 }}>
                <CategorySidebar {...props} />
            </div>
        </aside>
    );
};

/**
 * The page scaffold shared by Shop and Category pages: WebShell + title + category navigation
 * in the chosen variant, the desktop search box, and the mobile sticky bar + Categories sheet.
 */
export const ShopFrame = ({ variant, group, subgroup, activeHref, title, eyebrow, subtitle, crumbs, query, onQuery, searchPlaceholder = "Search the shop", initialCategoriesOpen = false, children }: ShopFrameProps) => {
    const [sheet, setSheet] = useState(initialCategoriesOpen);
    const search = <ShopSearchField value={query} onChange={onQuery} placeholder={searchPlaceholder} className="hidden w-72 @tablet:block" />;

    return (
        <WebShell active="shop">
            <WebPage>
                {variant === "sidebar" && crumbs && crumbs.length > 1 && <Breadcrumb items={crumbs} className="mb-4 hidden @tablet:block" />}
                <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} actions={search} className="mb-5 @tablet:mb-0" />
                <MobileShopBar group={group} subgroup={subgroup} query={query} onQuery={onQuery} searchPlaceholder={searchPlaceholder} onCategories={() => setSheet(true)} />

                {variant === "tabs" ? (
                    <>
                        <div className="mt-6 hidden @tablet:block">
                            <CategoryTabs group={group} subgroup={subgroup} />
                        </div>
                        <div className="@tablet:mt-10">{children}</div>
                    </>
                ) : (
                    <div className="@tablet:mt-8 @tablet:grid @tablet:grid-cols-[200px_minmax(0,1fr)] @tablet:gap-8 @desktop:grid-cols-[232px_minmax(0,1fr)] @desktop:gap-10">
                        <SidebarRail group={group} subgroup={subgroup} activeHref={activeHref} />
                        <div className="min-w-0">{children}</div>
                    </div>
                )}

                <CategoriesDialog isOpen={sheet} onOpenChange={setSheet} group={group} subgroup={subgroup} />
            </WebPage>
        </WebShell>
    );
};

/** Inline note — e.g. the snack-bar "checks out separately" rule. */
export const ShopNote = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cx("flex items-start gap-3 rounded-xl bg-primary px-4 py-3 text-sm text-secondary ring-1 ring-secondary ring-inset", className)}>
        <InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-brand-primary" aria-hidden="true" />
        <span>{children}</span>
    </div>
);
