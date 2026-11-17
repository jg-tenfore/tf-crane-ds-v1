import { useMemo } from "react";
import { MCG_ORG } from "@/data/orgs";
import { MCG_SCREEN_GROUPS } from "@/prototype-app/mcg-screens";
import { CraneWebRoutes, webRoutes } from "@/screens/web/web-app";
import { WebScreen, type WebScreenProps } from "../crane-web/web-story-kit";

/**
 * Story kit for Prototypes › MCG Instruction. Screen agents: use these in your story files.
 *
 *   <McgScreen path="/instruction/pro/mike-kenny"><InstructorProfilePage id="mike-kenny" /></McgScreen>
 *   <McgRoute path="/instruction/book?coach=mike-kenny&service=private-45&course=falls-road" />
 *
 * Both render inside the Crane Web frame with the MCG org active (MCG header, nav, picker,
 * footer; address bar mcg.tenfore.golf). `McgScreen` renders the children you pass; `McgRoute`
 * resolves the path through the real route table (redirects included), so links inside work.
 */

export type McgScreenProps = Omit<WebScreenProps, "org">;

/** One MCG screen: `WebScreen` with the MCG org. */
export const McgScreen = (props: McgScreenProps) => <WebScreen org={MCG_ORG} {...props} />;

const Routes = () => {
    const routes = useMemo(() => webRoutes(), []);
    return <CraneWebRoutes routes={routes} />;
};

/** Whatever the app renders at `path` (the same routes as the MCG prototype). */
export const McgRoute = (props: Omit<McgScreenProps, "children">) => (
    <McgScreen {...props}>
        <Routes />
    </McgScreen>
);

/** Story parameters every MCG story uses. NOTE: write `parameters: { layout: "fullscreen" }` inline in each meta — Storybook does not apply an imported constant here (the story falls back to "centered"). */
export const MCG_STORY_PARAMETERS = { layout: "fullscreen" } as const;

/** The prototype's jump list (Home, every Instruction route, deep-link examples) — for docs and indexes. */
export { MCG_SCREEN_GROUPS };
