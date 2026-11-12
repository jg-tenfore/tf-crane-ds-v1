import type { CSSProperties, ReactNode } from "react";

/**
 * Flat device mockups for the docs: real prototype screenshots (public/prototype-preview/screens/)
 * in CSS-drawn outline frames. The stage is an inline-size container, so all sizes are in `cqw`
 * (percent of the stage's width) and the whole scene scales with the docs column.
 *
 * To refresh: re-capture the screenshots from the prototypes (full-window, 1440×900 @2x for desktop,
 * 390×844 @3x for mobile web, 402×874 @3x for the iPhone app) and save them as WebP with the same names.
 *
 * Docs pages restyle img/figure margins, so layout-critical styles are inline.
 */

const src = (name: string) => `prototype-preview/screens/${name}.webp`;

interface FrameProps {
  /** Width as a percentage of the stage (cqw). */
  w: number;
  screen: string;
  style?: CSSProperties;
}

/** Outline browser window: a faint bar with three dots and the address, then a 16:10 page. */
const BrowserFrame = ({
  w,
  screen,
  style,
  url,
}: FrameProps & { url: string }) => {
  const bar = w * 0.034;
  return (
    <div
      style={{
        position: "absolute",
        width: `${w}cqw`,
        borderRadius: `${w * 0.012}cqw`,
        overflow: "hidden",
        background: "rgba(255,255,255,0.04)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.22)",
        ...style,
      }}
    >
      <div
        style={{
          height: `${bar}cqw`,
          display: "flex",
          alignItems: "center",
          gap: `${w * 0.006}cqw`,
          padding: `0 ${w * 0.014}cqw`,
          background: "rgba(255,255,255,0.06)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: `${w * 0.007}cqw`,
              height: `${w * 0.007}cqw`,
              borderRadius: 999,
              background: "rgba(255,255,255,0.35)",
            }}
          />
        ))}
        <span
          style={{
            margin: "0 auto",
            width: "42%",
            height: `${bar * 0.56}cqw`,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
            fontSize: `${w * 0.0105}cqw`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {url}
        </span>
        <span style={{ width: `${w * 0.035}cqw` }} />
      </div>
      <img
        src={src(screen)}
        alt=""
        style={{ display: "block", width: "100%", height: "auto", margin: 0 }}
      />
    </div>
  );
};

/**
 * Outline phone: even bezel, Dynamic Island, rounded screen. `statusBar` adds a white strip above
 * a web screenshot captured without one (mobile web), so the island never covers content.
 */
const PhoneFrame = ({
  w,
  screen,
  style,
  statusBar = false,
}: FrameProps & { statusBar?: boolean }) => (
  <div
    style={{
      position: "absolute",
      width: `${w}cqw`,
      padding: `${w * 0.034}cqw`,
      borderRadius: `${w * 0.17}cqw`,
      background: "rgba(255,255,255,0.04)",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.28)",
      ...style,
    }}
  >
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: `${w * 0.135}cqw`,
        background: "#fff",
      }}
    >
      {statusBar && (
        <div style={{ height: `${w * 0.13}cqw`, background: "#fff" }} />
      )}
      <img
        src={src(screen)}
        alt=""
        style={{ display: "block", width: "100%", height: "auto", margin: 0 }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: `${w * 0.035}cqw`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "30%",
          height: `${w * 0.085}cqw`,
          borderRadius: 999,
          background: "#0b0b0b",
        }}
      />
    </div>
  </div>
);

/** Caps label under a device (absolute, centred on `x`). */
const Label = ({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: ReactNode;
}) => (
  <span
    style={{
      position: "absolute",
      left: `${x}cqw`,
      top: `${y}cqw`,
      transform: "translateX(-50%)",
      whiteSpace: "nowrap",
      fontFamily: "'Outfit Variable', system-ui, sans-serif",
      fontSize: "0.95cqw",
      fontWeight: 600,
      letterSpacing: "0.18cqw",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.7)",
    }}
  >
    {children}
  </span>
);

/**
 * Green stage — outline devices on Crane green: the iPhone app, Crane Web on desktop and Crane Web
 * on mobile, each labelled. Used as the banner on the Crane Web card in the Introduction.
 */
export const MockupStage = ({ radius = 24 }: { radius?: number | string }) => (
  <div
    role="img"
    aria-label="The Crane iPhone app beside Crane Web on desktop and on mobile web"
    className="not-prose"
    style={{
      position: "relative",
      containerType: "inline-size",
      width: "100%",
      aspectRatio: "16 / 7.7",
      overflow: "hidden",
      borderRadius: radius,
      background:
        "radial-gradient(120% 90% at 50% 0%, #2c7c4d 0%, #1a4a2f 45%, #0f2a1b 100%)",
    }}
  >
    <PhoneFrame
      w={14}
      screen="iphone-home"
      style={{ left: "5cqw", top: "6.5cqw" }}
    />
    <BrowserFrame
      w={52}
      screen="web-desktop-tee-times"
      style={{ left: "24cqw", top: "5cqw" }}
      url="crane.tenfore.golf/tee-times"
    />
    <PhoneFrame
      w={14}
      screen="web-mobile-events"
      statusBar
      style={{ right: "5cqw", top: "5.5cqw" }}
    />
    <Label x={12} y={42}>
      Crane app · iPhone
    </Label>
    <Label x={50} y={42}>
      Crane Web · desktop
    </Label>
    <Label x={88} y={42}>
      Crane Web · mobile
    </Label>
  </div>
);
