import { TODAY as CRANE_TODAY } from "@/data/crane";
/**
 * Crane Web Restaurant — order food & drinks ahead for pickup.
 *
 * The menu itself is the snack-bar slice of the shop catalog (`src/data/shop.ts`): its
 * subgroups are the menu sections and its products (with real photos) are the items. This
 * file adds what the catalog doesn't carry: hours and pickup points, descriptions, modifier
 * groups, the kitchen's "86'd today" list and the clock helpers behind the pickup picker.
 *
 * Edge cases ported from Fox's MCG Grill (grill-screen.tsx / grill-menu.ts): pickup at the
 * counter vs. at the turn (timed off the hole you text from), breakfast cut-off, 21+ notice on
 * beer, wine and cocktails, sold-out items, and order-ahead when the kitchen is closed.
 */
import { priceOf, productsIn, SHOP_GROUPS, type ShopProduct, type ShopSubgroup } from "@/data/shop";

export const FOOD_GROUP = "snack-bar";

/* ------------------------------------------------------------------ */
/* Menu sections + items (straight from the shop catalog)              */
/* ------------------------------------------------------------------ */

/** Menu sections, in catalog order. Never hard-coded: they come from SHOP_GROUPS. */
export const menuSections = (): ShopSubgroup[] => SHOP_GROUPS.find((g) => g.slug === FOOD_GROUP)?.subgroups ?? [];

export const menuItems = (subgroup?: string): ShopProduct[] => productsIn(FOOD_GROUP, subgroup).filter((p) => p.kind === "food");

export const sectionBySlug = (slug: string) => menuSections().find((s) => s.slug === slug);

export const restaurantPath = (subgroup?: string) => (subgroup ? `/restaurant/${subgroup}` : "/restaurant");

/* ------------------------------------------------------------------ */
/* Clock                                                               */
/* ------------------------------------------------------------------ */

export const at = (h: number, m = 0) => h * 60 + m;

export const clock = (minutes: number): string => {
    const h24 = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    const period = h24 < 12 ? "AM" : "PM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
};

/** Stories pass `now` (minutes after midnight) to pick the time of day. */
/** The prototype's "today" — shared with tee times, wallet statuses and bookings (data/crane TODAY). */
export const TODAY = new Date(CRANE_TODAY);
export const TOMORROW = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 1);
export const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/** Default prototype time: mid-morning, breakfast still on. */
export const DEFAULT_NOW = at(10, 20);

/* ------------------------------------------------------------------ */
/* Venues + hours                                                       */
/* ------------------------------------------------------------------ */

export type LocationId = "grill" | "turn";

export interface PickupLocation {
    id: LocationId;
    name: string;
    where: string;
    /** Compact "where" for the order rail. */
    short: string;
    open: number;
    close: number;
    /** Last time an order can be picked up. */
    lastPickup: number;
}

export const LOCATIONS: Record<LocationId, PickupLocation> = {
    grill: { id: "grill", name: "The Grill", where: "Clubhouse, ground floor — counter by the patio doors", short: "Clubhouse counter", open: at(7), close: at(20), lastPickup: at(19, 30) },
    turn: { id: "turn", name: "Turn stand", where: "Between the 9th green and 10th tee", short: "Between 9 & 10", open: at(8), close: at(18), lastPickup: at(17, 30) },
};

export const BREAKFAST_SLUG = "breakfast";
export const BREAKFAST_UNTIL = at(11);
/** Cooked-to-order breakfast stops at 11; grab-and-go breakfast (fruit cup, bars) sells all day. */
export const isHotBreakfast = (p: ShopProduct) => p.subgroup === BREAKFAST_SLUG && (MODIFIERS[p.id]?.length ?? 0) > 0;
export const ALCOHOL_SLUGS = new Set(["beer", "wine-and-cocktails"]);

/** Kitchen prep for ASAP orders. */
export const ASAP_MINUTES = 15;

export type Day = "today" | "tomorrow";

export type OpenState = "open" | "before-open" | "closed";

/** Is the Grill taking orders for today right now? */
export const grillState = (now: number): OpenState => {
    const g = LOCATIONS.grill;
    if (now < g.open) return "before-open";
    if (now > g.lastPickup - ASAP_MINUTES) return "closed";
    return "open";
};

/* ------------------------------------------------------------------ */
/* Pickup                                                              */
/* ------------------------------------------------------------------ */

export type Pickup = { mode: "asap" } | { mode: "time"; time: number } | { mode: "turn"; hole: number };

/** Holes you can text from — we fire the order then so it's hot when you reach the turn. */
export const TURN_HOLES = [6, 7, 8, 9] as const;
/** Roughly 13 minutes a hole for a foursome. */
const MIN_PER_HOLE = 13;

const roundUp = (n: number, step: number) => Math.ceil(n / step) * step;

/** 30-minute pickup slots at the Grill for a day. Today starts 30 min out. */
export const timeSlots = (day: Day, now: number): number[] => {
    const g = LOCATIONS.grill;
    const first = day === "today" ? Math.max(g.open, roundUp(now + 30, 30)) : g.open;
    const out: number[] = [];
    for (let t = first; t <= g.lastPickup; t += 30) out.push(t);
    return out;
};

export const asapAvailable = (day: Day, now: number) => day === "today" && grillState(now) === "open";

/** Turn ordering needs the turn stand open; tomorrow it's timed off your tee time on the day. */
export const turnAvailable = (day: Day, now: number) => day === "tomorrow" || now < LOCATIONS.turn.lastPickup - 30;

/** The best default pickup for a day. */
export const defaultPickup = (day: Day, now: number): Pickup => {
    if (asapAvailable(day, now)) return { mode: "asap" };
    const slots = timeSlots(day, now);
    return { mode: "time", time: day === "tomorrow" ? (slots.find((t) => t >= at(8)) ?? slots[0]) : slots[0] };
};

export const pickupLocation = (p: Pickup): PickupLocation => (p.mode === "turn" ? LOCATIONS.turn : LOCATIONS.grill);

/** Estimated ready time (minutes) — drives the breakfast cut-off. */
export const readyAt = (p: Pickup, day: Day, now: number): number => {
    if (p.mode === "asap") return now + ASAP_MINUTES;
    if (p.mode === "time") return p.time;
    // At the turn: a 9:10 tee time tomorrow, or "now + the holes left to 9" today.
    const start = day === "tomorrow" ? at(9, 10) + p.hole * MIN_PER_HOLE : now;
    return start + (9 - p.hole) * MIN_PER_HOLE + (day === "tomorrow" ? 0 : 60);
};

export const pickupLabel = (p: Pickup): string => {
    if (p.mode === "asap") return `ASAP · ready in ~${ASAP_MINUTES} min`;
    if (p.mode === "time") return clock(p.time);
    return `At the turn · after hole ${p.hole}`;
};

/** "Pickup today, 12:30 PM at The Grill" — the line the rail and checkout show. */
export const pickupSummary = (p: Pickup, day: Day) => {
    const loc = pickupLocation(p);
    const when = p.mode === "asap" ? `ASAP (~${ASAP_MINUTES} min)` : p.mode === "time" ? clock(p.time) : `when you text from hole ${p.hole}`;
    return { day: day === "today" ? "Today" : "Tomorrow", when, where: loc.name };
};

/* ------------------------------------------------------------------ */
/* Availability                                                        */
/* ------------------------------------------------------------------ */

/** The kitchen's 86 list — sold out for today only, back tomorrow. */
export const SOLD_OUT_TODAY = new Set(["food-soft-pretzel", "food-double-eagle-burger"]);

export type Availability = { ok: true } | { ok: false; reason: "sold-out" | "sold-out-today" | "breakfast-over" };

export const availability = (p: ShopProduct, day: Day, ready: number): Availability => {
    if (!p.inStock || p.stock <= 0) return { ok: false, reason: "sold-out" };
    if (day === "today" && SOLD_OUT_TODAY.has(p.id)) return { ok: false, reason: "sold-out-today" };
    if (isHotBreakfast(p) && ready >= BREAKFAST_UNTIL) return { ok: false, reason: "breakfast-over" };
    return { ok: true };
};

export const unavailableLabel: Record<Exclude<Availability, { ok: true }>["reason"], string> = {
    "sold-out": "Sold out",
    "sold-out-today": "Sold out today",
    "breakfast-over": "Until 11 AM",
};

/* ------------------------------------------------------------------ */
/* Descriptions + callouts                                              */
/* ------------------------------------------------------------------ */

const DESCRIPTIONS: Record<string, string> = {
    "food-clubhouse-breakfast-platter": "Two eggs your way, bacon or sausage, home fries and toast. The early-tee-time special.",
    "food-fresh-fruit-cup": "Melon, pineapple, grapes and berries, cut fresh every morning.",
    "food-deli-sub": "Turkey, ham, salami and provolone with lettuce, tomato and oil & vinegar on a toasted sub roll.",
    "food-patty-melt": "Smashed beef patty, Swiss and caramelized onions on griddled rye.",
    "food-grilled-cheese": "American and cheddar on buttery griddled sourdough.",
    "food-ham-banh-mi": "Shaved ham, pickled carrot and daikon, fresh jalapeño, cilantro and sriracha mayo.",
    "food-hamburger": "Quarter-pound beef patty, lettuce, tomato, onion and pickles on a toasted brioche bun.",
    "food-cheeseburger": "Our classic burger with melted American cheese, lettuce, tomato and house sauce.",
    "food-bacon-cheeseburger": "Cheddar, thick-cut applewood bacon, lettuce, tomato and house sauce.",
    "food-double-eagle-burger": "Two smashed patties, double American, grilled onions and pickles. Worth the two-stroke penalty.",
    "food-mushroom-onion-burger": "Sautéed mushrooms, peppers and onions with Swiss on a brioche bun.",
    "food-double-cheeseburger": "Two patties, two slices of American, ketchup, mustard and pickles.",
    "food-turn-dog": "All-beef frank on a toasted bun. The fastest thing on the board — grab it at the turn.",
    "food-all-the-way-dog": "Chili, slaw, onions and mustard. Napkins included.",
    "food-bacon-cheese-dog": "Wrapped in bacon, topped with melted cheddar.",
    "food-cheese-dog": "All-beef frank smothered in cheddar sauce.",
    "food-fresh-cut-fries": "Hand-cut, skin-on and fried to order with sea salt.",
    "food-cajun-fries": "Fresh-cut fries tossed in our cajun spice blend.",
    "food-soft-pretzel": "Warm, salted and the size of your scorecard. Served with spicy mustard.",
    "food-chocolate-chip-cookie": "Baked in-house every morning, still soft in the middle.",
    "food-bottled-beer": "Ask for Bud Light, Michelob Ultra, Corona or Sam Adams Lager — ice cold.",
    "food-white-claw-black-cherry": "12 oz can, 5% ABV.",
    "food-house-wine": "A generous pour of our house red or white.",
    "food-aperol-spritz": "Aperol, prosecco and a splash of soda over ice, orange slice.",
    "food-bloody-mary": "House mix, vodka, celery salt rim, olive and lime. Make it spicy if you're on the back nine.",
    "food-links-transfusion-classic": "The golf-course classic: vodka, grape, ginger ale and lime.",
    "food-links-transfusion-front-nine": "A lighter take on the transfusion for the front nine.",
    "food-links-transfusion-back-nine": "Bolder, for the closing holes.",
    "food-hot-coffee": "Fresh-brewed, locally roasted. Cream and sugar on request.",
    "food-mango-smoothie": "Mango, banana and yogurt blended to order.",
    "food-lagunitas-ipna": "Lagunitas' hoppy non-alcoholic IPA, 12 oz.",
};

const FALLBACK_BY_SECTION: Record<string, string> = {
    breakfast: "Grab-and-go for an early tee time.",
    sides: "Single-serve bag — easy to stash in the cart.",
    desserts: "A little something for the back nine.",
    beer: "Ice cold, served in cans.",
    "wine-and-cocktails": "Served in a cart-friendly cup.",
    "non-alcoholic": "Ice cold from the cooler.",
};

export const describe = (p: ShopProduct) => DESCRIPTIONS[p.id] ?? FALLBACK_BY_SECTION[p.subgroup] ?? "Made fresh at the Grill.";

export const POPULAR = new Set(["food-cheeseburger", "food-turn-dog", "food-links-transfusion-classic", "food-fresh-cut-fries", "food-clubhouse-breakfast-platter", "food-bloody-mary"]);

/* ------------------------------------------------------------------ */
/* Modifiers                                                            */
/* ------------------------------------------------------------------ */

export interface ModOption {
    id: string;
    label: string;
    /** Upcharge in USD. */
    price?: number;
}

export interface ModGroup {
    id: string;
    title: string;
    /** single = radio, multi = checkboxes. */
    type: "single" | "multi";
    required?: boolean;
    /** Max picks for multi groups. */
    max?: number;
    /** Pre-selected option (single groups). */
    defaultId?: string;
    options: ModOption[];
}

const TEMP: ModGroup = {
    id: "temp",
    title: "How would you like it cooked?",
    type: "single",
    required: true,
    options: [
        { id: "mr", label: "Medium rare" },
        { id: "m", label: "Medium" },
        { id: "mw", label: "Medium well" },
        { id: "wd", label: "Well done" },
    ],
};

const SIDE: ModGroup = {
    id: "side",
    title: "Choose a side",
    type: "single",
    required: true,
    defaultId: "chips",
    options: [
        { id: "chips", label: "Kettle chips" },
        { id: "fries", label: "Fresh-cut fries", price: 2 },
        { id: "cajun", label: "Cajun fries", price: 2.5 },
        { id: "salad", label: "Side salad", price: 2 },
    ],
};

const burgerAddOns = (hasCheese: boolean, hasBacon: boolean): ModGroup => ({
    id: "addons",
    title: "Add-ons",
    type: "multi",
    max: 4,
    options: [
        { id: "cheese", label: hasCheese ? "Extra cheese" : "Add American cheese", price: 1 },
        ...(hasBacon ? [] : [{ id: "bacon", label: "Add bacon", price: 2 }]),
        { id: "onions", label: "Grilled onions", price: 0.75 },
        { id: "jalapenos", label: "Jalapeños", price: 0.75 },
        { id: "avocado", label: "Avocado", price: 1.5 },
    ],
});

const HOLD: ModGroup = {
    id: "hold",
    title: "Hold anything?",
    type: "multi",
    max: 4,
    options: [
        { id: "no-onion", label: "No onion" },
        { id: "no-tomato", label: "No tomato" },
        { id: "no-pickles", label: "No pickles" },
        { id: "no-sauce", label: "No sauce" },
    ],
};

const DOG_TOPPINGS: ModGroup = {
    id: "toppings",
    title: "Toppings",
    type: "multi",
    max: 5,
    options: [
        { id: "mustard", label: "Mustard" },
        { id: "ketchup", label: "Ketchup" },
        { id: "relish", label: "Relish" },
        { id: "onions", label: "Chopped onions" },
        { id: "chili", label: "Add chili", price: 1 },
    ],
};

export const MODIFIERS: Record<string, ModGroup[]> = {
    "food-clubhouse-breakfast-platter": [
        { id: "eggs", title: "Eggs", type: "single", required: true, options: [{ id: "scrambled", label: "Scrambled" }, { id: "over-easy", label: "Over easy" }, { id: "sunny", label: "Sunny side up" }] },
        { id: "meat", title: "Meat", type: "single", required: true, defaultId: "bacon", options: [{ id: "bacon", label: "Bacon" }, { id: "sausage", label: "Sausage" }, { id: "both", label: "Both", price: 2.5 }] },
        { id: "toast", title: "Toast", type: "single", required: true, defaultId: "white", options: [{ id: "white", label: "White" }, { id: "wheat", label: "Wheat" }, { id: "rye", label: "Rye" }, { id: "muffin", label: "English muffin" }] },
    ],
    "food-deli-sub": [
        { id: "bread", title: "Bread", type: "single", required: true, defaultId: "sub", options: [{ id: "sub", label: "Sub roll" }, { id: "wrap", label: "Flour wrap" }, { id: "gf", label: "Gluten-free roll", price: 1.5 }] },
        SIDE,
        HOLD,
    ],
    "food-patty-melt": [TEMP, SIDE],
    "food-grilled-cheese": [{ id: "addons", title: "Add-ons", type: "multi", max: 2, options: [{ id: "tomato", label: "Tomato", price: 0.5 }, { id: "bacon", label: "Bacon", price: 2 }] }, SIDE],
    "food-ham-banh-mi": [SIDE, { id: "hold", title: "Hold anything?", type: "multi", max: 2, options: [{ id: "no-jalapeno", label: "No jalapeño" }, { id: "no-cilantro", label: "No cilantro" }] }],
    "food-hamburger": [TEMP, burgerAddOns(false, false), SIDE, HOLD],
    "food-cheeseburger": [TEMP, burgerAddOns(true, false), SIDE, HOLD],
    "food-bacon-cheeseburger": [TEMP, burgerAddOns(true, true), SIDE, HOLD],
    "food-double-eagle-burger": [TEMP, burgerAddOns(true, false), SIDE, HOLD],
    "food-mushroom-onion-burger": [TEMP, burgerAddOns(true, false), SIDE],
    "food-double-cheeseburger": [TEMP, burgerAddOns(true, false), SIDE, HOLD],
    "food-turn-dog": [DOG_TOPPINGS],
    "food-cheese-dog": [DOG_TOPPINGS],
    "food-bacon-cheese-dog": [DOG_TOPPINGS],
    "food-fresh-cut-fries": [
        { id: "size", title: "Size", type: "single", required: true, defaultId: "reg", options: [{ id: "reg", label: "Regular" }, { id: "lg", label: "Large", price: 2 }] },
        { id: "extras", title: "Extras", type: "multi", max: 2, options: [{ id: "cheese", label: "Cheese sauce", price: 1.5 }, { id: "ranch", label: "Ranch" }] },
    ],
    "food-cajun-fries": [{ id: "size", title: "Size", type: "single", required: true, defaultId: "reg", options: [{ id: "reg", label: "Regular" }, { id: "lg", label: "Large", price: 2 }] }],
    "food-bottled-beer": [
        { id: "beer", title: "Choose a beer", type: "single", required: true, options: [{ id: "bud-light", label: "Bud Light" }, { id: "ultra", label: "Michelob Ultra" }, { id: "corona", label: "Corona Extra" }, { id: "sam", label: "Sam Adams Boston Lager", price: 1 }] },
    ],
    "food-house-wine": [
        { id: "wine", title: "Red or white?", type: "single", required: true, options: [{ id: "cab", label: "Cabernet Sauvignon" }, { id: "pinot-noir", label: "Pinot Noir" }, { id: "chard", label: "Chardonnay" }, { id: "pinot-grigio", label: "Pinot Grigio" }] },
        { id: "pour", title: "Pour size", type: "single", required: true, defaultId: "glass", options: [{ id: "glass", label: "Glass · 6 oz" }, { id: "large", label: "Large pour · 9 oz", price: 4 }] },
    ],
    "food-bloody-mary": [
        { id: "spirit", title: "Spirit", type: "single", required: true, defaultId: "well", options: [{ id: "well", label: "House vodka" }, { id: "titos", label: "Tito's", price: 2 }, { id: "tequila", label: "Make it a Bloody Maria (tequila)", price: 1 }] },
        { id: "extras", title: "Extras", type: "multi", max: 2, options: [{ id: "spicy", label: "Make it spicy" }, { id: "bacon", label: "Bacon garnish", price: 1.5 }] },
    ],
    "food-aperol-spritz": [{ id: "size", title: "Size", type: "single", required: true, defaultId: "reg", options: [{ id: "reg", label: "Regular · 12 oz" }, { id: "lg", label: "Large · 16 oz", price: 3 }] }],
    "food-hot-coffee": [
        { id: "size", title: "Size", type: "single", required: true, defaultId: "md", options: [{ id: "sm", label: "Small · 12 oz", price: -0.5 }, { id: "md", label: "Medium · 16 oz" }, { id: "lg", label: "Large · 20 oz", price: 0.75 }] },
        { id: "addins", title: "Add-ins", type: "multi", max: 3, options: [{ id: "cream", label: "Cream" }, { id: "sugar", label: "Sugar" }, { id: "oat", label: "Oat milk", price: 0.75 }] },
    ],
};

export const modifiersFor = (p: ShopProduct): ModGroup[] => MODIFIERS[p.id] ?? [];
export const hasRequiredChoice = (p: ShopProduct) => modifiersFor(p).some((g) => g.required && !g.defaultId);

export type Selections = Record<string, string[]>;

export const defaultSelections = (p: ShopProduct): Selections =>
    Object.fromEntries(modifiersFor(p).map((g) => [g.id, g.type === "single" && g.defaultId ? [g.defaultId] : []]));

export const missingGroups = (p: ShopProduct, sel: Selections) => modifiersFor(p).filter((g) => g.required && !(sel[g.id]?.length > 0));

export const modsTotal = (p: ShopProduct, sel: Selections) =>
    modifiersFor(p).reduce((sum, g) => sum + (sel[g.id] ?? []).reduce((s, id) => s + (g.options.find((o) => o.id === id)?.price ?? 0), 0), 0);

export const unitPrice = (p: ShopProduct, sel: Selections) => priceOf(p) + modsTotal(p, sel);

/**
 * The cart's variant string: chosen modifiers (skipping included defaults like "Kettle chips"
 * or "Medium · 16 oz") + the special-instructions note. "Medium · Add bacon · Fresh-cut fries".
 */
export const variantLabel = (p: ShopProduct, sel: Selections, note = ""): string => {
    const parts: string[] = [];
    for (const g of modifiersFor(p)) {
        for (const id of sel[g.id] ?? []) {
            const o = g.options.find((x) => x.id === id);
            if (!o) continue;
            const quietDefault = g.type === "single" && g.defaultId === id && !o.price && isIncludedDefault(g);
            if (!quietDefault) parts.push(o.label);
        }
    }
    const n = note.trim();
    if (n) parts.push(`“${n}”`);
    return parts.join(" · ");
};

/** Defaults that are "what you'd get anyway" stay out of the cart line. */
const isIncludedDefault = (g: ModGroup) => ["side", "size", "toast", "pour", "spirit", "bread"].includes(g.id);

/**
 * The cart prices lines from the product, so a line with upcharges is added as a priced copy
 * of the product (same id; the variant string keeps lines apart).
 */
export const pricedProduct = (p: ShopProduct, sel: Selections): ShopProduct => {
    const unit = unitPrice(p, sel);
    return unit === priceOf(p) ? p : { ...p, price: unit, onSale: false, salePrice: undefined };
};

export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const upcharge = (n?: number) => (!n ? "" : n > 0 ? `+${money(n)}` : `−${money(-n)}`);
