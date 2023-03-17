const router = require('express').Router();
const cheerio = require('cheerio');
const { default: axios } = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

//CHAPTER
router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const response = await client.get(`https://komiku.id/ch/${slug}`);

    const $ = cheerio.load(response.data);
    const content = $('.content');

    let chapter_image = [];

    const chapterArea = content.find('#Baca_Komik > img');

    chapterArea.each((i, el) => {
      chapter_image.push({
        img_link: $(el).attr('src'),
        img_number: i + 1,
      });
    });

    const title = content
      .find('h1')
      .text()
      .toString()
      .replace(/\t/g, '')
      .trim()
      .split('\n');

    let obj = {
      title: title[0].trim(),
      title_sub: title[1].trim(),
      pages: chapterArea.length,
      chapter_image: chapter_image,
    };

    res.status(200).send(obj);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
