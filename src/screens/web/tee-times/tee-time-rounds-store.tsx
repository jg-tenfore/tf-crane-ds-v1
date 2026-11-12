import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { SAMPLE_ROUNDS, type WebRound } from "./tee-times-data";

interface RoundsApi {
    rounds: WebRound[];
    /** Add (or replace by confirmation #) a round booked in this session. */
    add: (round: WebRound) => void;
    cancel: (confirmation: string) => void;
}

const RoundsContext = createContext<RoundsApi | null>(null);

/**
 * Rounds booked in this prototype session. Optional: without the provider, My Rounds shows
 * the sample rounds and Reserve still routes to the confirmation (which reads its URL).
 */
export const TeeTimeRoundsProvider = ({ initial = SAMPLE_ROUNDS, children }: { initial?: WebRound[]; children: ReactNode }) => {
    const [rounds, setRounds] = useState(initial);
    const add = useCallback((r: WebRound) => setRounds((rs) => [r, ...rs.filter((x) => x.confirmation !== r.confirmation)]), []);
    const cancel = useCallback((c: string) => setRounds((rs) => rs.filter((x) => x.confirmation !== c)), []);
    const api = useMemo(() => ({ rounds, add, cancel }), [rounds, add, cancel]);
    return <RoundsContext.Provider value={api}>{children}</RoundsContext.Provider>;
};

const fallback: RoundsApi = { rounds: SAMPLE_ROUNDS, add: () => {}, cancel: () => {} };
export const useTeeTimeRounds = () => useContext(RoundsContext) ?? fallback;
