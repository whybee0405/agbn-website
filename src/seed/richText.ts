// Builds a minimal valid Lexical editor state from plain paragraphs — enough
// for seeding richText fields without hand-writing the full JSON each time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function richTextFromParagraphs(paragraphs: string[]): any {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'text',
            format: 0,
            style: '',
            mode: 'normal',
            detail: 0,
            text,
            version: 1,
          },
        ],
      })),
    },
  }
}
