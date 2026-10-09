import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock } from "@untitledui/icons";
import { Pill } from "@/components/base/badge";
import { QRCode } from "@/components/base/qr-code";
import { Screen } from "@/components/device/screen";
import { ProfileNav } from "./profile-shared";

const ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newCode = () => Array.from({ length: 16 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

export interface KioskSignInScreenProps {
    /** Seconds a code stays valid before it's regenerated. */
    lifetime?: number;
    /** First code shown (stories pin it so screenshots are stable). */
    initialCode?: string;
}

/**
 * Kiosk Sign-In (IMG_2178) — a short-lived QR the course kiosk scans. The pill counts
 * down and a fresh code is issued when it hits zero.
 */
export const KioskSignInScreen = ({ lifetime = 30, initialCode = "7K2QF9X4M8TC3WHD" }: KioskSignInScreenProps) => {
    const [{ code, left }, setState] = useState({ code: initialCode, left: lifetime });

    useEffect(() => {
        const id = window.setInterval(() => {
            setState((s) => (s.left > 1 ? { ...s, left: s.left - 1 } : { code: newCode(), left: lifetime }));
        }, 1000);
        return () => window.clearInterval(id);
    }, [lifetime]);

    return (
        <Screen nav={<ProfileNav title="Kiosk Sign-In" />}>
            <div className="flex flex-col items-center px-gutter pt-3.5">
                <p className="text-ios-subheadline text-tertiary">Show this code at the kiosk to sign in.</p>

                <div className="mt-3.5 flex w-[278px] flex-col items-center rounded-ios-card bg-white px-4 pt-4 pb-3.5 shadow-ios-card ring-1 ring-secondary/60">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={code}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center"
                        >
                            <QRCode value={`crane://kiosk-sign-in?code=${code}`} size={244} />
                            <span className="mt-2 font-mono text-[13px] tracking-[0.22em] text-quaternary">{code}</span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-4" role="timer" aria-live="off">
                    <Pill icon={Clock} className="h-[30px] px-3 text-ios-subheadline text-secondary tabular-nums ring-0 [&>svg]:size-4">
                        Expires in {left}s
                    </Pill>
                </div>
            </div>
        </Screen>
    );
};
