const router = require('express').Router();
const cheerio = require('cheerio');
const response = require('../response');
const client = require('../axios');
const { baseUrl } = require('../constant');

//CHAPTER
router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const result = await client.get(`${baseUrl}/ch/${slug}`);

    const $ = cheerio.load(result.data);
    const content = $('.content');

    let chapters = [];
    let pagination = [];

    const chapterArea = content.find('#Baca_Komik > img');

    chapterArea.each((i, el) => {
      chapters.push({
        link: $(el).attr('src'),
        number: i + 1,
      });
    });

    const title = content
      .find('h1')
      .text()
      .toString()
      .replace(/\t/g, '')
      .trim()
      .split('\n');

    const chapterNav = $('.nxpr > a');

    chapterNav.each((i, el) => {
      pagination.push($(el).attr('href').replace('/ch/', ''));
    });

    let data = {
      title: title[0].trim(),
      link: slug,
      pages: chapterArea.length,
      chapters: chapters,
      pagination: {
        prev_endpoint: pagination[0],
        next_endpoint: pagination[1],
        current: $('.nxpr > span').text(),
      },
    };

    response(res, 200, true, '', data);
  } catch (error) {
    response(res, 500, false, 'Gagal memuat chapter.');
  }
});

module.exports = router;
