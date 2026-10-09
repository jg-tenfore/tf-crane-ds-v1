import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BOOKINGS, type Booking } from "@/data/crane";

interface BookingsApi {
    bookings: Booking[];
    addBooking: (booking: Omit<Booking, "id">) => Booking;
    cancelBooking: (id: string) => void;
}

const BookingsContext = createContext<BookingsApi | null>(null);

/**
 * BookingsProvider — the prototype's reservation list. Reserving on the tee sheet
 * adds here; cancelling on Tee Time Details removes. Without a provider, screens
 * fall back to the static sample BOOKINGS (Storybook single-screen stories).
 */
export const BookingsProvider = ({ initial = BOOKINGS, onChange, children }: { initial?: Booking[]; onChange?: (b: Booking[]) => void; children: ReactNode }) => {
    const [bookings, setBookings] = useState(initial);

    // Report changes after commit (never from inside a state updater).
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        onChangeRef.current?.(bookings);
    }, [bookings]);

    const api = useMemo<BookingsApi>(
        () => ({
            bookings,
            addBooking: (b) => {
                const booking = { ...b, id: `b-${Date.now()}` };
                setBookings((prev) => [booking, ...prev]);
                return booking;
            },
            cancelBooking: (id) => setBookings((prev) => prev.filter((b) => b.id !== id)),
        }),
        [bookings],
    );

    return <BookingsContext.Provider value={api}>{children}</BookingsContext.Provider>;
};

export const useBookings = (): BookingsApi =>
    useContext(BookingsContext) ?? {
        bookings: BOOKINGS,
        addBooking: (b) => ({ ...b, id: "preview" }),
        cancelBooking: () => {},
    };
