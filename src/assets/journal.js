const filterPage = document.querySelector('[data-filter-page]');

if (filterPage) {
  const input = filterPage.querySelector('[data-filter-query]');
  const entries = [...filterPage.querySelectorAll('[data-entry]')];
  const buttons = [...filterPage.querySelectorAll('[data-topic]')];
  const status = filterPage.querySelector('[data-filter-status]');
  const empty = filterPage.querySelector('[data-filter-empty]');
  let activeTopic = 'all';
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase().trim();

  function filter(updateUrl = true) {
    const words = normalize(input.value).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const entry of entries) {
      const matchesTopic = activeTopic === 'all' || entry.dataset.category === activeTopic;
      const haystack = normalize(`${entry.dataset.search} ${entry.dataset.category}`);
      const visible = matchesTopic && words.every(word => haystack.includes(word));
      entry.hidden = !visible;
      if (visible) count++;
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.topic === activeTopic));
    empty.hidden = count !== 0;
    status.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}${words.length ? ` matching “${input.value.trim()}”` : ''}${activeTopic !== 'all' ? ` in ${activeTopic}` : ''}`;
    if (updateUrl) {
      const url = new URL(location.href);
      if (input.value.trim()) url.searchParams.set('q', input.value.trim()); else url.searchParams.delete('q');
      if (activeTopic !== 'all') url.searchParams.set('topic', activeTopic); else url.searchParams.delete('topic');
      history.replaceState(null, '', url);
    }
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    input.value = params.get('q') || '';
    const topic = params.get('topic');
    activeTopic = buttons.some(button => button.dataset.topic === topic) ? topic : 'all';
    filter(false);
  }

  for (const button of buttons) button.addEventListener('click', () => { activeTopic = button.dataset.topic; filter(); });
  input.addEventListener('input', () => filter());
  input.addEventListener('keydown', event => { if (event.key === 'Escape') { input.value = ''; filter(); } });
  filterPage.querySelector('[data-reset-filters]')?.addEventListener('click', () => { input.value = ''; activeTopic = 'all'; filter(); input.focus(); });
  window.addEventListener('popstate', readUrl);
  readUrl();
}

document.addEventListener('keydown', event => {
  const editing = event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]');
  if (event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    const input = document.querySelector('[data-filter-query]');
    if (input) input.focus(); else document.querySelector('.search-trigger')?.click();
  }
});

document.querySelector('[data-copy-link]')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  const status = document.querySelector('[data-copy-status]');
  try {
    await navigator.clipboard.writeText(location.href);
    button.textContent = 'Link copied ✓';
    status.textContent = 'The link was copied to your clipboard.';
    setTimeout(() => { button.textContent = 'Copy link ↗'; }, 2500);
  } catch {
    status.textContent = 'Could not copy automatically. Copy the address from your browser’s address bar.';
    button.textContent = 'Copy the browser address';
  }
});

document.querySelectorAll('[data-back-top]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  document.querySelector('.wordmark')?.focus({ preventScroll: true });
}));
