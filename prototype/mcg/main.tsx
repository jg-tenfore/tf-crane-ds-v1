import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MCG_ORG } from "@/data/orgs";
import { MCG_SCREEN_GROUPS, MCG_STORYBOOK_URL } from "@/prototype-app/mcg-screens";
import { CraneWebPresenter } from "@/prototype-app/web-presenter";
import "@/styles/globals.css";

// Montgomery County Golf on Crane Web: the MCG org's chrome, its home at "/" and the Instruction port.
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <CraneWebPresenter
            title="MCG Instruction prototype"
            host={MCG_ORG.host}
            home="/"
            storageKey="crane-mcg-presenter"
            groups={MCG_SCREEN_GROUPS}
            org={MCG_ORG}
            storybookUrl={MCG_STORYBOOK_URL}
            showShopNav={false}
            links={[
                { label: "Crane Web prototype", href: "../web/" },
                { label: "iPhone prototype", href: "../" },
            ]}
        />
    </StrictMode>,
);
