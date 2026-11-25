// Generates src/stories/prototypes/screen-index-data.ts — the rows behind
// Prototypes › iPhone app › Screen index and Prototypes › Crane Web › Screen index.
//
// Regenerate after adding, renaming or moving a prototype story:
//   1. Storybook running:  npm run storybook   (http://localhost:6021)
//   2. node scripts/gen-screen-index.mjs
//      (STORYBOOK_URL=… to point elsewhere; --no-paths skips the browser pass and keeps static paths only)
//
// What it does:
//   - Reads /index.json from the running Storybook. Its order is the sidebar order (the server sorts the
//     index with storySort from .storybook/preview.tsx), so rows come out in sidebar order.
//   - Keeps every *story* (not docs) under "Prototypes/iPhone app/" and "Prototypes/Crane Web/".
//   - Description, first match wins: DESCRIPTIONS override below → the story's
//     parameters.docs.description.story → the JSDoc comment right above the export → a default built
//     from the screen noun (NOUNS) and the story name (Desktop / Mobile web / Empty …).
//   - Crane Web prototype path: opens each story in headless Chromium and reads the WebFrame address
//     bar (so computed paths like pathOf(DEFAULT) resolve), falling back to a literal `path="…"`.
//     iPhone rows get the prototype hash route of their screen (IPHONE_ROUTES).
//   - Asserts every id exists in index.json, row counts match the stories under each root, and every
//     DESCRIPTIONS key is still a real story.
//
// Edit descriptions HERE (DESCRIPTIONS / NOUNS), not in the generated file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/stories/prototypes/screen-index-data.ts");
const BASE = (process.env.STORYBOOK_URL ?? "http://localhost:6021").replace(/\/$/, "");
const RESOLVE_PATHS = !process.argv.includes("--no-paths");

const ROOTS = { iphone: "Prototypes/iPhone app/", web: "Prototypes/Crane Web/" };

/* ------------------------------------------------------------------ screen nouns */
// Keyed by the title under the root. Used to build default descriptions ("<noun> on mobile web (390).").
const NOUNS = {
    // iPhone
    "Global Nav": "The whole app",
    "Sign in ∕ Sign up/Flow": "Auth flow",
    "Sign in ∕ Sign up/Choose Home Course": "Home course picker",
    "Sign in ∕ Sign up/Forgot Password": "Forgot password",
    "Sign in ∕ Sign up/Sign In": "Sign in",
    "Sign in ∕ Sign up/Sign Up": "Sign up form",
    "Sign in ∕ Sign up/Signed In": "You're all set",
    "Sign in ∕ Sign up/Verify Email": "Verify email",
    "Sign in ∕ Sign up/Welcome": "Welcome",
    "Profile ∕ Account/Flow": "Profile tab",
    "Profile ∕ Account/Profile": "Profile root",
    "Profile ∕ Account/Account Balance": "Account balance",
    "Profile ∕ Account/Add Payment Method": "Add payment method",
    "Profile ∕ Account/Appearance": "Appearance",
    "Profile ∕ Account/Community": "Community",
    "Profile ∕ Account/Edit Profile": "Edit profile",
    "Profile ∕ Account/Gift Cards": "Gift cards",
    "Profile ∕ Account/Golf Buddies": "Golf buddies",
    "Profile ∕ Account/Kiosk Sign-In": "Kiosk sign-in",
    "Profile ∕ Account/Memberships": "Memberships",
    "Profile ∕ Account/Payment Methods": "Payment methods",
    "Profile ∕ Account/Punch Cards": "Punch cards",
    "Profile ∕ Account/Rain Checks": "Rain checks",
    "Profile ∕ Account/Waitlist": "Waitlist",
    "App Chrome/Bookings": "Bookings tab",
    "App Chrome/Home": "Home tee sheet",
    "App Chrome/Locations": "Course switcher",
    // Crane Web
    Flow: "The whole Crane Web app",
    "Tee Times/Checkout": "Tee time checkout",
    "Tee Times/Confirmation": "Tee time confirmation",
    "Tee Times/Flow": "Tee time flow",
    "Tee Times/My Rounds": "My Rounds",
    "Tee Times/Tee Times": "Tee sheet",
    "Shop/1. Shop": "Shop home",
    "Shop/2. Category": "Shop category",
    "Shop/3. Product": "Product page",
    "Shop/4. Cart": "Cart",
    "Shop/5. Add More": "Add More upsell",
    "Shop/6. Checkout": "Checkout",
    "Shop/7. Confirmation": "Order confirmation",
    "Shop/Gift Cards": "Gift card page",
    "Restaurant/Flow": "Restaurant flow",
    "Restaurant/Menu Item": "Menu item dialog",
    "Restaurant/Mixed Cart Dialog": "Mixed-cart dialog",
    "Restaurant/Restaurant": "Restaurant menu",
    "Events/Browse": "Events browse",
    "Events/Event Details": "Event details",
    "Events/Flow": "Events flow",
    "Clinics/Browse": "Clinics browse",
    "Clinics/Clinic Details": "Clinic details",
    "Leagues/Browse": "Leagues browse",
    "Leagues/League Details": "League details",
    "Activities/Simulator Bays": "Simulator bay booking",
    "Calendar/Calendar": "Calendar",
    "Profile ∕ Account/Activity": "Account activity",
    "Profile ∕ Account/Events": "My events",
    "Profile ∕ Account/Flow": "Account section",
    "Profile ∕ Account/Golf Buddies": "Golf buddies",
    "Profile ∕ Account/Memberships": "Memberships",
    "Profile ∕ Account/My Account": "My Account settings",
    "Profile ∕ Account/Overview": "Account overview",
    "Profile ∕ Account/Wallet": "Wallet",
    "Sign in ∕ Sign up/Choose Home Course": "Home course picker",
    "Sign in ∕ Sign up/Flow": "Auth flow",
    "Sign in ∕ Sign up/Forgot Password": "Forgot password",
    "Sign in ∕ Sign up/Sign In": "Sign in",
    "Sign in ∕ Sign up/Sign Up": "Sign up form",
    "Sign in ∕ Sign up/Verify Email": "Verify email",
    "Sign in ∕ Sign up/Welcome": "Welcome",
};

/* ------------------------------------------------------- hand-written descriptions */
// Keyed by story id, written without the "∕-" Storybook keeps in ids for the "∕" folders
// ("prototypes-crane-web-profile-account-…" for "prototypes-crane-web-profile-∕-account-…").
// Keep each under ~15 words, plain, about the state the story shows.
const DESCRIPTIONS = {
    // ---- iPhone · Global Nav
    "prototypes-iphone-app-global-nav--prototype": "The whole app, clickable: tab bar, course switcher and push navigation. Starts on Home.",
    "prototypes-iphone-app-global-nav--start-on-bookings": "The whole app, clickable, starting on the Bookings tab.",
    "prototypes-iphone-app-global-nav--start-on-profile": "The whole app, clickable, starting on the Profile tab.",
    // ---- iPhone · Sign in ∕ Sign up
    "prototypes-iphone-app-sign-in-sign-up-flow--flow": "Welcome → sign up → verify → home course → all set, or sign in. Clickable.",
    "prototypes-iphone-app-sign-in-sign-up-choose-home-course--default": "Course list with nothing picked yet.",
    "prototypes-iphone-app-sign-in-sign-up-choose-home-course--selected": "Two home courses picked; Continue is enabled.",
    "prototypes-iphone-app-sign-in-sign-up-choose-home-course--search": "Searching \"Sagamore\" with one course already picked.",
    "prototypes-iphone-app-sign-in-sign-up-forgot-password--default": "Email field and Send reset link.",
    "prototypes-iphone-app-sign-in-sign-up-forgot-password--sent": "Reset link sent to the member's email.",
    "prototypes-iphone-app-sign-in-sign-up-sign-in--default": "Empty email and password fields.",
    "prototypes-iphone-app-sign-in-sign-up-sign-in--error-state": "Wrong password: inline error under the fields.",
    "prototypes-iphone-app-sign-in-sign-up-sign-in--filled": "Email and password filled in, ready to sign in.",
    "prototypes-iphone-app-sign-in-sign-up-sign-up--empty": "Blank sign-up form; Create account is disabled.",
    "prototypes-iphone-app-sign-in-sign-up-sign-up--valid": "Every field filled and terms accepted; Create account is enabled.",
    "prototypes-iphone-app-sign-in-sign-up-signed-in--new-account": "\"You're all set\" after sign-up, listing the two chosen home courses.",
    "prototypes-iphone-app-sign-in-sign-up-signed-in--returning-member": "\"Welcome back\" after signing in to an existing account.",
    "prototypes-iphone-app-sign-in-sign-up-verify-email--default": "Six-digit code entry with the resend timer running.",
    "prototypes-iphone-app-sign-in-sign-up-verify-email--partly-entered": "Three digits typed; Resend code is available.",
    "prototypes-iphone-app-sign-in-sign-up-welcome--default": "First screen: Sign up with email or I already have an account.",
    // ---- iPhone · Profile ∕ Account
    "prototypes-iphone-app-profile-account-flow--flow": "Profile tab with every row pushing its real sub-screen. Clickable.",
    "prototypes-iphone-app-profile-account-profile--default": "Profile root: member card and every account row.",
    "prototypes-iphone-app-profile-account-profile--with-tab-bar": "Profile root under the floating tab bar, with a badge on Profile.",
    "prototypes-iphone-app-profile-account-profile--delete-account-alert": "Delete Account confirmation as a glass alert.",
    "prototypes-iphone-app-profile-account-account-balance--default": "Account balance with nothing owed.",
    "prototypes-iphone-app-profile-account-account-balance--balance-due": "A statement balance is due, with a Pay button.",
    "prototypes-iphone-app-profile-account-add-payment-method--default": "Card form with the course strip and CardConnect caption.",
    "prototypes-iphone-app-profile-account-appearance--default": "System / Light / Warm Dark preview cards.",
    "prototypes-iphone-app-profile-account-appearance--light-selected": "Light mode picked.",
    "prototypes-iphone-app-profile-account-community--default": "Community intro playing its animation.",
    "prototypes-iphone-app-profile-account-community--final": "Community screen after the intro animation has settled.",
    "prototypes-iphone-app-profile-account-edit-profile--default": "Name, email and phone fields; Save stays disabled until something changes.",
    "prototypes-iphone-app-profile-account-gift-cards--default": "Gift cards with balance, code and categories; expired cards dimmed.",
    "prototypes-iphone-app-profile-account-gift-cards--empty": "No gift cards yet.",
    "prototypes-iphone-app-profile-account-golf-buddies--default": "Buddy list with pending requests.",
    "prototypes-iphone-app-profile-account-golf-buddies--empty": "No buddies or requests yet.",
    "prototypes-iphone-app-profile-account-golf-buddies--invite-sheet": "Invite-a-buddy sheet open over the list.",
    "prototypes-iphone-app-profile-account-kiosk-sign-in--default": "QR code and sign-in code with a 30-second countdown.",
    "prototypes-iphone-app-profile-account-kiosk-sign-in--fast-expiry": "Same screen with a 5-second code, to watch it refresh.",
    "prototypes-iphone-app-profile-account-memberships--default": "Membership card with member ID and expiry.",
    "prototypes-iphone-app-profile-account-memberships--empty": "No memberships yet.",
    "prototypes-iphone-app-profile-account-payment-methods--default": "Saved cards with delete; + adds a card.",
    "prototypes-iphone-app-profile-account-payment-methods--no-cards": "No saved cards yet.",
    "prototypes-iphone-app-profile-account-punch-cards--default": "One usage bar per punchable product.",
    "prototypes-iphone-app-profile-account-punch-cards--empty": "No punch cards yet.",
    "prototypes-iphone-app-profile-account-rain-checks--default": "Remaining balance per check, Active or Used Up.",
    "prototypes-iphone-app-profile-account-rain-checks--empty": "No rain checks yet.",
    "prototypes-iphone-app-profile-account-waitlist--default": "Empty waitlist with a Join pill in the nav bar.",
    // ---- iPhone · App Chrome
    "prototypes-iphone-app-app-chrome-bookings--reservations": "Upcoming and past tee-time reservations.",
    "prototypes-iphone-app-app-chrome-bookings--purchases": "Purchases segment: past orders and receipts.",
    "prototypes-iphone-app-app-chrome-bookings--empty": "No reservations yet.",
    "prototypes-iphone-app-app-chrome-bookings--tee-time-details-past": "Details of a tee time that has already passed.",
    "prototypes-iphone-app-app-chrome-bookings--tee-time-details-upcoming": "Details of an upcoming tee time, with cancel.",
    "prototypes-iphone-app-app-chrome-bookings--purchase-details": "One purchase: items, totals and payment.",
    "prototypes-iphone-app-app-chrome-bookings--flow": "Bookings tab with its detail screens, clickable.",
    "prototypes-iphone-app-app-chrome-home--tee-sheet": "Course header, date strip and the day's tee times.",
    "prototypes-iphone-app-app-chrome-home--with-cart": "Tee sheet with two items in the cart.",
    "prototypes-iphone-app-app-chrome-home--configure-booking": "Configure Booking sheet for the second tee time.",
    "prototypes-iphone-app-app-chrome-home--booking-summary": "Booking Summary sheet before checkout.",
    "prototypes-iphone-app-app-chrome-locations--my-locations": "My Locations drawer from the hamburger.",
    "prototypes-iphone-app-app-chrome-locations--add-location": "Add a Location panel inside the drawer.",
    "prototypes-iphone-app-app-chrome-locations--course-info": "Course info sheet from the course name.",
    "prototypes-iphone-app-app-chrome-locations--course-info-with-photo": "Course info for a course with a hero photo.",

    // ---- Crane Web · Flow
    "prototypes-crane-web-flow--desktop": "Every area on one router; the header moves between sections.",
    "prototypes-crane-web-flow--desktop-sidebar-nav": "Same app with the sidebar shop nav instead of tabs.",
    "prototypes-crane-web-flow--guest": "The whole app signed out.",
    "prototypes-crane-web-flow--mobile-web": "The whole app on mobile web (390).",
    // ---- Tee Times
    "prototypes-crane-web-tee-times-checkout--one-player": "Checkout for one player, with the hold timer and Reserve.",
    "prototypes-crane-web-tee-times-checkout--two-players": "Checkout for two players: player rows and booking summary.",
    "prototypes-crane-web-tee-times-checkout--four-players": "Checkout for a full foursome.",
    "prototypes-crane-web-tee-times-checkout--hold-expired": "The 5:00 hold ran out; Reserve becomes Find another time.",
    "prototypes-crane-web-tee-times-checkout--mobile-web": "Summary collapses; Reserve and the hold timer stick to the bottom.",
    "prototypes-crane-web-tee-times-checkout--guest": "Signed out: sends you to sign in before reserving.",
    "prototypes-crane-web-tee-times-confirmation--desktop": "\"You're booked!\" receipt with add to calendar and manage booking.",
    "prototypes-crane-web-tee-times-confirmation--mobile-web": "Booking receipt on mobile web (390).",
    "prototypes-crane-web-tee-times-confirmation--inside-twenty-four-hours": "Booked for today, so it can't be cancelled online.",
    "prototypes-crane-web-tee-times-flow--flow": "Tee Times → Checkout → Confirmation → My Rounds, clickable.",
    "prototypes-crane-web-tee-times-flow--mobile-web": "The tee time flow on mobile web, clickable.",
    "prototypes-crane-web-tee-times-my-rounds--upcoming": "Upcoming rounds tab.",
    "prototypes-crane-web-tee-times-my-rounds--past": "Past rounds tab.",
    "prototypes-crane-web-tee-times-my-rounds--empty": "No rounds booked yet.",
    "prototypes-crane-web-tee-times-tee-times--desktop": "Course · Date · Players · Holes bar over a grid of tee times.",
    "prototypes-crane-web-tee-times-tee-times--mobile-web": "Tee sheet as the app's one-per-row list.",
    "prototypes-crane-web-tee-times-tee-times--multi-course": "Three nines at one course, filterable by starting nine.",
    "prototypes-crane-web-tee-times-tee-times--with-banner-and-ad": "Dismissible banner and a membership ad above the times.",
    "prototypes-crane-web-tee-times-tee-times--no-course-selected": "First visit: no course chosen yet; Select Course opens the picker.",
    "prototypes-crane-web-tee-times-tee-times--advance-date": "A day six weeks out picked from More dates.",
    "prototypes-crane-web-tee-times-tee-times--seven-day-course": "Course with a 7-day window: no More dates tile.",
    "prototypes-crane-web-tee-times-tee-times--no-times": "Closed day (aerification): no times, with a jump to the next day.",
    "prototypes-crane-web-tee-times-tee-times--indoor-venue": "Indoor-only venue: no tee sheet, points to simulator bays.",
    "prototypes-crane-web-tee-times-tee-times--indoor-venue-mobile": "Indoor-only venue on mobile web.",
    // ---- Shop
    "prototypes-crane-web-shop-1-shop--desktop-tabs": "Shop home with category tabs, filter chips and product grid.",
    "prototypes-crane-web-shop-1-shop--desktop-sidebar": "Shop home with the sidebar category nav instead of tabs.",
    "prototypes-crane-web-shop-1-shop--mobile-web-categories-open": "Mobile web with the category menu open.",
    "prototypes-crane-web-shop-2-category--tabs": "Golf balls category with subgroup tabs.",
    "prototypes-crane-web-shop-2-category--sidebar": "Golf balls category with the sidebar nav.",
    "prototypes-crane-web-shop-2-category--subgroup-selected": "Golf balls › Dozens selected.",
    "prototypes-crane-web-shop-2-category--subgroup-selected-sidebar": "Golf balls › Dozens in the sidebar layout.",
    "prototypes-crane-web-shop-2-category--empty": "On sale + $200 and up match nothing: the empty state.",
    "prototypes-crane-web-shop-2-category--mobile-web-search": "Mobile web, searching golf balls for \"titleist\".",
    "prototypes-crane-web-shop-3-product--default": "Shoe with gallery, size chips, quantity and Add to cart.",
    "prototypes-crane-web-shop-3-product--on-sale": "Apparel item on sale: sale price beside the original.",
    "prototypes-crane-web-shop-3-product--sold-out": "Sold-out item with Notify me instead of Add to cart.",
    "prototypes-crane-web-shop-3-product--food-item": "Snack-bar food item on the product page.",
    "prototypes-crane-web-shop-3-product--added-to-cart": "Pro V1 dozen added, with the inline confirmation.",
    "prototypes-crane-web-shop-3-product--mixed-cart-dialog": "Adding pro shop items to a food cart: check out separately.",
    "prototypes-crane-web-shop-4-cart--default": "Three retail items, order summary with fees and surcharge.",
    "prototypes-crane-web-shop-4-cart--promo-applied": "Promo code applied to the order summary.",
    "prototypes-crane-web-shop-4-cart--food-order": "Snack-bar food cart: pickup only.",
    "prototypes-crane-web-shop-4-cart--mixed-cart": "Food and pro shop items together: they check out separately.",
    "prototypes-crane-web-shop-4-cart--empty": "Empty cart.",
    "prototypes-crane-web-shop-4-cart--mobile-web": "Cart on mobile web with a sticky Checkout bar.",
    "prototypes-crane-web-shop-4-cart--click-through": "Cart → Checkout → Pay now → Confirmation, clickable.",
    "prototypes-crane-web-shop-5-add-more--default": "You-might-also-like grid with the free-shipping progress bar.",
    "prototypes-crane-web-shop-5-add-more--free-shipping-unlocked": "Cart over the threshold: free shipping unlocked.",
    "prototypes-crane-web-shop-5-add-more--mobile-web": "Progress bar on top, sticky Continue bar.",
    "prototypes-crane-web-shop-6-checkout--ship-to-ma": "Shipping to a Massachusetts address, with MA destination tax.",
    "prototypes-crane-web-shop-6-checkout--ship-to-ga": "Shipping to Georgia: the tax line changes with the address.",
    "prototypes-crane-web-shop-6-checkout--no-address-yet": "No ship-to address yet: tax shows Calculated after address.",
    "prototypes-crane-web-shop-6-checkout--pick-up": "Pick up at the course, taxed at the course.",
    "prototypes-crane-web-shop-6-checkout--food-order": "Food and drink order: pickup only.",
    "prototypes-crane-web-shop-6-checkout--installments": "Pay in installments plan selected.",
    "prototypes-crane-web-shop-6-checkout--add-address-modal": "Add address dialog open.",
    "prototypes-crane-web-shop-6-checkout--payment-methods-modal": "Payment methods dialog open (Pay another way).",
    "prototypes-crane-web-shop-6-checkout--mobile-web": "Mobile web with a sticky Pay button.",
    "prototypes-crane-web-shop-6-checkout--mobile-web-summary-open": "Mobile web with Show order summary expanded.",
    "prototypes-crane-web-shop-7-confirmation--shipped": "Shipped order receipt with the destination tax line.",
    "prototypes-crane-web-shop-7-confirmation--pickup": "Pro shop order for pickup at the course.",
    "prototypes-crane-web-shop-7-confirmation--snack-bar-pickup": "Snack-bar order for pickup: where, when, we'll text you.",
    "prototypes-crane-web-shop-7-confirmation--mobile-web": "Order receipt on mobile web (390).",
    "prototypes-crane-web-shop-gift-cards--choose": "Gift card builder: deals first, then a design and who it's for, with a sticky summary.",
    "prototypes-crane-web-shop-gift-cards--choose-mobile-web": "Gift card builder on mobile web, with a sticky You pay bar.",
    "prototypes-crane-web-shop-gift-cards--punch-card": "Punch card purchase: pick a pack.",
    "prototypes-crane-web-shop-gift-cards--punch-card-mobile": "Punch card purchase on mobile web.",
    // ---- Restaurant
    "prototypes-crane-web-restaurant-flow--flow": "Menu → item → order rail → cart, clickable.",
    "prototypes-crane-web-restaurant-flow--mobile-web": "The restaurant flow on mobile web, clickable.",
    "prototypes-crane-web-restaurant-menu-item--burger": "Bacon cheeseburger with modifier choices and priced add-ons.",
    "prototypes-crane-web-restaurant-menu-item--burger-mobile": "Burger modifiers as a mobile web sheet.",
    "prototypes-crane-web-restaurant-menu-item--drink": "House wine: pour size and a 21+ notice.",
    "prototypes-crane-web-restaurant-menu-item--coffee": "Hot coffee with a size choice.",
    "prototypes-crane-web-restaurant-mixed-cart-dialog--mixed-cart": "Burger over a pro shop cart: View cart or Clear cart and add.",
    "prototypes-crane-web-restaurant-mixed-cart-dialog--mixed-cart-mobile": "Mixed-cart dialog on mobile web.",
    "prototypes-crane-web-restaurant-mixed-cart-dialog--pro-shop-cart-rail": "Pro shop cart in progress: notice in the order rail.",
    "prototypes-crane-web-restaurant-restaurant--desktop": "Menu sections with the order rail on the right.",
    "prototypes-crane-web-restaurant-restaurant--category-deep-link": "One menu section; one item is 86'd (Sold out today).",
    "prototypes-crane-web-restaurant-restaurant--with-order-in-progress": "Order started: burger with modifiers, fries, two drinks.",
    "prototypes-crane-web-restaurant-restaurant--with-order-mobile": "The rail becomes a sticky View order bar.",
    "prototypes-crane-web-restaurant-restaurant--order-sheet-mobile": "Order open as a bottom sheet on mobile web.",
    "prototypes-crane-web-restaurant-restaurant--closed-order-ahead": "9:15 PM: closed, so it orders for tomorrow from 8:00 AM.",
    "prototypes-crane-web-restaurant-restaurant--closed-mobile": "Closed / order ahead on mobile web.",
    "prototypes-crane-web-restaurant-restaurant--after-breakfast": "12:40 PM: breakfast items show Until 11 AM and can't be added.",
    "prototypes-crane-web-restaurant-restaurant--pickup-time": "Pickup time picker open.",
    "prototypes-crane-web-restaurant-restaurant--pickup-time-mobile": "Pickup time picker on mobile web.",
    // ---- Events
    "prototypes-crane-web-events-browse--desktop": "Filter chips over a photo card grid with status pills and prices.",
    "prototypes-crane-web-events-browse--mobile-web": "Chips scroll sideways; the grid drops to one column.",
    "prototypes-crane-web-events-browse--charity-filter": "Charity filter on.",
    "prototypes-crane-web-events-browse--no-results": "Tournament + Charity matches nothing: the empty state.",
    "prototypes-crane-web-events-event-details--desktop": "Fall Foliage Scramble: hero, details and a sticky register card.",
    "prototypes-crane-web-events-event-details--mobile-web": "Register card under the title; sticky Register bar.",
    "prototypes-crane-web-events-event-details--with-guests": "Two buddies and a guest added, with guest pricing.",
    "prototypes-crane-web-events-event-details--registration-dialog": "Registration confirmation dialog.",
    "prototypes-crane-web-events-event-details--registration-done": "Registration done: Add to calendar and Share.",
    "prototypes-crane-web-events-event-details--registered": "Already registered for this event.",
    "prototypes-crane-web-events-event-details--charity-few-spots": "Charity event with donations, fundraising progress and few spots left.",
    "prototypes-crane-web-events-event-details--full-waitlist": "Event is full: join the waitlist.",
    "prototypes-crane-web-events-event-details--full-waitlist-dialog": "Waitlist confirmation dialog.",
    "prototypes-crane-web-events-event-details--mobile-waitlist": "Full event's waitlist on mobile web.",
    "prototypes-crane-web-events-event-details--members-only-team": "Members-only team event.",
    "prototypes-crane-web-events-event-details--members-only-signed-out": "Members-only event while signed out.",
    "prototypes-crane-web-events-event-details--free": "Free junior event.",
    "prototypes-crane-web-events-flow--desktop": "Browse → details → register, plus Clinics, Leagues, Activities, Calendar.",
    "prototypes-crane-web-events-flow--mobile-web": "The events flow on mobile web, clickable.",
    // ---- Clinics
    "prototypes-crane-web-clinics-browse--desktop": "Clinic cards: level, focus, sessions, instructor, price, spots.",
    "prototypes-crane-web-clinics-browse--beginner": "Filtered to Beginner.",
    "prototypes-crane-web-clinics-clinic-details--desktop": "Multi-week series with session schedule and a few spots left.",
    "prototypes-crane-web-clinics-clinic-details--junior": "Junior academy clinic.",
    "prototypes-crane-web-clinics-clinic-details--single-session": "One-off clinic, single session.",
    "prototypes-crane-web-clinics-clinic-details--full-waitlist": "Clinic is full: join the waitlist.",
    "prototypes-crane-web-clinics-clinic-details--reserve-dialog": "Reserve confirmation dialog.",
    "prototypes-crane-web-clinics-clinic-details--reserved": "Already reserved for this clinic.",
    // ---- Leagues
    "prototypes-crane-web-leagues-browse--desktop": "League cards plus a Your league strip linking to standings.",
    "prototypes-crane-web-leagues-browse--signed-out": "Leagues while signed out: no Your league strip.",
    "prototypes-crane-web-leagues-league-details--your-league-standings": "A league you play: standings with your place and points.",
    "prototypes-crane-web-leagues-league-details--your-league-schedule": "A league you play: the schedule tab.",
    "prototypes-crane-web-leagues-league-details--team-signup": "Registration open: sign up with a partner or join solo.",
    "prototypes-crane-web-leagues-league-details--team-signup-dialog": "Team signup confirmation dialog.",
    "prototypes-crane-web-leagues-league-details--mid-season-join": "League in season: prorated join for individuals.",
    "prototypes-crane-web-leagues-league-details--full-waitlist": "League is full: join the waitlist.",
    "prototypes-crane-web-leagues-league-details--mobile-standings": "Standings tab on mobile web.",
    // ---- Activities
    "prototypes-crane-web-activities-simulator-bays--desktop": "Date → players → duration → bay → start time.",
    "prototypes-crane-web-activities-simulator-bays--time-selected": "Bay 2 at 6 PM for six players, window highlighted.",
    "prototypes-crane-web-activities-simulator-bays--big-group": "Eight players for two hours: small bays are disabled.",
    "prototypes-crane-web-activities-simulator-bays--book-dialog": "Booking confirmation dialog.",
    "prototypes-crane-web-activities-simulator-bays--mobile-time-selected": "Mobile web with a 3 PM start picked.",
    "prototypes-crane-web-activities-simulator-bays--flo-golf-indoor": "Indoor-only venue: its own bay photo, no driving range.",
    // ---- Calendar
    "prototypes-crane-web-calendar-calendar--month": "Events, clinics and league nights in a color-coded month grid.",
    "prototypes-crane-web-calendar-calendar--list": "The same feed as a list.",
    "prototypes-crane-web-calendar-calendar--clinics-only": "Month grid filtered to clinics.",
    "prototypes-crane-web-calendar-calendar--november": "Month grid paged to November.",
    "prototypes-crane-web-calendar-calendar--mobile-web": "Mobile web opens on the list.",
    "prototypes-crane-web-calendar-calendar--mobile-month": "Mobile month grid with dots and the day's list below.",
    // ---- Profile ∕ Account
    "prototypes-crane-web-profile-account-activity--desktop": "Upcoming tab of reservations; each tab is a deep link.",
    "prototypes-crane-web-profile-account-activity--past": "Past bookings tab.",
    "prototypes-crane-web-profile-account-activity--purchases": "Purchases tab.",
    "prototypes-crane-web-profile-account-activity--receipt": "One order's receipt, opened from Purchases.",
    "prototypes-crane-web-profile-account-activity--mobile-purchases": "Purchases tab on mobile web.",
    "prototypes-crane-web-profile-account-events--desktop": "Events you're registered for, upcoming and past.",
    "prototypes-crane-web-profile-account-events--event-details": "One registered event opened in detail.",
    "prototypes-crane-web-profile-account-events--empty": "No events yet.",
    "prototypes-crane-web-profile-account-flow--desktop": "Every account page on one router, clickable.",
    "prototypes-crane-web-profile-account-flow--mobile-web": "The account section on mobile web, clickable.",
    "prototypes-crane-web-profile-account-golf-buddies--desktop": "Buddy list with pending requests.",
    "prototypes-crane-web-profile-account-golf-buddies--invite": "Invite-a-buddy dialog open.",
    "prototypes-crane-web-profile-account-golf-buddies--empty": "No buddies or requests yet.",
    "prototypes-crane-web-profile-account-memberships--desktop": "Active member: membership card with ID and expiry.",
    "prototypes-crane-web-profile-account-memberships--non-member": "No membership: join prompt.",
    "prototypes-crane-web-profile-account-memberships--expired": "Only an expired membership.",
    "prototypes-crane-web-profile-account-memberships--mobile-non-member": "Non-member on mobile web.",
    "prototypes-crane-web-profile-account-my-account--desktop": "Inline-edit profile rows, payment methods, appearance and kiosk QR.",
    "prototypes-crane-web-profile-account-my-account--editing-name": "Name field in edit mode.",
    "prototypes-crane-web-profile-account-my-account--add-card": "Add card dialog open.",
    "prototypes-crane-web-profile-account-my-account--add-card-mobile": "Add card as a mobile web bottom sheet.",
    "prototypes-crane-web-profile-account-my-account--delete-account": "Delete account confirmation.",
    "prototypes-crane-web-profile-account-overview--desktop": "Side nav, at-a-glance stats, Upcoming list and Golf Buddies.",
    "prototypes-crane-web-profile-account-overview--non-member": "No active membership: join banner above the stats.",
    "prototypes-crane-web-profile-account-wallet--desktop": "Account balance with recent activity, punch cards, gift cards and rain checks.",
    "prototypes-crane-web-profile-account-wallet--balance-due": "A $48.50 statement balance is due.",
    "prototypes-crane-web-profile-account-wallet--pay-balance": "Pay balance dialog open.",
    "prototypes-crane-web-profile-account-wallet--buy-gift-card": "Wallet on the app router: Buy a gift card opens the builder.",
    "prototypes-crane-web-profile-account-wallet--mobile-web": "Wallet with a balance due on mobile web.",
    // ---- Sign in ∕ Sign up
    "prototypes-crane-web-sign-in-sign-up-choose-home-course--desktop": "Two home courses picked.",
    "prototypes-crane-web-sign-in-sign-up-choose-home-course--mobile-web": "One home course picked, on mobile web.",
    "prototypes-crane-web-sign-in-sign-up-choose-home-course--no-results": "Search for \"Pebble\" finds nothing.",
    "prototypes-crane-web-sign-in-sign-up-flow--flow": "Sign in, sign up, verify, home course: clickable end to end.",
    "prototypes-crane-web-sign-in-sign-up-flow--mobile-web": "The auth flow on mobile web, clickable.",
    "prototypes-crane-web-sign-in-sign-up-flow--with-next": "Arrives from checkout with ?next=, so sign-in returns there.",
    "prototypes-crane-web-sign-in-sign-up-forgot-password--default": "Email field and Send reset link.",
    "prototypes-crane-web-sign-in-sign-up-forgot-password--sent": "Reset link sent.",
    "prototypes-crane-web-sign-in-sign-up-sign-in--default": "Brand panel beside an empty sign-in form.",
    "prototypes-crane-web-sign-in-sign-up-sign-in--error-state": "Wrong password: inline error.",
    "prototypes-crane-web-sign-in-sign-up-sign-up--empty": "Blank sign-up form.",
    "prototypes-crane-web-sign-in-sign-up-sign-up--valid": "Every field filled and terms accepted.",
    "prototypes-crane-web-sign-in-sign-up-verify-email--default": "Six-digit code entry.",
    "prototypes-crane-web-sign-in-sign-up-verify-email--partly-entered": "Three digits typed; Resend code available.",
    "prototypes-crane-web-sign-in-sign-up-welcome--new-account": "\"You're all set\" after sign-up, with the chosen courses.",
    "prototypes-crane-web-sign-in-sign-up-welcome--welcome-back": "\"Welcome back\" after signing in.",
};

/* ------------------------------------------------------- iPhone prototype routes */
// Prototype hash route per iPhone screen (from src/prototype-app/presenter.tsx), by title under the root.
const IPHONE_ROUTES = {
    "Global Nav": "/home",
    "Sign in ∕ Sign up/Flow": "/auth/welcome",
    "Sign in ∕ Sign up/Welcome": "/auth/welcome",
    "Sign in ∕ Sign up/Sign In": "/auth/welcome/sign-in",
    "Sign in ∕ Sign up/Forgot Password": "/auth/welcome/sign-in/forgot-password",
    "Sign in ∕ Sign up/Sign Up": "/auth/welcome/sign-up",
    "Sign in ∕ Sign up/Verify Email": "/auth/welcome/sign-up/verify-email",
    "Sign in ∕ Sign up/Choose Home Course": "/auth/welcome/sign-up/verify-email/home-course",
    "Profile ∕ Account/Flow": "/profile",
    "Profile ∕ Account/Profile": "/profile",
    "Profile ∕ Account/Edit Profile": "/profile/edit-profile",
    "Profile ∕ Account/Account Balance": "/profile/account-balance",
    "Profile ∕ Account/Payment Methods": "/profile/payment-methods",
    "Profile ∕ Account/Add Payment Method": "/profile/payment-methods/add-payment-method",
    "Profile ∕ Account/Golf Buddies": "/profile/golf-buddies",
    "Profile ∕ Account/Memberships": "/profile/memberships",
    "Profile ∕ Account/Waitlist": "/profile/waitlist",
    "Profile ∕ Account/Punch Cards": "/profile/punch-cards",
    "Profile ∕ Account/Rain Checks": "/profile/rain-checks",
    "Profile ∕ Account/Gift Cards": "/profile/gift-cards",
    "Profile ∕ Account/Appearance": "/profile/appearance",
    "Profile ∕ Account/Community": "/profile/community",
    "Profile ∕ Account/Kiosk Sign-In": "/profile/kiosk-sign-in",
    "App Chrome/Home": "/home",
    "App Chrome/Locations": "/home",
    "App Chrome/Bookings": "/bookings",
};
const IPHONE_STORY_ROUTES = { // keyed like DESCRIPTIONS
    "prototypes-iphone-app-global-nav--start-on-bookings": "/bookings",
    "prototypes-iphone-app-global-nav--start-on-profile": "/profile",
    "prototypes-iphone-app-app-chrome-bookings--tee-time-details-past": "/bookings/tee-time-details:b-2",
    "prototypes-iphone-app-app-chrome-bookings--tee-time-details-upcoming": "/bookings/tee-time-details:b-1",
    "prototypes-iphone-app-app-chrome-bookings--purchase-details": "/bookings/purchase-details:p-1",
};

/* -------------------------------------------------------------------- helpers */

const clean = (s) =>
    s
        .replace(/^\s*\*\s?/gm, "")
        .replace(/\*\*/g, "")
        .replace(/`/g, "")
        .replace(/\\(["'`])/g, "$1")
        .replace(/\s+/g, " ")
        .trim();

const firstSentence = (s) => s.split(/(?<=[.!?])\s+(?=[A-Z(“"])/)[0];

/** Story-level description from the source: parameters.docs.description.story, else the JSDoc right above the export. */
const sourceDescription = (src, exportName) => {
    const m = new RegExp(`export const ${exportName}\\b`).exec(src);
    if (!m) return null;
    const before = src.slice(0, m.index);
    const rest = src.slice(m.index + 1);
    const stop = rest.search(/\n(?:export |\/\*\*|const |function |type )/);
    const body = stop < 0 ? rest : rest.slice(0, stop);
    const sd = /story:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/.exec(body);
    if (sd) return clean(sd[1].slice(1, -1));
    const start = before.lastIndexOf("/**");
    const end = before.lastIndexOf("*/");
    if (start >= 0 && end > start && before.slice(end + 2).trim() === "") return clean(before.slice(start + 3, end));
    return null;
};

/** A literal `path="/…"` in the story's render, if there is one. */
const staticPath = (src, exportName) => {
    const m = new RegExp(`export const ${exportName}\\b`).exec(src);
    if (!m) return undefined;
    const rest = src.slice(m.index + 1);
    const stop = rest.search(/\n(?:export |\/\*\*|const |function |type )/);
    const body = stop < 0 ? rest : rest.slice(0, stop);
    const p = /\bpath=(?:"([^"]*)"|\{"([^"]*)"\}|\{`([^`$]*)`\})/.exec(body);
    return p ? (p[1] ?? p[2] ?? p[3]) : undefined;
};

const defaultDescription = (noun, name) => {
    const rules = [
        [/^Desktop$/, () => `${noun} at desktop width (1440).`],
        [/^Laptop$/, () => `${noun} at laptop width (1024).`],
        [/^Mobile web$/, () => `${noun} on mobile web (390).`],
        [/^(.+?) · Mobile web$|^(.+?) \(mobile web\)$/, (m) => `${m[1] ?? m[2]}, on mobile web (390).`],
        [/^Default$/, () => `${noun}, default state.`],
        [/^Empty$/, () => `${noun} with nothing to show: the empty state.`],
        [/^Flow( \(clickable\))?$/, () => `${noun}, clickable end to end.`],
        [/^Background · (.+)$/, (m) => `Brand panel uses the ${m[1]} course photo instead of plain green.`],
    ];
    for (const [re, fn] of rules) {
        const m = re.exec(name);
        if (m) return fn(m);
    }
    return `${noun}: ${name.charAt(0).toLowerCase()}${name.slice(1)}.`;
};

/** DESCRIPTIONS / IPHONE_STORY_ROUTES key for a story id. */
const keyOf = (id) => id.replace(/∕-/g, "");

const words = (s) => s.split(/\s+/).filter(Boolean).length;

/* ----------------------------------------------------------------------- main */

const res = await fetch(`${BASE}/index.json`).catch(() => null);
if (!res?.ok) {
    console.error(`Couldn't read ${BASE}/index.json — start Storybook first (npm run storybook).`);
    process.exit(1);
}
const index = await res.json();
const entries = Object.values(index.entries);
const known = new Set(entries.map((e) => e.id));
const knownKeys = new Set(entries.map((e) => keyOf(e.id)));

const stale = [...Object.keys(DESCRIPTIONS), ...Object.keys(IPHONE_STORY_ROUTES)].filter((k) => !knownKeys.has(k));
if (stale.length) throw new Error(`DESCRIPTIONS keys that are no longer stories:\n  ${stale.join("\n  ")}`);

const srcCache = new Map();
const source = (p) => {
    if (!srcCache.has(p)) srcCache.set(p, fs.readFileSync(path.join(ROOT, p), "utf8"));
    return srcCache.get(p);
};

const build = (key) => {
    const root = ROOTS[key];
    const stories = entries.filter((e) => e.type === "story" && e.title.startsWith(root));
    return stories.map((e) => {
        const rel = e.title.slice(root.length);
        const parts = rel.split("/");
        const src = source(e.importPath);
        const noun = NOUNS[rel] ?? parts.at(-1);
        let description = DESCRIPTIONS[keyOf(e.id)];
        let source_ = "override";
        if (!description) {
            const fromSrc = sourceDescription(src, e.exportName);
            if (fromSrc) {
                description = firstSentence(fromSrc);
                source_ = "source";
            } else {
                description = defaultDescription(noun, e.name);
                source_ = "default";
            }
        }
        if (words(description) > 18) console.warn(`  long (${words(description)} words, ${source_}): ${e.id}`);
        const row = { id: e.id, group: parts[0], area: parts.join(" · "), name: e.name, description };
        if (key === "iphone") {
            const r = IPHONE_STORY_ROUTES[keyOf(e.id)] ?? IPHONE_ROUTES[rel];
            if (r) row.path = r;
        } else {
            const p = staticPath(src, e.exportName);
            if (p) row.path = p;
        }
        return { row, source: source_ };
    });
};

const iphone = build("iphone");
const web = build("web");

/* Resolve Crane Web paths from the rendered address bar (handles computed paths). */
if (RESOLVE_PATHS) {
    const { createRequire } = await import("node:module");
    const { chromium } = createRequire(path.join(ROOT, "package.json"))("playwright");
    const browser = await chromium.launch();
    const queue = [...web];
    let failed = 0;
    const worker = async () => {
        const page = await browser.newPage();
        for (let item; (item = queue.shift()); ) {
            await page.goto(`${BASE}/iframe.html?id=${item.row.id}&viewMode=story`);
            const h = await page
                .waitForFunction(() => [...document.querySelectorAll("#storybook-root span")].map((s) => s.textContent).find((t) => t?.startsWith("crane.tenfore.golf/")), null, { timeout: 15000 })
                .catch(() => null);
            const text = h ? await h.jsonValue() : null;
            if (text) item.row.path = text.replace(/^crane\.tenfore\.golf/, "");
            else failed++;
        }
        await page.close();
    };
    await Promise.all(Array.from({ length: 6 }, worker));
    await browser.close();
    if (failed) console.warn(`  ${failed} Crane Web stories had no address bar; kept their static path (if any).`);
}

/* Assertions */
for (const [key, rows] of [["iphone", iphone], ["web", web]]) {
    const expected = entries.filter((e) => e.type === "story" && e.title.startsWith(ROOTS[key])).length;
    if (rows.length !== expected) throw new Error(`${key}: ${rows.length} rows but ${expected} stories under ${ROOTS[key]}`);
    for (const { row } of rows) if (!known.has(row.id)) throw new Error(`Unknown story id ${row.id}`);
}

const fmt = (rows) => rows.map(({ row }) => `    ${JSON.stringify(row)},`).join("\n");
const out = `// Generated by scripts/gen-screen-index.mjs — do not edit by hand.
// Edit descriptions in that script (DESCRIPTIONS / NOUNS), then run it with Storybook up:
//   node scripts/gen-screen-index.mjs
// Rows are in sidebar order. ${iphone.length} iPhone app stories · ${web.length} Crane Web stories.

export interface ScreenIndexRow {
    /** Storybook story id. */
    id: string;
    /** Top-level folder under the prototype root ("Shop", "Profile ∕ Account"). */
    group: string;
    /** Full sidebar path under the root, joined with " · ". */
    area: string;
    /** Story name as shown in the sidebar. */
    name: string;
    /** One line on the state the story shows. */
    description: string;
    /** Prototype route: Crane Web path (address bar) or iPhone hash route. */
    path?: string;
}

export const IPHONE_SCREENS: ScreenIndexRow[] = [
${fmt(iphone)}
];

export const CRANE_WEB_SCREENS: ScreenIndexRow[] = [
${fmt(web)}
];
`;
fs.writeFileSync(OUT, out);

const tally = (rows) => rows.reduce((t, { source: s }) => ((t[s] = (t[s] ?? 0) + 1), t), {});
console.log(`✓ ${path.relative(ROOT, OUT)}`);
console.log(`  iPhone app: ${iphone.length} stories`, tally(iphone));
console.log(`  Crane Web:  ${web.length} stories (${web.filter(({ row }) => row.path).length} with a prototype path)`, tally(web));
