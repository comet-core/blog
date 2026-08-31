export default {
  layout: 'post.njk',
  isPost: true,
  section: 'journal',
  eleventyComputed: {
    permalink: data => data.draft ? false : `/journal/${data.page.fileSlug}/`
  }
};
