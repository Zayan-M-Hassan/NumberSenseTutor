import katex from 'katex';

/**
 * Render `$...$` and `$$...$$` spans to KaTeX markup.
 *
 * The original did this in a useEffect and assigned innerHTML, so every
 * question painted as raw "Calculate $95 \times 30$." before hydration swapped
 * it. This runs at render time instead, on the server where possible.
 */
export function renderMath(content: string): string {
  return content
    .replace(/\$\$([^$]+)\$\$/g, (_, math: string) =>
      katex.renderToString(math, { displayMode: true, throwOnError: false })
    )
    .replace(/\$([^$]+)\$/g, (_, math: string) =>
      katex.renderToString(math, { displayMode: false, throwOnError: false })
    );
}
