import { rmSync } from 'node:fs';

// A clean output prevents deleted posts and newly hidden drafts from surviving a rebuild.
rmSync(new URL('../_site/', import.meta.url), { recursive: true, force: true });
