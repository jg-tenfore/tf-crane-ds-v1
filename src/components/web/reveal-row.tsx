import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cx } from "@/utils/cx";

/**
 * For horizontally scrolling tab/chip rows: when the current item (`aria-current="page"`) is
 * off-screen — e.g. a deep link straight to /restaurant/beer on mobile web — scroll the row (not
 * the page) so it sits in view. Uses offsets, not getBoundingClientRect, so it is correct inside
 * a scaled WebFrame. The row must be the items' offsetParent (give it `relative`).
 */
export const useRevealCurrent = <T extends HTMLElement>(dep: unknown) => {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const row = ref.current;
    const el = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !el) return;
    const start = el.offsetLeft;
    const end = start + el.offsetWidth;
    if (start >= row.scrollLeft && end <= row.scrollLeft + row.clientWidth)
      return;
    row.scrollLeft = Math.max(
      0,
      start - (row.clientWidth - el.offsetWidth) / 2,
    );
  }, [dep]);
  return ref;
};

/** A horizontally scrolling `<nav>` row that keeps its current item in view (see useRevealCurrent). */
export const RevealRow = ({
  label,
  current,
  className,
  children,
}: {
  label: string;
  current: unknown;
  className?: string;
  children: ReactNode;
}) => {
  const ref = useRevealCurrent<HTMLElement>(current);
  return (
    <nav ref={ref} aria-label={label} className={cx("relative", className)}>
      {children}
    </nav>
  );
};
