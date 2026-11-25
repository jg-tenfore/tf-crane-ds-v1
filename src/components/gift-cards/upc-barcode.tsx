/**
 * A UPC-A barcode drawn as SVG: 11 digits plus a check digit, in the standard 95-module layout
 * (guard bars, six left digits, centre guard, six right digits, guard bars). Scannable, so a
 * gift card can be rung up at the Pro Shop from the email or the wallet.
 */
import { cx } from "@/utils/cx";

const L_CODES = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
/** Right-hand digits are the left-hand patterns inverted. */
const R_CODES = L_CODES.map((code) => code.replace(/./g, (bit) => (bit === "1" ? "0" : "1")));

/** The UPC-A check digit for 11 digits. */
export const upcCheckDigit = (digits11: string) => {
    const d = digits11.split("").map(Number);
    const odd = d.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
    const even = d.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0);
    return (10 - ((odd * 3 + even) % 10)) % 10;
};

/** 11 digits become 12 with the check digit; 12 digits are used as given. */
export const toUpc = (digits: string) => {
    const clean = digits.replace(/\D/g, "");
    if (clean.length === 12) return clean;
    if (clean.length !== 11) throw new Error(`UPC-A needs 11 or 12 digits, got ${clean.length}`);
    return clean + upcCheckDigit(clean);
};

/** "0 84721 03556 5", the way UPC-A digits are printed under the bars. */
export const formatUpc = (digits: string) => {
    const upc = toUpc(digits);
    return `${upc[0]} ${upc.slice(1, 6)} ${upc.slice(6, 11)} ${upc[11]}`;
};

/** The 95 modules as "1" (bar) and "0" (space). */
const modules = (upc: string) => {
    const left = upc
        .slice(0, 6)
        .split("")
        .map((n) => L_CODES[Number(n)]);
    const right = upc
        .slice(6)
        .split("")
        .map((n) => R_CODES[Number(n)]);
    return "101" + left.join("") + "01010" + right.join("") + "101";
};

/**
 * With digits: the classic UPC-A look (longer guard bars, digits underneath). Without: a plain
 * block of bars like the live gift card email, which sizes to its className (about 2:1 wide).
 */
export const UpcBarcode = ({ value, showDigits = false, className }: { value: string; showDigits?: boolean; className?: string }) => {
    const upc = toUpc(value);
    const bits = modules(upc);
    const quiet = showDigits ? 9 : 0;
    const width = bits.length + quiet * 2;
    const barH = 60;
    const guardH = showDigits ? 66 : barH;
    // Guard bars run longer than the digit bars when the digits are printed.
    const isGuard = (i: number) => i < 3 || (i >= 45 && i < 50) || i >= 92;

    return (
        <svg
            viewBox={`0 0 ${width} ${showDigits ? 76 : barH}`}
            preserveAspectRatio={showDigits ? undefined : "none"}
            className={cx(showDigits ? "h-20 w-auto" : "h-[88px] w-[190px]", "text-fg-primary", className)}
            role="img"
            aria-label={`Barcode ${formatUpc(upc)}`}
            shapeRendering="crispEdges"
        >
            {bits
                .split("")
                .map((bit, i) => (bit === "1" ? <rect key={i} x={quiet + i} y={0} width={1} height={isGuard(i) ? guardH : barH} fill="currentColor" /> : null))}
            {showDigits && (
                <g fill="currentColor" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" textAnchor="middle">
                    <text x={quiet - 4} y={74}>
                        {upc[0]}
                    </text>
                    <text x={quiet + 27.5} y={74} letterSpacing="2.2">
                        {upc.slice(1, 6)}
                    </text>
                    <text x={quiet + 67.5} y={74} letterSpacing="2.2">
                        {upc.slice(6, 11)}
                    </text>
                    <text x={quiet + 95 + 4} y={74}>
                        {upc[11]}
                    </text>
                </g>
            )}
        </svg>
    );
};
