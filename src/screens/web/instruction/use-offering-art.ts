import { useWebSession } from "../web-shell";
import { defaultArt, isDefaultPhotoSet, offeringById, type DefaultPhotoSetId, type OfferingFormat } from "./data";
import { useInstructionQuery } from "./use-instruction-query";

const DEMO_KEY = "crane-demo-photos";
const FALLBACK_SET: DefaultPhotoSetId = "morning-parkland";

/**
 * `?photos=<set>` turns on a default photo set for the session, as if the course had uploaded
 * nothing; `?photos=own` turns it off. Kept in sessionStorage so it survives clicking around the
 * prototype. Nothing outside the demo sets it.
 */
const demoSet = (param: string | undefined): DefaultPhotoSetId | undefined => {
    try {
        if (param === "own") sessionStorage.removeItem(DEMO_KEY);
        else if (isDefaultPhotoSet(param)) sessionStorage.setItem(DEMO_KEY, param);
        const stored = sessionStorage.getItem(DEMO_KEY) ?? undefined;
        return isDefaultPhotoSet(stored) ? stored : undefined;
    } catch {
        return isDefaultPhotoSet(param) ? param : undefined;
    }
};

/**
 * Which photo an Instruction category tile, program card or program banner shows. The course's own
 * photo when there is one; otherwise the org's default photo set (decided Nov 17: no TenFore-logo
 * fallback). `art(format, own)` returns the URL to render.
 */
export const useOfferingArt = () => {
    const { org } = useWebSession();
    const { query } = useInstructionQuery();
    const forced = demoSet(query.extra.photos);
    const orgSet = org?.photos?.defaultSet;
    const set: DefaultPhotoSetId = forced ?? (isDefaultPhotoSet(orgSet) ? orgSet : FALLBACK_SET);
    const defaultsOnly = !!forced || org?.photos?.own === false;
    const art = (format: OfferingFormat, own?: string | null) => (defaultsOnly || !own ? defaultArt(set, format) : own);
    return {
        set,
        defaultsOnly,
        art,
        /** Same, for a program known only by id (profile lists, registration, confirmations). */
        artFor: (programId: string, own?: string | null) => art(offeringById(programId)?.format ?? "clinic", own),
    };
};
