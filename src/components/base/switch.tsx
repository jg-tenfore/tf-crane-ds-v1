import type { ReactNode } from "react";
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface SwitchProps extends Omit<AriaSwitchProps, "children" | "className"> {
    children?: ReactNode;
    className?: string;
}

/** iOS switch (51 × 31 pt) in brand green. Label is optional — rows usually supply it. */
export const Switch = ({ children, className, ...props }: SwitchProps) => (
    <AriaSwitch {...props} className={cx("group inline-flex cursor-pointer items-center gap-3 outline-none disabled:cursor-not-allowed disabled:opacity-50", className)}>
        {children && <span className="text-ios-body text-primary">{children}</span>}
        <span className="relative h-[31px] w-[51px] shrink-0 rounded-full bg-quaternary transition duration-200 ease-ios group-data-[focus-visible]:ring-4 group-data-[focus-visible]:ring-brand-300/60 group-data-[selected]:bg-brand-solid">
            <span className="absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)] transition-transform duration-200 ease-ios group-data-[pressed]:w-[31px] group-data-[selected]:translate-x-[20px] group-data-[pressed]:group-data-[selected]:translate-x-[16px]" />
        </span>
    </AriaSwitch>
);
