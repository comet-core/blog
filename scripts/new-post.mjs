import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const title = args[0];
if (!title || title.startsWith('--')) {
  console.error('Usage: npm run new -- "Your post title" [--category Everyday|Writings|Fragments]');
  process.exit(1);
}
const optionIndex = args.indexOf('--category');
const category = optionIndex === -1 ? 'Everyday' : args[optionIndex + 1];
if (!['Everyday', 'Writings', 'Fragments'].includes(category)) {
  console.error('Choose a category: Everyday, Writings, or Fragments.');
  process.exit(1);
}
const slug = title.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
if (!slug) { console.error('Please include a letter or number in the title.'); process.exit(1); }
const postsDir = fileURLToPath(new URL('../src/posts/', import.meta.url));
mkdirSync(postsDir, { recursive: true });
const path = resolve(postsDir, `${slug}.md`);
const now = new Date();
const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
const content = `---\ntitle: ${JSON.stringify(title)}\ndescription: "A sentence about this entry."\ndate: ${date}\ncategory: ${category}\ndraft: true\n---\n\nStart somewhere. Even a single sentence is an entry.\n`;
try {
  writeFileSync(path, content, { flag: 'wx' });
  console.log(`Created ${path}\n\nWrite your entry, then change draft: true to draft: false to publish.`);
} catch (error) {
  if (error.code === 'EEXIST') { console.error('A post with this title already exists. Use a different title or edit the existing file.'); process.exit(1); }
  throw error;
}
