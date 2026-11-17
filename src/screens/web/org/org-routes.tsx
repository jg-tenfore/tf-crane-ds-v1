import type { ComponentType } from "react";
import type { WebRoute } from "../web-app";
import { useWebOrg } from "../web-shell";
import { McgHomePage } from "./mcg-home-page";

/** Organization home pages by org id (`WebOrg.hasHome`). Add an org's home here. */
export const ORG_HOME_PAGES: Record<string, ComponentType> = {
    mcg: McgHomePage,
};

/** "/" under an org with a home page; renders nothing otherwise (CraneWebRoutes redirects "/" to /tee-times). */
const OrgHomeRoute = () => {
    const org = useWebOrg();
    const Home = org?.hasHome ? ORG_HOME_PAGES[org.id] : undefined;
    return Home ? <Home /> : null;
};

export const orgRoutes: WebRoute[] = [{ pattern: "/", render: () => <OrgHomeRoute /> }];
