import { CaretCoordinates } from "@/types/typing.types";

/**
 * Computes exact subpixel relative position for the floating caret based on the current target character element.
 * Strictly calculates relative coordinates against containerRect with zero ligature or baseline discrepancy.
 */
export function calculateCaretPosition(
  containerEl: HTMLElement | null,
  currentCharSpan: HTMLElement | null,
  activeWordEl?: HTMLElement | null
): CaretCoordinates {
  if (!containerEl) {
    return { x: 0, y: 0, height: 36, visible: false };
  }

  const containerRect = containerEl.getBoundingClientRect();

  // 1. Direct target character matching
  if (currentCharSpan) {
    const charRect = currentCharSpan.getBoundingClientRect();
    const x = Math.round((charRect.left - containerRect.left + containerEl.scrollLeft) * 10) / 10;
    const y = Math.round((charRect.top - containerRect.top + containerEl.scrollTop) * 10) / 10;
    const height = charRect.height > 0 ? charRect.height : 36;

    return {
      x,
      y,
      height,
      visible: true,
    };
  }

  // 2. Active word boundary fallback (when space pressed or word edge)
  if (activeWordEl) {
    const wordRect = activeWordEl.getBoundingClientRect();
    const x = Math.round((wordRect.right - containerRect.left + containerEl.scrollLeft) * 10) / 10;
    const y = Math.round((wordRect.top - containerRect.top + containerEl.scrollTop) * 10) / 10;
    const height = wordRect.height > 0 ? wordRect.height : 36;

    return {
      x,
      y,
      height,
      visible: true,
    };
  }

  return { x: 0, y: 0, height: 36, visible: false };
}

export const calculatePreciseCaretPosition = calculateCaretPosition;
