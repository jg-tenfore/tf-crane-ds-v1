import { useMemo } from "react";
import qrcode from "qrcode-generator";
import { cx } from "@/utils/cx";

export interface QRCodeProps {
    value: string;
    /** Rendered size in pt. */
    size?: number;
    className?: string;
}

/** Scannable QR code drawn as a single SVG path (kiosk sign-in, wallet pass). */
export const QRCode = ({ value, size = 220, className }: QRCodeProps) => {
    const { d, n } = useMemo(() => {
        const qr = qrcode(0, "M");
        qr.addData(value);
        qr.make();
        const count = qr.getModuleCount();
        let path = "";
        for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
        return { d: path, n: count };
    }, [value]);

    return (
        <svg role="img" aria-label="QR code" viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} shapeRendering="crispEdges" className={cx("text-black", className)}>
            <path d={d} fill="currentColor" />
        </svg>
    );
};
