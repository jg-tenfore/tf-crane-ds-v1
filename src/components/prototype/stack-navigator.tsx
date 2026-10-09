import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type RouteParams = Record<string, unknown>;
export interface Route {
    name: string;
    params?: RouteParams;
}

interface StackApi {
    /** Push a screen onto the stack (slides in from the right). */
    push: (name: string, params?: RouteParams) => void;
    /** Pop the top screen (slides back out to the right). No-op at the root. */
    pop: () => void;
    /** Return to the root screen. */
    popToRoot: () => void;
    /** Swap the top screen without animation direction semantics (e.g. after a form submit). */
    replace: (name: string, params?: RouteParams) => void;
    route: Route;
    canGoBack: boolean;
    depth: number;
}

const StackContext = createContext<StackApi | null>(null);

/** Navigation inside a StackNavigator. Outside one (single-screen stories) every call is a no-op. */
export const useStack = (): StackApi => {
    const ctx = useContext(StackContext);
    return (
        ctx ?? {
            push: () => {},
            pop: () => {},
            popToRoot: () => {},
            replace: () => {},
            route: { name: "" },
            canGoBack: false,
            depth: 0,
        }
    );
};

export type ScreenRegistry = Record<string, (params: RouteParams) => ReactNode>;

export interface StackNavigatorProps {
    screens: ScreenRegistry;
    initialRoute: string | Route;
    /** Pre-populate the stack, e.g. ["profile", "edit-profile"] to open on a sub-screen with a working back button. */
    initialStack?: (string | Route)[];
}

const toRoute = (r: string | Route): Route => (typeof r === "string" ? { name: r } : r);

const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-28%", zIndex: dir > 0 ? 2 : 0 }),
    center: { x: 0, zIndex: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-28%" : "100%", zIndex: dir > 0 ? 0 : 2 }),
};

/**
 * StackNavigator — a UINavigationController-style push/pop stack for prototypes.
 * Screens are plain components; they navigate with `useStack()`.
 */
export const StackNavigator = ({ screens, initialRoute, initialStack }: StackNavigatorProps) => {
    const [stack, setStack] = useState<Route[]>(() => (initialStack?.length ? initialStack.map(toRoute) : [toRoute(initialRoute)]));
    const [direction, setDirection] = useState(1);

    const push = useCallback((name: string, params?: RouteParams) => {
        setDirection(1);
        setStack((s) => [...s, { name, params }]);
    }, []);
    const pop = useCallback(() => {
        setDirection(-1);
        setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    }, []);
    const popToRoot = useCallback(() => {
        setDirection(-1);
        setStack((s) => s.slice(0, 1));
    }, []);
    const replace = useCallback((name: string, params?: RouteParams) => {
        setDirection(1);
        setStack((s) => [...s.slice(0, -1), { name, params }]);
    }, []);

    const top = stack[stack.length - 1];
    const api = useMemo<StackApi>(
        () => ({ push, pop, popToRoot, replace, route: top, canGoBack: stack.length > 1, depth: stack.length }),
        [push, pop, popToRoot, replace, top, stack.length],
    );

    const render = screens[top.name];

    return (
        <StackContext.Provider value={api}>
            <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={`${stack.length}:${top.name}`}
                        className="absolute inset-0 bg-secondary"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.42 }}
                    >
                        {render ? render(top.params ?? {}) : <MissingScreen name={top.name} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </StackContext.Provider>
    );
};

const MissingScreen = ({ name }: { name: string }) => (
    <div className="flex h-full items-center justify-center p-8 text-center text-ios-subheadline text-tertiary">
        No screen registered for “{name}”.
    </div>
);
