import { MCG_SCREEN_GROUPS } from "@/prototype-app/mcg-screens";
import { DocLink, DocTable, Pill, mcgPrototype } from "../docs-kit/docs-kit";

/**
 * Every page of the MCG prototype, straight from its own jump list (src/prototype-app/mcg-screens.ts),
 * so this page and the prototype's side panel can't drift. Each row opens that exact page — the hash
 * route is the deep link a course website would use.
 */
export const McgPageCount = () => <Pill>{MCG_SCREEN_GROUPS.reduce((n, g) => n + g.items.length, 0)} prototype pages</Pill>;

export const McgGroupPills = () => (
    <>
        {MCG_SCREEN_GROUPS.map((g) => (
            <Pill key={g.label}>
                {g.label} <span style={{ opacity: 0.55, marginLeft: 4 }}>{g.items.length}</span>
            </Pill>
        ))}
    </>
);

export const McgPageTable = () => {
    let n = 0;
    const rows = MCG_SCREEN_GROUPS.flatMap((g) =>
        g.items.map(([label, path]) => {
            n += 1;
            return [
                <span key="n" style={{ color: "#6b7a70" }}>{n}</span>,
                <strong key="g">{g.label}</strong>,
                <span key="p">
                    <strong style={{ color: "#14211a" }}>{label}</strong>
                    <br />
                    <code style={{ fontSize: 12, color: "#6b7a70", wordBreak: "break-all" }}>{path}</code>
                </span>,
                <DocLink key="o" href={mcgPrototype(path)}>
                    Prototype
                </DocLink>,
            ];
        }),
    );
    return <DocTable columns={["#", "Area", "Page and its link", "Open"]} widths={["5%", "22%", "58%", "15%"]} rows={rows} />;
};
