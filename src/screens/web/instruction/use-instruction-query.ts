import { useCallback, useMemo } from "react";
import { useWebRouter } from "@/components/web/web-router";
import { splitPath, withQuery, type InstructionQuery } from "./data/query";

/**
 * The Instruction URL state for the current route: `query` is parsed from the router path,
 * `setQuery(patch)` writes it back (a new history entry, or `{ replace: true }` for filter
 * tweaks that shouldn't stack up Back presses), `hrefWith(patch)` builds a link to the same page.
 *
 *     const { query, setQuery } = useInstructionQuery();
 *     setQuery({ formats: ["clinic"], expanded: true });
 */
export const useInstructionQuery = () => {
    const { path, navigate, replace } = useWebRouter();
    const { pathname, query } = useMemo(() => splitPath(path), [path]);
    const hrefWith = useCallback((patch: Partial<InstructionQuery>) => withQuery(pathname, { ...query, ...patch }), [pathname, query]);
    const setQuery = useCallback(
        (patch: Partial<InstructionQuery>, opts?: { replace?: boolean }) => {
            const next = hrefWith(patch);
            if (opts?.replace) replace(next);
            else navigate(next);
        },
        [hrefWith, navigate, replace],
    );
    return { pathname, query, setQuery, hrefWith };
};
