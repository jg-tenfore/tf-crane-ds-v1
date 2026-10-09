import { useId, useRef, useState } from "react";
import { cx } from "@/utils/cx";

export interface CodeFieldProps {
    length?: number;
    value?: string;
    onChange?: (code: string) => void;
    /** Fires once every digit is filled. */
    onComplete?: (code: string) => void;
    label?: string;
    isInvalid?: boolean;
    className?: string;
}

/**
 * CodeField — one-time code entry (email / SMS verification). A single real input
 * sits under the boxes so paste, autofill (`one-time-code`) and backspace all work natively.
 */
export const CodeField = ({ length = 6, value, onChange, onComplete, label = "Verification code", isInvalid, className }: CodeFieldProps) => {
    const [inner, setInner] = useState("");
    const [focused, setFocused] = useState(false);
    const code = value ?? inner;
    const ref = useRef<HTMLInputElement>(null);
    const id = useId();

    const set = (next: string) => {
        const digits = next.replace(/\D/g, "").slice(0, length);
        if (value === undefined) setInner(digits);
        onChange?.(digits);
        if (digits.length === length) onComplete?.(digits);
    };

    return (
        <div className={cx("relative", className)} onClick={() => ref.current?.focus()}>
            <label htmlFor={id} className="sr-only">
                {label}
            </label>
            <input
                id={id}
                ref={ref}
                value={code}
                onChange={(e) => set(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={length}
                aria-invalid={isInvalid || undefined}
                className="absolute inset-0 opacity-0"
            />
            <div aria-hidden="true" className="flex justify-between gap-2">
                {Array.from({ length }, (_, i) => {
                    const active = focused && (i === code.length || (i === length - 1 && code.length === length));
                    return (
                        <div
                            key={i}
                            className={cx(
                                "flex h-[58px] flex-1 items-center justify-center rounded-ios-control bg-primary text-ios-title1 text-primary ring-1 ring-primary ring-inset",
                                active && "ring-2 ring-brand",
                                isInvalid && "ring-error",
                            )}
                        >
                            {code[i] ?? (active ? <span className="h-7 w-[2px] animate-caret-blink bg-fg-brand-primary" /> : "")}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
