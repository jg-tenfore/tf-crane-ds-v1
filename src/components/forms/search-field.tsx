import { SearchLg, XCircle } from "@untitledui/icons";
import { Button as AriaButton, Input as AriaInput, SearchField as AriaSearchField, type SearchFieldProps as AriaSearchFieldProps } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, "children" | "className"> {
    placeholder?: string;
    className?: string;
}

/** iOS search field — magnifier, placeholder, clear button once there's text. */
export const SearchField = ({ placeholder = "Search", className, ...props }: SearchFieldProps) => (
    <AriaSearchField {...props} aria-label={props["aria-label"] ?? placeholder} className={cx("group", className)}>
        <div className="flex h-[40px] items-center gap-2 rounded-ios-control bg-primary px-3 ring-1 ring-primary ring-inset group-focus-within:ring-2 group-focus-within:ring-brand">
            <SearchLg className="size-[18px] shrink-0 text-fg-quaternary" aria-hidden="true" />
            <AriaInput placeholder={placeholder} className="h-full min-w-0 flex-1 bg-transparent text-ios-body text-primary outline-none placeholder:text-placeholder" />
            <AriaButton className="flex size-6 cursor-pointer items-center justify-center text-fg-quaternary outline-none group-data-[empty]:hidden">
                <XCircle className="size-[18px]" aria-hidden="true" />
            </AriaButton>
        </div>
    </AriaSearchField>
);
