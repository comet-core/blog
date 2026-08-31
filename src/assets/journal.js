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

const quoteWidget = document.querySelector('[data-quote-widget]');
if (quoteWidget) {
  const quotes = [
    { quote: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan", topic: "Space" },
    { quote: "How we spend our days is, of course, how we spend our lives.", author: "Annie Dillard", topic: "Everyday" },
    { quote: "The road goes on forever and the party never ends.", author: "Robert Earl Keen", topic: "Automotive" },
    { quote: "I don't know what I think until I write it down.", author: "Joan Didion", topic: "Writings" },
    { quote: "If you want to make an apple pie from scratch, you must first invent the universe.", author: "Carl Sagan", topic: "Space" },
    { quote: "Nothing is worth more than this day.", author: "Johann Wolfgang von Goethe", topic: "Everyday" },
    { quote: "Straight roads are for fast cars, turns are for fast drivers.", author: "Colin McRae", topic: "Automotive" },
    { quote: "The cosmos is within us. We are made of star-stuff.", author: "Carl Sagan", topic: "Space" },
    { quote: "Pay attention. Be astonished. Tell about it.", author: "Mary Oliver", topic: "Fragments" },
    { quote: "Never underestimate the power of a woman with a telescope.", author: "Nancy Grace Roman", topic: "Space" },
    { quote: "The journey not the arrival matters.", author: "T.S. Eliot", topic: "Everyday" },
    { quote: "Everything in life is somewhere else, and you get there in a car.", author: "E.B. White", topic: "Automotive" },
    { quote: "There are no ordinary moments.", author: "Dan Millman", topic: "Everyday" },
    { quote: "Look up at the stars and not down at your feet. Try to make sense of what you see.", author: "Stephen Hawking", topic: "Space" },
    { quote: "Fill your paper with the breathings of your heart.", author: "William Wordsworth", topic: "Writings" },
    { quote: "A car is not just a tool; it’s an extension of your curiosity.", author: "Anonymous", topic: "Automotive" },
    { quote: "To see a World in a Grain of Sand and a Heaven in a Wild Flower.", author: "William Blake", topic: "Fragments" },
    { quote: "The night sky is a miracle of light traveling across billions of years to find your eyes.", author: "Anonymous", topic: "Space" },
    { quote: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde", topic: "Everyday" },
    { quote: "Speed has never killed anyone. Suddenly becoming stationary, that's what gets you.", author: "Jeremy Clarkson", topic: "Automotive" },
    { quote: "What is written without effort is in general read without pleasure.", author: "Samuel Johnson", topic: "Writings" }
  ];

  const textEl = quoteWidget.querySelector('[data-quote-text]');
  const authorEl = quoteWidget.querySelector('[data-quote-author]');
  const topicEl = quoteWidget.querySelector('[data-quote-topic]');
  const refreshBtn = quoteWidget.querySelector('[data-quote-refresh]');

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  let currentIndex = dayOfYear % quotes.length;

  function renderQuote(index, animate = false) {
    const item = quotes[index];
    if (animate) {
      quoteWidget.classList.add('quote-updating');
      setTimeout(() => {
        if (textEl) textEl.textContent = `“${item.quote}”`;
        if (authorEl) authorEl.textContent = `— ${item.author}`;
        if (topicEl) topicEl.textContent = item.topic;
        quoteWidget.classList.remove('quote-updating');
      }, 150);
    } else {
      if (textEl) textEl.textContent = `“${item.quote}”`;
      if (authorEl) authorEl.textContent = `— ${item.author}`;
      if (topicEl) topicEl.textContent = item.topic;
    }
  }

  renderQuote(currentIndex);

  refreshBtn?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % quotes.length;
    renderQuote(currentIndex, true);
  });
}
