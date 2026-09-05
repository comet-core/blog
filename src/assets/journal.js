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
  let quotes = [
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

  const quotesDataEl = document.getElementById('quotes-data');
  if (quotesDataEl) {
    try {
      const parsed = JSON.parse(quotesDataEl.textContent);
      if (Array.isArray(parsed) && parsed.length > 0) quotes = parsed;
    } catch (e) {
      console.error('Failed to parse quotes data:', e);
    }
  }

  const textEl = quoteWidget.querySelector('[data-quote-text]');
  const authorEl = quoteWidget.querySelector('[data-quote-author]');
  const topicEl = quoteWidget.querySelector('[data-quote-topic]');
  const refreshBtn = quoteWidget.querySelector('[data-quote-refresh]');

  let currentIndex = Math.floor(Math.random() * quotes.length);

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

// Margin term popovers (touch + mobile support)
document.querySelectorAll('.margin-term').forEach(term => {
  term.addEventListener('click', event => {
    event.stopPropagation();
    const isActive = term.classList.contains('is-active');
    document.querySelectorAll('.margin-term.is-active').forEach(t => t.classList.remove('is-active'));
    if (!isActive) term.classList.add('is-active');
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.margin-term.is-active').forEach(t => t.classList.remove('is-active'));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.margin-term.is-active').forEach(t => t.classList.remove('is-active'));
  }
});

// Service Worker Registration & Notification Management
(function initNotifications() {
  const manifestLink = document.querySelector('link[rel="manifest"]');
  const swPath = manifestLink ? manifestLink.getAttribute('href').replace('manifest.json', 'sw.js') : '/sw.js';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(swPath).catch(err => {
        console.warn('Service worker registration:', err);
      });
    });
  }

  // PWA Install prompt handling
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    const installCard = document.querySelector('[data-install-card]');
    if (installCard) installCard.hidden = false;
  });

  document.querySelector('[data-install-btn]')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        const installCard = document.querySelector('[data-install-card]');
        if (installCard) installCard.hidden = true;
      }
      deferredPrompt = null;
    }
  });

  // Notification UI controls on /subscribe/
  const card = document.querySelector('[data-notification-card]');
  if (!card) return;

  const btn = card.querySelector('[data-notification-btn]');
  const label = card.querySelector('[data-notification-label]');
  const status = card.querySelector('[data-notification-status]');
  const testRow = card.querySelector('[data-notification-test-row]');
  const testBtn = card.querySelector('[data-notification-test-btn]');
  const disableBtn = card.querySelector('[data-notification-disable-btn]');

  const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  function updateUI() {
    if (!isSupported) {
      if (btn) btn.disabled = true;
      if (label) label.textContent = 'Device notifications unsupported';
      if (status) status.textContent = 'This browser does not support web push notifications. Try modern Chrome, Safari, or Firefox.';
      if (testRow) testRow.hidden = true;
      return;
    }

    const permission = Notification.permission;
    if (permission === 'granted') {
      btn.classList.add('is-active');
      btn.disabled = false;
      label.textContent = 'Notifications Active ✓';
      status.textContent = 'You’re subscribed. You’ll receive a calm on-screen notification when a new page is published.';
      if (testRow) testRow.hidden = false;
    } else if (permission === 'denied') {
      btn.classList.remove('is-active');
      btn.disabled = false;
      label.textContent = 'Notifications Blocked in Browser';
      status.textContent = 'Notifications are blocked in your browser settings. Click the site settings / lock icon in your address bar to re-enable.';
      if (testRow) testRow.hidden = true;
    } else {
      btn.classList.remove('is-active');
      btn.disabled = false;
      label.textContent = 'Enable device notifications';
      status.textContent = 'Click to enable a discreet on-screen note when new entries are published.';
      if (testRow) testRow.hidden = true;
    }
  }

  btn?.addEventListener('click', async () => {
    if (!isSupported) return;

    if (Notification.permission === 'granted') {
      // Already granted, trigger quick feedback
      label.textContent = 'Already Active ✓';
      setTimeout(() => updateUI(), 1500);
      return;
    }

    if (Notification.permission === 'denied') {
      status.textContent = 'Permission was previously blocked. Click the lock/tune icon next to the URL in your browser to allow notifications.';
      return;
    }

    try {
      label.textContent = 'Requesting permission…';
      const permission = await Notification.requestPermission();
      updateUI();
      if (permission === 'granted') {
        // Send a welcoming sample notification
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification('In the margins', {
          body: 'You’re now subscribed to quiet on-device notifications for new pages.',
          icon: new URL('assets/favicon.svg', document.baseURI || location.href).href,
          tag: 'margins-welcome'
        });
      }
    } catch (err) {
      console.error('Notification permission error:', err);
      updateUI();
    }
  });

  testBtn?.addEventListener('click', async () => {
    if (Notification.permission !== 'granted') return;
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification('In the margins · Sample Entry', {
        body: '“The Sentinel Running Out of Sky” — 6 min read in Space.',
        icon: new URL('assets/favicon.svg', document.baseURI || location.href).href,
        data: { url: './' }
      });
      testBtn.textContent = 'Test sent ✓';
      setTimeout(() => { testBtn.textContent = 'Send test notification ↗'; }, 2500);
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  });

  disableBtn?.addEventListener('click', () => {
    status.textContent = 'To disable, click the site settings / lock icon in your browser address bar and switch Notifications to "Block" or "Reset".';
  });

  updateUI();
})();


