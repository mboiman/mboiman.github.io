/**
 * How a station's `details` string splits into what stays open, what folds, and
 * the tool block. Moved out of CVPage.astro on 2026-09-25 when the minimal view
 * (CVMinimal.astro) needed the same split: a second copy would have drifted the
 * way the talk rule once did (see experience.ts). The patterns come from
 * i18n.ts (`truncatePatterns`, `truncateToolPatterns`), per language.
 */

/* ── Station details: what stays open, what folds ──────────────────────────
   The old split kept the intro and the TOOL list and threw the focus block
   away. On the running mandate that meant one sentence plus six lines of
   product names on the page, while ten focus bullets, the only place where the
   work itself is described, rendered nowhere. It also knew two states, focus
   and tools, so anything AFTER the tool list stayed in tool mode: the block
   "Wichtige Erfolge" folded into a disclosure labelled "Technischer Stack".

   The string is parsed into blocks at bold-ONLY heading lines, and each block
   is routed by its heading:

     lead (no heading)  visible, clipped at 80 words
     first focus block  heading + first three bullets visible, remainder folds
     further focus      folds whole
     tool block         folds whole
     anything else      visible. This is the third state, and it is what ends
                        tool mode instead of swallowing the rest of the entry

   The disclosure is labelled with the headings that are actually inside it,
   so it can never again announce a section it does not contain. */

type DetailBlock = { title: string | null; lines: string[] };

/** A line that is nothing but a bold heading, optional trailing colon/space. */
const HEADING_ONLY = /^\s*\*\*(.+?)\*\*\s*:?\s*$/;
/** Bullet markers used in config.cv.toml: dash, asterisk, middot, bullet. */
const BULLET_LINE = /^\s*(?:[-*]|[•·])\s+/;
/** How many bullets of the focus block the card shows before folding. */
const VISIBLE_HIGHLIGHTS = 3;

function toBlocks(text: string): DetailBlock[] {
  const blocks: DetailBlock[] = [{ title: null, lines: [] }];
  for (const raw of (text || '').split('\n')) {
    const heading = raw.match(HEADING_ONLY);
    if (heading) blocks.push({ title: heading[1].replace(/:\s*$/, '').trim(), lines: [] });
    else blocks[blocks.length - 1].lines.push(raw);
  }
  return blocks.filter(b => b.title !== null || b.lines.join('').trim() !== '');
}

function blockToMarkdown(block: DetailBlock): string {
  return [block.title ? `**${block.title}**` : '', ...block.lines].join('\n').trim();
}

/** Clip the lead to 80 words, backing up to the last sentence end. */
function clipLead(text: string): string {
  const words = text.split(/\s+/);
  if (words.length <= 80) return text;
  const clipped = words.slice(0, 80).join(' ');
  const lastStop = Math.max(clipped.lastIndexOf('. '), clipped.lastIndexOf('! '), clipped.lastIndexOf('? '));
  return lastStop > 40 ? clipped.slice(0, lastStop + 1) : `${clipped}…`;
}


export type ToolBlock = { title: string; body: string };

export function splitDetails(
  details: string,
  focusPatterns: string[],
  toolPatterns: string[],
): { open: string; foldTitle: string; fold: string; tools: ToolBlock | null } {
  const focusPattern = new RegExp(`^(${focusPatterns.join('|')})`, 'i');
  const toolPattern = new RegExp(`^(${toolPatterns.join('|')})`, 'i');

  const open: string[] = [];
  const folded: DetailBlock[] = [];
  /* The tool block leaves the fold and becomes its own return value, because it
     is the only part of a station that belongs BESIDE the narrative rather than
     under it. See the card below: the copy stops at 56 characters per line, and
     on a 862px card that left 376px of nothing, on all twelve. */
  const tools: DetailBlock[] = [];
  let focusTaken = false;

  for (const block of toBlocks(details)) {
    if (block.title === null) {
      const lead = block.lines.join('\n').trim();
      if (lead) open.push(clipLead(lead));
      continue;
    }
    if (!focusTaken && focusPattern.test(block.title)) {
      focusTaken = true;
      let seen = 0;
      let cut = block.lines.length;
      for (let i = 0; i < block.lines.length; i += 1) {
        if (!BULLET_LINE.test(block.lines[i])) continue;
        seen += 1;
        if (seen === VISIBLE_HIGHLIGHTS) { cut = i + 1; break; }
      }
      open.push(blockToMarkdown({ title: block.title, lines: block.lines.slice(0, cut) }));
      const tail = block.lines.slice(cut);
      if (tail.join('').trim()) folded.push({ title: block.title, lines: tail });
      continue;
    }
    if (toolPattern.test(block.title)) {
      tools.push(block);
      continue;
    }
    if (focusPattern.test(block.title)) {
      folded.push(block);
      continue;
    }
    open.push(blockToMarkdown(block));
  }

  const foldTitle = [...new Set(folded.map(b => b.title).filter(Boolean))].join(' · ');
  return {
    open: open.join('\n\n').trim(),
    foldTitle,
    fold: folded.map(blockToMarkdown).join('\n\n').trim(),
    /* Title and body apart, because the title has two jobs depending on how much
       room the card has: beside the text it is a heading, underneath it is the
       label of a disclosure. */
    tools: tools.length
      ? {
          title: [...new Set(tools.map(block => block.title).filter(Boolean))].join(' · '),
          body: tools.map(block => block.lines.join('\n').trim()).filter(Boolean).join('\n\n'),
        }
      : null,
  };
}
