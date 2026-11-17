/**
 * Small pieces shared by the Reviews summaries. Everything visual comes from the docs kit;
 * this file only adds what a review page needs on top of it.
 */
import type { ReactNode } from "react";
import { COURSE_TAX, TAX_BY_ZIP } from "@/data/shop";
import { DOC, DocTable } from "../docs-kit/docs-kit";

/** Inline code (docs pages are unstyled, so `<code>` needs its own look). */
export const Code = ({ children }: { children: ReactNode }) => (
    <code className="rounded-md px-1.5 py-0.5 text-[13px] whitespace-nowrap" style={{ background: DOC.creamDeep, color: DOC.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
        {children}
    </code>
);

/** The sample destination-tax rates the Crane Web prototype uses (from `src/data/shop.ts`). */
export const TaxRateTable = () => (
    <DocTable
        columns={["ZIP", "Where", "Rate"]}
        widths={["16%", "60%", "24%"]}
        // The course first, then the ship-to samples by place (object keys like "10001" would otherwise sort first).
        rows={Object.values(TAX_BY_ZIP)
            .sort((a, b) => Number(b.zip === COURSE_TAX.zip) - Number(a.zip === COURSE_TAX.zip) || a.label.localeCompare(b.label))
            .map((t) => [
            <Code key="z">{t.zip}</Code>,
            t.zip === COURSE_TAX.zip ? `${t.label} (the course: pickup orders)` : t.label,
            `${(t.rate * 100).toFixed(2)}%`,
        ])}
    />
);

/** The course's own rate, for prose ("Pick up at the course: taxed at …"). */
export const courseTaxLabel = `${COURSE_TAX.label}, ${(COURSE_TAX.rate * 100).toFixed(2)}%`;
