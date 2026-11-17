import type { Meta, StoryObj } from "@storybook/react-vite";
import { filterOfferings, parseInstructionQuery, queryToFilter, splitPath } from "@/screens/web/instruction/data";
import { cx } from "@/utils/cx";
import { runChecks } from "./deep-link-checks";
import { MCG_SCREEN_GROUPS } from "./mcg-story-kit";

/**
 * Every Instruction state is a URL (Nov 17 call: link from an instructor's MCG page straight to
 * their booking; webmaster-built filtered links). This page lists the prototype's deep links with
 * what each parses to, and runs the foundation's sanity checks (URL model, MCG redirects, ported
 * data). A failing check throws, so `npm test` fails with it.
 *
 * The URL model: `src/screens/web/instruction/data/query.ts` (params table in its header).
 */
const meta: Meta = {
    title: "Prototypes/MCG Instruction/Foundation/Deep links",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const LINKS = MCG_SCREEN_GROUPS.flatMap((g) => g.items.map(([label, path]) => ({ group: g.label, label, path }))).filter((l) => l.path.startsWith("/instruction"));

const summary = (path: string) => {
    const { pathname, query } = splitPath(path);
    const parts = [
        query.view === "instructors" && "view: instructors",
        query.courses.length && `course: ${query.courses.join(", ")}`,
        query.formats.length && `formats: ${query.formats.join(", ")}`,
        query.days.length && `days: ${query.days.join(", ")}`,
        query.skills.length && `skills: ${query.skills.join(", ")}`,
        query.coach && `coach: ${query.coach}`,
        query.service && `service: ${query.service}`,
        query.date && `date: ${query.date}`,
        query.expanded && "expanded",
    ].filter(Boolean);
    const results = pathname === "/instruction" ? `${filterOfferings(queryToFilter(parseInstructionQuery(path))).length} results` : "";
    return { parts: parts.join(" · ") || "—", results };
};

const DeepLinks = () => {
    const checks = runChecks(LINKS.map((l) => l.path));
    const failed = checks.filter((c) => !c.ok);
    if (failed.length) throw new Error(`MCG foundation checks failed:\n${failed.map((c) => `✗ ${c.label} ${c.detail ?? ""}`).join("\n")}`);
    return (
        <div className="crane-web min-h-screen bg-secondary p-8 font-body text-primary">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <header className="flex flex-col gap-1">
                    <span className="caps text-brand-secondary">MCG Instruction · Foundation</span>
                    <h1 className="text-display-sm font-bold">Deep links</h1>
                    <p className="text-md text-tertiary">
                        Every link below opens the MCG prototype in that exact state (<code>prototype/mcg/#&lt;path&gt;</code>). {checks.length} checks passed.
                    </p>
                </header>
                <section className="overflow-hidden rounded-xl bg-primary ring-1 ring-secondary">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary text-xs text-tertiary">
                            <tr>
                                <th className="px-4 py-2 font-semibold">State</th>
                                <th className="px-4 py-2 font-semibold">Path</th>
                                <th className="px-4 py-2 font-semibold">Parses to</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-secondary">
                            {LINKS.map((l) => {
                                const s = summary(l.path);
                                return (
                                    <tr key={l.path}>
                                        <td className="px-4 py-2.5 align-top">
                                            <div className="font-semibold text-primary">{l.label}</div>
                                            <div className="text-xs text-quaternary">{l.group}</div>
                                        </td>
                                        <td className="px-4 py-2.5 align-top font-mono text-xs break-all text-secondary">{l.path}</td>
                                        <td className="px-4 py-2.5 align-top text-secondary">
                                            {s.parts}
                                            {s.results && <div className="text-xs text-tertiary">{s.results}</div>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>
                <section className="rounded-xl bg-primary p-5 ring-1 ring-secondary">
                    <h2 className="text-lg font-semibold">Checks</h2>
                    <ul className="mt-3 grid gap-1.5 text-sm">
                        {checks.map((c) => (
                            <li key={c.label} className="flex gap-2">
                                <span className={cx("font-semibold", c.ok ? "text-success-primary" : "text-error-primary")}>{c.ok ? "✓" : "✗"}</span>
                                <span className="text-secondary">{c.label}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
};

export const DeepLinksAndChecks: Story = { name: "Deep links & checks", render: () => <DeepLinks /> };
