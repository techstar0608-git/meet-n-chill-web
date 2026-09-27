import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDocMarkdown, stripTitle, fillImages, tidy, slugify } from '../src/markdown.mjs';

// Shape of a real Google Docs "text/markdown" export: escaped brackets/underscores, pasted image as ref.
const DOC = [
  '# YP-001 \\- English Dinner Night',
  '',
  'Last Friday we cooked **pho** together.',
  '',
  '\\[\\[image: dinner\\_1.jpg | Everyone around the table\\]\\]',
  '',
  'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/view?usp=sharing',
  '',
  '[Group photo](https://drive.google.com/open?id=1ZyXwVuTsRqPoNmLkJiHgFeDcBa98765)',
  '',
  '![][image1]',
  '',
  'See you next week!',
  '',
  '[image1]: <data:image/png;base64,iVBORw0KGgo=>',
].join('\n');

test('extracts all three image styles in order', () => {
  const { body, images } = parseDocMarkdown(DOC);
  assert.deepEqual(images.map((i) => i.kind), ['asset', 'drive', 'drive', 'inline']);
  assert.equal(images[0].name, 'dinner_1.jpg');
  assert.equal(images[0].caption, 'Everyone around the table');
  assert.equal(images[1].id, '1AbCdEfGhIjKlMnOpQrStUvWxYz012345');
  assert.equal(images[2].caption, 'Group photo');
  assert.ok(!body.includes('data:image'));
  assert.ok(body.includes('@@IMG3@@'));
});

test('strips the Doc title line and fills images', () => {
  const { body } = parseDocMarkdown(DOC);
  const noTitle = stripTitle(body, 'English Dinner Night', 'YP-001');
  assert.ok(!noTitle.includes('# YP-001'));
  const out = tidy(fillImages(noTitle, [{ file: 'dinner-1.webp', caption: 'Everyone around the table' }, { file: 'a.webp', caption: '' }, { file: 'b.webp', caption: 'Group photo' }, { file: 'c.webp', caption: '' }], 'English Dinner Night'));
  assert.match(out, /^Last Friday/);
  assert.match(out, /!\[Everyone around the table\]\(\.\/dinner-1\.webp\)\n\n\*Everyone around the table\*/);
  assert.match(out, /!\[English Dinner Night\]\(\.\/a\.webp\)/);
  assert.ok(!out.includes('\n\n\n'));
});

test('slugify', () => {
  assert.equal(slugify('English Dinner Night: Practising English Over a Home-Cooked Meal!'), 'english-dinner-night-practising-english-over-a-home-cooked-meal');
  assert.equal(slugify('Đi dã ngoại cùng Ablaze'), 'di-da-ngoai-cung-ablaze');
});
