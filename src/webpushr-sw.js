try {
  importScripts('https://cdn.webpushr.com/sw-min.js');
} catch (e) {
  // Fallback to local push handler
  importScripts('./sw.js');
}
