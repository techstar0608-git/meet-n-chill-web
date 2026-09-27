// Turns Google Docs' Markdown export into clean post Markdown.
// Images are replaced by placeholders (@@IMG0@@ …) and returned as a list to resolve;
// three ways to place an image in a Doc are supported:
//   1. [[image: dinner-1.jpg | Optional caption]]  → file in 03_Blog Assets/<Post ID>/
//   2. A Google Drive link to an image, alone on its line
//   3. An image pasted directly into the Doc (exported as base64)

const DRIVE_ID = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/;
const TOKEN = /^\[\[\s*image\s*:\s*([^|\]]+?)\s*(?:\|\s*(.*?)\s*)?\]\]$/i;

const unescapeMd = (s) => s.replace(/\\([\\[\]_|*\-.()#!+`>~<{}])/g, '$1');

export function parseDocMarkdown(md) {
  const refs = {};
  md = md.replace(/\r\n/g, '\n').replace(
    /^\[([^\]]+)\]:\s*<?(data:image\/[\w.+-]+;base64,[A-Za-z0-9+/=]+)>?\s*$/gm,
    (_, key, uri) => {
      refs[key] = uri;
      return '';
    },
  );

  const images = [];
  const place = (img) => `@@IMG${images.push(img) - 1}@@`;

  const lines = md.split('\n').map((line) => {
    const plain = unescapeMd(line).trim();

    const token = plain.match(TOKEN);
    if (token) return place({ kind: 'asset', name: token[1].trim(), caption: token[2] || '' });

    // A line that is only a Drive link: bare URL, <URL> or [text](URL)
    const link = plain.match(/^(?:\[([^\]]*)\]\()?<?(https?:\/\/drive\.google\.com\/[^\s)>]+)>?\)?$/);
    if (link && DRIVE_ID.test(link[2])) {
      const caption = link[1] && !link[1].startsWith('http') ? link[1] : '';
      return place({ kind: 'drive', id: link[2].match(DRIVE_ID)[1], caption });
    }

    // Pasted images: ![alt][image1] or ![alt](data:...)
    return line
      .replace(/!\[([^\]]*)\]\[([^\]]+)\]/g, (m, alt, key) =>
        refs[key] ? `\n\n${place({ kind: 'inline', dataUri: refs[key], caption: '' })}\n\n` : '',
      )
      .replace(/!\[([^\]]*)\]\((data:image\/[^)]+)\)/g, (m, alt, uri) =>
        `\n\n${place({ kind: 'inline', dataUri: uri, caption: '' })}\n\n`,
      );
  });

  return { body: lines.join('\n'), images };
}

// Removes the Doc's own title line (the post title comes from the Content Plan sheet).
export function stripTitle(body, title, postId) {
  const norm = (s) => unescapeMd(s).replace(/[*_#]/g, '').trim().toLowerCase();
  const lines = body.split('\n');
  const first = lines.findIndex((l) => l.trim() !== '');
  if (first !== -1 && /^#{1,2}\s/.test(lines[first])) {
    const text = norm(lines[first].replace(/^#+\s*/, ''));
    if (text === norm(title) || text.startsWith(postId.toLowerCase())) lines.splice(first, 1);
  }
  return lines.join('\n');
}

export function fillImages(body, resolved, fallbackAlt) {
  return body.replace(/@@IMG(\d+)@@/g, (_, i) => {
    const img = resolved[+i];
    if (!img) return '';
    const alt = (img.caption || fallbackAlt).replace(/[[\]]/g, '');
    return `![${alt}](./${img.file})` + (img.caption ? `\n\n*${img.caption}*` : '');
  });
}

export function tidy(body) {
  return body
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

export function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/, '');
}
