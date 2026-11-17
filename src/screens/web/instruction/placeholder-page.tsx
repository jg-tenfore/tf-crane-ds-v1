import type { ReactNode } from "react";
import { Tag } from "@/components/base/badge";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { WebShell } from "../web-shell";
import { instructionHref } from "./data/query";
import { useInstructionQuery } from "./use-instruction-query";

/**
 * Temporary page for an Instruction route that hasn't been ported yet: title, a "Being ported"
 * tag, and what the route received (path params + the parsed `InstructionQuery`) so routing and
 * deep links can be checked before the real screen lands. Each route file swaps this out.
 */
export const InstructionPlaceholderPage = ({ title, params = {}, note }: { title: string; params?: Record<string, string>; note?: ReactNode }) => {
    const { pathname, query } = useInstructionQuery();
    return (
        <WebShell active="instruction">
            <WebPage>
                <PageHeader
                    back={
                        <WebLink href={instructionHref()} className="text-sm font-semibold text-brand-secondary hover:underline">
                            ← Instruction
                        </WebLink>
                    }
                    eyebrow="Instruction"
                    title={
                        <span className="flex flex-wrap items-center gap-3">
                            {title}
                            <Tag tone="warning" variant="soft">
                                Being ported
                            </Tag>
                        </span>
                    }
                    subtitle={note ?? "This screen is being ported from Fox Prototype 3. The route and its URL state already work."}
                />
                <section className="mt-8 grid gap-4 @desktop:grid-cols-2">
                    <div className="rounded-xl bg-primary p-5 ring-1 ring-secondary">
                        <div className="caps text-quaternary">Route</div>
                        <p className="mt-2 font-mono text-sm break-all text-primary" data-testid="route-path">
                            {pathname}
                        </p>
                        <div className="caps mt-4 text-quaternary">Path params</div>
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-secondary p-3 font-mono text-xs text-secondary" data-testid="route-params">
                            {JSON.stringify(params, null, 2)}
                        </pre>
                    </div>
                    <div className="rounded-xl bg-primary p-5 ring-1 ring-secondary">
                        <div className="caps text-quaternary">Parsed query</div>
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-secondary p-3 font-mono text-xs text-secondary" data-testid="route-query">
                            {JSON.stringify(query, null, 2)}
                        </pre>
                    </div>
                </section>
            </WebPage>
        </WebShell>
    );
};
