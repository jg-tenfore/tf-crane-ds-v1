import { useState } from "react";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import { Check } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { cx } from "@/utils/cx";
import { ProfileNav } from "./profile-shared";

export type AppearanceMode = "system" | "light" | "dark";

/**
 * A tiny sketch of a Crane screen: title bar + dot, a card with two text lines, a green pill.
 * Drawn entirely with semantic tokens — wrap it in `.dark-mode` and it re-themes itself.
 */
const MiniApp = ({ compact, className }: { compact?: boolean; className?: string }) => (
    <div className={cx("flex h-full flex-col gap-2.5 bg-secondary p-2.5", className)}>
        <div className="flex items-center justify-between">
            <span className={cx("h-[5px] rounded-full bg-fg-primary", compact ? "w-3" : "w-8")} />
            <span className="size-[7px] rounded-full bg-fg-brand-primary" />
        </div>
        <div className={cx("flex flex-col gap-1 rounded-[4px] bg-primary p-1.5 ring-1 ring-secondary", compact && "w-[30px]")}>
            <span className={cx("h-[3px] rounded-full bg-fg-primary", compact ? "w-3/4" : "w-full")} />
            <span className={cx("h-[3px] rounded-full bg-fg-quaternary", compact ? "w-1/2" : "w-1/2")} />
        </div>
        <span className={cx("h-[9px] rounded-full bg-fg-brand-primary", compact ? "w-[19px]" : "w-[46px]")} />
    </div>
);

const Preview = ({ mode }: { mode: AppearanceMode }) => {
    if (mode === "system") {
        return (
            <div className="flex h-full overflow-hidden rounded-[10px]">
                <MiniApp compact className="flex-1 pr-1.5" />
                <div className="dark-mode flex-1">
                    <MiniApp compact className="bg-primary pl-2" />
                </div>
            </div>
        );
    }
    return (
        <div className={cx("h-full overflow-hidden rounded-[10px]", mode === "dark" && "dark-mode")}>
            <MiniApp className={mode === "dark" ? "bg-primary" : undefined} />
        </div>
    );
};

const OPTIONS: { id: AppearanceMode; label: string }[] = [
    { id: "system", label: "System" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Warm Dark" },
];

export interface AppearanceScreenProps {
    defaultMode?: AppearanceMode;
    onChange?: (mode: AppearanceMode) => void;
}

/** Appearance (IMG_2190) — System / Light / Warm Dark preview cards, single-select. */
export const AppearanceScreen = ({ defaultMode = "system", onChange }: AppearanceScreenProps) => {
    const [mode, setMode] = useState<AppearanceMode>(defaultMode);

    return (
        <Screen nav={<ProfileNav title="Appearance" />}>
            <div className="px-gutter pt-3">
                <p id="appearance-label" className="text-ios-subheadline text-tertiary">
                    Choose how the app looks on this device.
                </p>
                <AriaRadioGroup
                    aria-labelledby="appearance-label"
                    orientation="horizontal"
                    value={mode}
                    onChange={(v) => {
                        setMode(v as AppearanceMode);
                        onChange?.(v as AppearanceMode);
                    }}
                    className="mt-4 grid grid-cols-3 gap-2"
                >
                    {OPTIONS.map((o) => (
                        <AriaRadio
                            key={o.id}
                            value={o.id}
                            className="group press-scale relative flex cursor-pointer flex-col rounded-ios-control bg-primary p-2 ring-1 ring-secondary outline-none transition duration-100 ease-linear ring-inset data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[selected]:ring-2 data-[selected]:ring-fg-brand-primary"
                        >
                            <div className="relative h-[132px]">
                                <Preview mode={o.id} />
                                <span className="absolute top-1 right-1 flex size-[22px] scale-50 items-center justify-center rounded-full bg-brand-solid text-white opacity-0 ring-2 ring-white/70 transition duration-150 ease-ios group-data-[selected]:scale-100 group-data-[selected]:opacity-100">
                                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                                </span>
                            </div>
                            <span className="pt-2.5 pb-1 text-center text-ios-headline text-primary">{o.label}</span>
                        </AriaRadio>
                    ))}
                </AriaRadioGroup>
            </div>
        </Screen>
    );
};
