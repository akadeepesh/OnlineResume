// ============================================================================
// The **bold** helper for plain-text fields.
//
// Resume text marks emphasis with double asterisks (see RichText). Typing them
// by hand is fiddly, so the B button / Ctrl+B wraps or unwraps the selection.
// Pure string logic: takes the text and selection, returns the new text and
// where the selection should be afterwards.
// ============================================================================

export interface TextEdit {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

const MARK = "**";
const PLACEHOLDER = "bold text";

export function toggleBold(text: string, start: number, end: number): TextEdit {
  let from = Math.max(0, Math.min(start, end));
  let to = Math.min(text.length, Math.max(start, end));

  // Nothing selected: insert a placeholder and select it, ready to type over.
  if (from === to) {
    const inserted = `${MARK}${PLACEHOLDER}${MARK}`;
    return {
      text: text.slice(0, from) + inserted + text.slice(to),
      selectionStart: from + MARK.length,
      selectionEnd: from + MARK.length + PLACEHOLDER.length,
    };
  }

  // "**word**" only renders when the marks hug the word, so leave any
  // spaces at the edges of the selection outside the marks.
  while (from < to && /\s/.test(text[from])) from++;
  while (to > from && /\s/.test(text[to - 1])) to--;
  if (from === to) return { text, selectionStart: start, selectionEnd: end };

  const selected = text.slice(from, to);

  // Already bold, with the marks just outside the selection: unwrap.
  if (text.slice(from - MARK.length, from) === MARK && text.slice(to, to + MARK.length) === MARK) {
    return {
      text: text.slice(0, from - MARK.length) + selected + text.slice(to + MARK.length),
      selectionStart: from - MARK.length,
      selectionEnd: to - MARK.length,
    };
  }

  // The marks are inside the selection: unwrap.
  if (selected.length > MARK.length * 2 && selected.startsWith(MARK) && selected.endsWith(MARK)) {
    const inner = selected.slice(MARK.length, -MARK.length);
    return {
      text: text.slice(0, from) + inner + text.slice(to),
      selectionStart: from,
      selectionEnd: from + inner.length,
    };
  }

  // Wrap. Bold bits inside the selection are merged into one bold run,
  // because nested marks don't render.
  const inner = selected.split(MARK).join("");
  return {
    text: text.slice(0, from) + MARK + inner + MARK + text.slice(to),
    selectionStart: from + MARK.length,
    selectionEnd: from + MARK.length + inner.length,
  };
}
