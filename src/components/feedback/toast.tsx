import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { CheckCircle } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { useSafeArea } from "@/components/device/iphone-frame";

export interface ToastOptions {
    title: string;
    icon?: FC<{ className?: string }>;
    /** Optional inline action, e.g. "View" → jump to Bookings. */
    action?: { label: string; onPress: () => void };
    /** ms before auto-dismiss. */
    duration?: number;
}

interface ToastApi {
    show: (toast: ToastOptions) => void;
}

const ToastContext = createContext<ToastApi>({ show: () => {} });

/** Show a toast. Outside a ToastProvider (single-screen stories) it's a no-op. */
export const useToast = () => useContext(ToastContext);

/**
 * ToastProvider — iOS-style banner that drops in under the Dynamic Island.
 * Render it inside the IPhoneFrame so the toast stays on the phone.
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toast, setToast] = useState<(ToastOptions & { key: number }) | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const show = useCallback((t: ToastOptions) => {
        clearTimeout(timer.current);
        setToast({ ...t, key: Date.now() });
        timer.current = setTimeout(() => setToast(null), t.duration ?? 3200);
    }, []);
    useEffect(() => () => clearTimeout(timer.current), []);

    const Icon = toast?.icon ?? CheckCircle;
    const { top: safeTop } = useSafeArea();

    return (
        <ToastContext.Provider value={{ show }}>
            {children}
            <div className="pointer-events-none absolute inset-x-0 z-[90] flex justify-center px-3" style={{ top: safeTop - 4 }}>
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            key={toast.key}
                            role="status"
                            initial={{ y: -40, opacity: 0, scale: 0.96 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -30, opacity: 0, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            className="glass-strong pointer-events-auto flex min-h-[52px] w-full max-w-[370px] items-center gap-3 rounded-full py-2 pr-2 pl-4"
                        >
                            <Icon className="size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                            <span className="min-w-0 flex-1 text-ios-subheadline font-semibold text-primary">{toast.title}</span>
                            {toast.action && (
                                <AriaButton
                                    onPress={() => {
                                        toast.action?.onPress();
                                        setToast(null);
                                    }}
                                    className="press-scale h-[36px] shrink-0 cursor-pointer rounded-full bg-brand-solid px-4 text-ios-subheadline font-semibold text-white outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60"
                                >
                                    {toast.action.label}
                                </AriaButton>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
