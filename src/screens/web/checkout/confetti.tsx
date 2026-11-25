import { useEffect, useMemo, useState, type CSSProperties } from "react";

/** Brand green, gold, sky, rose and white: decorative only. */
const COLORS = ["var(--color-brand-400)", "var(--color-brand-600)", "var(--color-yellow-400)", "var(--color-sky-400)", "var(--color-pink-400)", "#ffffff"];

/** A small seeded random so every burst (and every screenshot) is the same. */
const seeded = (seed: number) => {
    let t = seed;
    return () => {
        t = (t * 9301 + 49297) % 233280;
        return t / 233280;
    };
};

const prefersReducedMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * A one-off confetti burst for a confirmation page: pieces fly up and out from the top centre of
 * the nearest positioned parent, then fall and fade. It removes itself when done, never takes
 * pointer events, and is skipped for reduced motion. No dependency (Crane has no confetti library).
 */
export const ConfettiBurst = ({ pieces = 90, duration = 2400, top = 104 }: { pieces?: number; duration?: number; top?: number }) => {
    const [show, setShow] = useState(() => !prefersReducedMotion());
    useEffect(() => {
        if (!show) return;
        const t = window.setTimeout(() => setShow(false), duration + 700);
        return () => window.clearTimeout(t);
    }, [show, duration]);

    const items = useMemo(() => {
        const r = seeded(7);
        return Array.from({ length: pieces }, (_, i) => {
            const angle = -Math.PI / 2 + (r() - 0.5) * Math.PI * 0.95;
            const speed = 220 + r() * 300;
            return {
                id: i,
                color: COLORS[i % COLORS.length],
                w: 6 + Math.round(r() * 5),
                h: 9 + Math.round(r() * 7),
                round: r() > 0.7,
                // Up and out, then down past the start.
                upX: Math.cos(angle) * speed * 0.9,
                upY: Math.sin(angle) * speed * 0.3,
                endX: Math.cos(angle) * speed * 1.5,
                endY: 260 + r() * 340,
                rot: Math.round((r() - 0.5) * 1440),
                delay: Math.round(r() * (i % 2 ? 260 : 60)),
                dur: Math.round(duration * (0.75 + r() * 0.25)),
            };
        });
    }, [pieces, duration]);

    if (!show) return null;
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[900px] overflow-hidden">
            <style>{`@keyframes crane-confetti{0%{transform:translate3d(0,0,0) rotate(0);opacity:1}35%{transform:translate3d(var(--ux),var(--uy),0) rotate(calc(var(--rot)*.35));opacity:1}100%{transform:translate3d(var(--ex),var(--ey),0) rotate(var(--rot));opacity:0}}`}</style>
            {items.map((p) => (
                <span
                    key={p.id}
                    className="absolute left-1/2"
                    style={
                        {
                            top,
                            width: p.w,
                            height: p.round ? p.w : p.h,
                            borderRadius: p.round ? 999 : 2,
                            background: p.color,
                            boxShadow: "0 0 0 0.5px rgb(0 0 0 / 0.06)",
                            "--ux": `${p.upX}px`,
                            "--uy": `${p.upY}px`,
                            "--ex": `${p.endX}px`,
                            "--ey": `${p.endY}px`,
                            "--rot": `${p.rot}deg`,
                            animation: `crane-confetti ${p.dur}ms cubic-bezier(.15,.65,.35,1) ${p.delay}ms both`,
                        } as CSSProperties
                    }
                />
            ))}
        </div>
    );
};
