import { createContext, useCallback, useContext, useMemo, useState, type MouseEvent, type ReactNode } from "react";

/**
 * A tiny path router for Crane Web prototypes. Paths mirror CraneWeb's real URLs
 * (/shop/golf-balls/dozens, /cart, /checkout) so every screen is deep-linkable, and the
 * WebFrame address bar shows them. Outside a provider, navigate() is a no-op.
 */
interface WebRouterApi {
    path: string;
    navigate: (path: string) => void;
    back: () => void;
}

const WebRouterContext = createContext<WebRouterApi>({ path: "/", navigate: () => {}, back: () => {} });
export const useWebRouter = () => useContext(WebRouterContext);

export const WebRouterProvider = ({ initialPath = "/", onNavigate, children }: { initialPath?: string; onNavigate?: (path: string) => void; children: ReactNode }) => {
    const [history, setHistory] = useState<string[]>([initialPath]);
    const navigate = useCallback(
        (p: string) => {
            setHistory((h) => (h[h.length - 1] === p ? h : [...h, p]));
            onNavigate?.(p);
        },
        [onNavigate],
    );
    const back = useCallback(() => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h)), []);
    const api = useMemo(() => ({ path: history[history.length - 1], navigate, back }), [history, navigate, back]);
    return <WebRouterContext.Provider value={api}>{children}</WebRouterContext.Provider>;
};

/**
 * Match `path` against a pattern like "/shop/:group/:subgroup?" and return its params,
 * or null. Optional segments end with "?".
 */
export const matchPath = (pattern: string, path: string): Record<string, string> | null => {
    const p = pattern.split("/").filter(Boolean);
    const s = path.split("?")[0].split("/").filter(Boolean);
    const params: Record<string, string> = {};
    if (s.length > p.length) return null;
    for (let i = 0; i < p.length; i++) {
        const seg = p[i];
        const optional = seg.endsWith("?");
        const name = seg.replace(/^:/, "").replace(/\?$/, "");
        if (s[i] === undefined) {
            if (optional) continue;
            return null;
        }
        if (seg.startsWith(":")) params[name] = decodeURIComponent(s[i]);
        else if (name !== s[i]) return null;
    }
    return params;
};

export interface WebLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    "aria-current"?: "page" | undefined;
    "aria-label"?: string;
}

/** A real <a href> (so deep links are honest) that routes in-app when a router is present. */
export const WebLink = ({ href, children, className, ...props }: WebLinkProps) => {
    const { navigate } = useWebRouter();
    return (
        <a
            {...props}
            href={href}
            className={className}
            onClick={(e: MouseEvent) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                navigate(href);
            }}
        >
            {children}
        </a>
    );
};
