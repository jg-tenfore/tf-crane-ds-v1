import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/base/button";
import { Screen } from "@/components/device/screen";
import { ProfileNav } from "./profile-shared";

const LINES = ["Share your ideas", "Report bugs", "Vote on features", "Talk to the team"];
const TOTAL = LINES.reduce((n, l) => n + l.length, 0);
/** ms per typed character, pause after each line, delay before typing starts. */
const CHAR_MS = 42;
const LINE_PAUSE_MS = 260;
const START_MS = 650;

export interface CommunityScreenProps {
    /** Play the intro (fade-in + typewriter). Off renders the finished state (IMG_2177). */
    animate?: boolean;
    onContinue?: () => void;
}

/**
 * Community intro (IMG_2176 → 2177). Title and tagline fade up, then the four
 * promises type themselves out one line at a time and "Let's go" pops in.
 */
export const CommunityScreen = ({ animate = true, onContinue }: CommunityScreenProps) => {
    const reduce = useReducedMotion();
    const play = animate && !reduce;
    const [typed, setTyped] = useState(play ? 0 : TOTAL);

    useEffect(() => {
        if (!play) {
            setTyped(TOTAL);
            return;
        }
        setTyped(0);
        let n = 0;
        let timer: number;
        const lineEnds = LINES.reduce<number[]>((acc, l) => [...acc, (acc.at(-1) ?? 0) + l.length], []);
        const tick = () => {
            n += 1;
            setTyped(n);
            if (n >= TOTAL) return;
            timer = window.setTimeout(tick, lineEnds.includes(n) ? LINE_PAUSE_MS : CHAR_MS);
        };
        timer = window.setTimeout(tick, START_MS);
        return () => window.clearTimeout(timer);
    }, [play]);

    const done = typed >= TOTAL;
    // How many characters of each line are visible, and which line holds the caret.
    const shown = LINES.map((line, i) => {
        const before = LINES.slice(0, i).reduce((n, l) => n + l.length, 0);
        return Math.max(0, Math.min(line.length, typed - before));
    });
    const caretLine = Math.max(0, shown.findLastIndex((n) => n > 0));

    const fadeUp = (delay: number) =>
        play ? { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const } } : {};

    return (
        <Screen nav={<ProfileNav title="Community" />}>
            <div className="flex min-h-full flex-col items-center justify-center px-gutter pb-16 text-center">
                <motion.div layout={play} transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }} className="flex flex-col items-center">
                    <motion.h2 {...fadeUp(0.05)} className="font-display text-ios-large-title text-primary">
                        Community
                    </motion.h2>
                    <motion.p {...fadeUp(0.2)} className="text-ios-callout text-quaternary">
                        A place for you and the app
                    </motion.p>

                    <ul className="mt-5 flex flex-col gap-3" aria-label="What you can do">
                        {LINES.map((line, i) =>
                            shown[i] > 0 || (i === 0 && !done) ? (
                                <li key={line} aria-label={line} className="min-h-[28px] text-ios-title3 font-normal text-primary">
                                    <span aria-hidden="true">{line.slice(0, shown[i])}</span>
                                    {!done && i === caretLine && (
                                        <span aria-hidden="true" className="ml-px inline-block h-[22px] w-[1.5px] translate-y-[4px] animate-pulse bg-fg-primary" />
                                    )}
                                </li>
                            ) : null,
                        )}
                    </ul>

                    {done && (
                        <motion.div
                            initial={play ? { opacity: 0, scale: 0.9 } : false}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 380, damping: 26, delay: play ? 0.15 : 0 }}
                            className="mt-8"
                        >
                            <Button size="lg" onPress={onContinue} className="h-[52px] w-[200px] rounded-full!">
                                Let's go
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </Screen>
    );
};
