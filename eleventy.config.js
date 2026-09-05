const prefix = `/${(process.env.PATH_PREFIX || '').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');

export default function (config) {
  config.addPassthroughCopy({ 'src/assets': 'assets' });
  config.addPassthroughCopy({ 'src/.nojekyll': '.nojekyll' });
  config.addPassthroughCopy({ 'src/manifest.json': 'manifest.json' });
  config.addPassthroughCopy({ 'src/sw.js': 'sw.js' });
  config.addPassthroughCopy({ 'src/webpushr-sw.js': 'webpushr-sw.js' });
  config.addPreprocessor('drafts', 'md,njk', data => {
    if (data.draft === true) return false;
  });
  config.addCollection('posts', api => api.getFilteredByGlob('src/posts/*.md').sort((a, b) => b.date - a.date));
  config.addFilter('dateDisplay', date => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date)));
  config.addFilter('dateISO', date => new Date(date).toISOString());
  config.addFilter('year', date => new Date(date).getUTCFullYear());
  config.addFilter('readingTime', content => Math.max(1, Math.ceil(String(content).replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length / 200)));
  config.addFilter('take', (items, count) => items.slice(0, count));
  config.addFilter('topic', (items, category) => items.filter(item => item.data.category === category));
  config.addFilter('featured', items => items.find(item => item.data.featured) || items[0]);
  config.addFilter('remaining', items => { const featured = items.find(item => item.data.featured) || items[0]; return items.filter(item => item !== featured); });
  config.addFilter('json', value => JSON.stringify(value));
  config.addFilter('absolute', path => new URL(`${prefix}${String(path).replace(/^\//, '')}`, process.env.SITE_URL || 'http://localhost:8080').href);
  config.addGlobalData('buildYear', new Date().getFullYear());
  config.addGlobalData('buildVersion', Date.now());
  return { dir: { input: 'src', output: '_site' }, pathPrefix: prefix, markdownTemplateEngine: 'njk', htmlTemplateEngine: 'njk' };
}
