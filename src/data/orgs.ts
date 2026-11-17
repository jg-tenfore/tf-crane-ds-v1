import type { WebOrg } from "@/components/web/web-org";
import mcgLogo from "@/screens/chrome/images/course-logos/mcg.svg";

/**
 * Organization configs for Crane Web (multi-course tenants). Pass one to `WebSessionProvider`
 * (`org` prop) — see `WebOrg` in src/components/web/web-org.ts.
 */

/** The Instruction hub pre-filtered to group programs: where an org sends "Clinics" (Fox Prototype 3). */
export const GROUP_PROGRAMS_PATH = "/instruction?formats=clinic,junior-camp,junior-league,op36";

/**
 * Montgomery County Golf — nine public county courses (Montgomery County, MD) under one
 * name, logo, nav and footer. Course order is the MCG Academy's course strip. Contact
 * details are generic sample values (555 number, info@ address).
 */
export const MCG_ORG: WebOrg = {
    id: "mcg",
    name: "Montgomery County Golf",
    shortName: "MCG",
    logo: mcgLogo,
    location: "Montgomery County, MD",
    phone: "(301) 555-0100",
    email: "info@mcg.example.com",
    courses: ["falls-road", "hampshire-greens", "laytonsville", "little-bennett", "northwest", "needwood", "crossvines", "rattlewood", "sligo-creek"],
    sections: [
        { id: "tee-times", label: "Tee Times", short: "Tee", href: "/tee-times" },
        { id: "shop", label: "Shop", short: "Store", href: "/shop" },
        { id: "events", label: "Events", short: "Events", href: "/events" },
        { id: "instruction", label: "Instruction", short: "Lessons", href: "/instruction" },
        { id: "calendar", label: "Calendar", short: "Calendar", href: "/calendar" },
        // MCG calls its food & beverage "Grill"; it is Crane Web's Restaurant area.
        { id: "restaurant", label: "Grill", short: "Grill", href: "/restaurant" },
    ],
    anyCourseLabel: "Any MCG course",
    hasHome: true,
    redirects: [
        // Prototype 3 folds Clinics into Instruction: group formats, pre-filtered.
        { from: "/clinics", to: GROUP_PROGRAMS_PATH },
        // Old /clinics/<id> links (Fox P3 county clinic pages) land on the same program in Instruction.
        { from: "/clinics/:id", to: "/instruction/service/:id" },
        // P3 called the restaurant "Grill".
        { from: "/grill", to: "/restaurant" },
    ],
    host: "mcg.tenfore.golf",
};

export const ORGS: WebOrg[] = [MCG_ORG];

export const orgById = (id: string | undefined): WebOrg | null => ORGS.find((o) => o.id === id) ?? null;
