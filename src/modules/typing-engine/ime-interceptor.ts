/**
 * IME Interceptor & Physical Key Resolver
 * Prevents Vietnamese IME (Unikey, EVKey, OpenKey, Windows Vietnamese IME)
 * from injecting accidental accented characters (â, ă, đ, ê, ô, ơ, ư) or tone marks (s, f, r, x, j)
 * by extracting the intended physical key layout.
 */

const CODE_TO_CHAR_NORMAL: Record<string, string> = {
  KeyA: "a", KeyB: "b", KeyC: "c", KeyD: "d", KeyE: "e",
  KeyF: "f", KeyG: "g", KeyH: "h", KeyI: "i", KeyJ: "j",
  KeyK: "k", KeyL: "l", KeyM: "m", KeyN: "n", KeyO: "o",
  KeyP: "p", KeyQ: "q", KeyR: "r", KeyS: "s", KeyT: "t",
  KeyU: "u", KeyV: "v", KeyW: "w", KeyX: "x", KeyY: "y", KeyZ: "z",
  Digit0: "0", Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4",
  Digit5: "5", Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9",
  Space: " ",
  Minus: "-", Equal: "=", BracketLeft: "[", BracketRight: "]",
  Backslash: "\\", Semicolon: ";", Quote: "'", Backquote: "`",
  Comma: ",", Period: ".", Slash: "/",
};

const CODE_TO_CHAR_SHIFT: Record<string, string> = {
  KeyA: "A", KeyB: "B", KeyC: "C", KeyD: "D", KeyE: "E",
  KeyF: "F", KeyG: "G", KeyH: "H", KeyI: "I", KeyJ: "J",
  KeyK: "K", KeyL: "L", KeyM: "M", KeyN: "N", KeyO: "O",
  KeyP: "P", KeyQ: "Q", KeyR: "R", KeyS: "S", KeyT: "T",
  KeyU: "U", KeyV: "V", KeyW: "W", KeyX: "X", KeyY: "Y", KeyZ: "Z",
  Digit1: "!", Digit2: "@", Digit3: "#", Digit4: "$", Digit5: "%",
  Digit6: "^", Digit7: "&", Digit8: "*", Digit9: "(", Digit0: ")",
  Space: " ",
  Minus: "_", Equal: "+", BracketLeft: "{", BracketRight: "}",
  Backslash: "|", Semicolon: ":", Quote: '"', Backquote: "~",
  Comma: "<", Period: ">", Slash: "?",
};

export interface ResolvedKeyInput {
  isChar: boolean;
  char?: string;
  isBackspace: boolean;
  isSpace: boolean;
  isIgnored: boolean;
  rawEvent: KeyboardEvent;
}

export function resolvePhysicalKeyEvent(e: KeyboardEvent, forcePhysicalKey: boolean = true): ResolvedKeyInput {
  // Pass control / meta combinations through (Ctrl+C, Ctrl+V, etc.)
  if (e.ctrlKey || e.altKey || e.metaKey) {
    return {
      isChar: false,
      isBackspace: false,
      isSpace: false,
      isIgnored: true,
      rawEvent: e,
    };
  }

  if (e.code === "Backspace") {
    return {
      isChar: false,
      isBackspace: true,
      isSpace: false,
      isIgnored: false,
      rawEvent: e,
    };
  }

  if (e.code === "Space") {
    return {
      isChar: false,
      isBackspace: false,
      isSpace: true,
      isIgnored: false,
      rawEvent: e,
    };
  }

  // Non-character navigation keys
  if (
    ["Tab", "Escape", "CapsLock", "ShiftLeft", "ShiftRight", "ControlLeft", "AltLeft", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
      e.code
    )
  ) {
    return {
      isChar: false,
      isBackspace: false,
      isSpace: false,
      isIgnored: true,
      rawEvent: e,
    };
  }

  if (forcePhysicalKey) {
    const isShift = e.shiftKey;
    const resolvedChar = isShift
      ? CODE_TO_CHAR_SHIFT[e.code]
      : CODE_TO_CHAR_NORMAL[e.code];

    if (resolvedChar !== undefined) {
      return {
        isChar: true,
        char: resolvedChar,
        isBackspace: false,
        isSpace: false,
        isIgnored: false,
        rawEvent: e,
      };
    }
  }

  // Fallback to standard e.key if single printable character
  if (e.key && e.key.length === 1) {
    return {
      isChar: true,
      char: e.key,
      isBackspace: false,
      isSpace: e.key === " ",
      isIgnored: false,
      rawEvent: e,
    };
  }

  return {
    isChar: false,
    isBackspace: false,
    isSpace: false,
    isIgnored: true,
    rawEvent: e,
  };
}
