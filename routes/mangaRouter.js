const router = require('express').Router();
const cheerio = require('cheerio');
const client = require('../axios');
const { baseUrl2, baseUrl } = require('../constant');
const response = require('../response');
const { primaryScrapper } = require('../scrapper');

//ALL GENRES
router.get('/genres', async (req, res) => {
  try {
    const result = await client.get(`${baseUrl}`);
    const $ = cheerio.load(result.data);
    const content = $('#Filter');

    let genres = [];

    const genreArea = content.find('select:nth-child(2) > option');
    genreArea.each((i, el) => {
      if ($(el).text() !== 'Genre 1') {
        genres.push({
          name: $(el).text(),
          endpoint: $(el).attr('value'),
        });
      }
    });

    let data = {
      total: genres.length,
      genres: genres,
    };

    response(res, 200, true, '', data);
  } catch (error) {
    response(res, 500, false, 'Gagal memuat genre.');
  }
});

//GENRES WITH SLUG & PAGINATION
router.get(['/genres/:slug', '/genres/:slug/:number'], async (req, res) => {
  const { slug, number } = req.params;

  const pageNumber = !number ? 1 : number;

  try {
    const result = await client.get(
      `${baseUrl}/genre/${slug}/page/${pageNumber}`
    );

    let data = primaryScrapper(result);

    response(res, 200, true, '', data);
  } catch (error) {
    response(res, 500, false, 'Gagal memuat genre.');
  }
});

//OTHER [hot,berwarna]
router.get(['/other/:slug', '/other/:slug/:number'], async (req, res) => {
  const { slug, number } = req.params;

  const pageNumber = !number ? 1 : number;

  try {
    const result = await client.get(
      `${baseUrl}/other/${slug}/page/${pageNumber}`
    );

    let data = primaryScrapper(result);

    response(res, 200, true, '', data);
  } catch (error) {
    console.log(error);
    response(res, 500, false, 'Gagal memuat manga.');
  }
});

//PUSTAKA REFERENCES [manga,manhua,manhwa]
router.get(['/ref/:type', '/ref/:type/:number'], async (req, res) => {
  const { type, number } = req.params;

  const pageNumber = !number ? 1 : number;

  const url = !number
    ? `${baseUrl}/manga/?orderby=&category_name=${type}&genre=&genre2=&status=`
    : `${baseUrl}/manga/page/${pageNumber}/?orderby&category_name=${type}&genre&genre2&status`;

  const strUrlReplace = url.replace(baseUrl, '').split('?')[1];

  try {
    const result = await client.get(url);

    let data = primaryScrapper(result, strUrlReplace);

    response(res, 200, true, '', data);
  } catch (error) {
    console.log(error);
    response(res, 500, false, 'Gagal memuat pustaka.', error);
  }
});

//ALL
router.get(['/all/', '/all/:number'], async (req, res) => {
  const { number } = req.params;

  const pageNumber = !number ? 1 : number;

  try {
    const result = await client.get(`${baseUrl}/manga/page/${pageNumber}`);

    let data = primaryScrapper(result);

    response(res, 200, true, '', data);
  } catch (error) {
    response(res, 500, false, 'Gagal memuat pustaka.', error);
  }
});

//DETAIL
router.get('/detail/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await client.get(`${baseUrl}/manga/${slug}`);

    const $ = cheerio.load(result.data);

    const PRIMARY = $('#Judul');
    const title = PRIMARY.find('h1').text().trim();
    const synopsis = PRIMARY.find('p.desc').text().trim();
    const thumbnail = $('#Informasi > div > img').attr('src');

    const TABLE = $('.inftable');
    const title_id = TABLE.find('tr:nth-child(1) > td:nth-child(2)').text();
    const type = TABLE.find('tr:nth-child(2) > td:nth-child(2) > a > b').text();
    const draft = TABLE.find('tr:nth-child(3) > td:nth-child(2)').text();
    const author = TABLE.find('tr:nth-child(4) > td:nth-child(2)').text();
    const status = TABLE.find('tr:nth-child(5) > td:nth-child(2)').text();
    const legal_age = TABLE.find('tr:nth-child(6) > td:nth-child(2)').text();
    const reader_count = TABLE.find('tr:nth-child(7) > td:nth-child(2)').text();
    const to_read = TABLE.find('tr:nth-child(8) > td:nth-child(2)').text();

    let genres = [];
    $('#Informasi>ul>li').each((i, el) => {
      genres.push({
        genre: $(el).find('a').text(),
        endpoint: $(el).find('a').attr('href').replace('genre', 'genres'),
      });
    });

    let chapters = [];

    const CHAPTERLIST = $('#Daftar_Chapter');
    CHAPTERLIST.find('tbody > tr').each((i, el) => {
      let endpoint = $(el).find('td.judulseries > a').attr('href');
      chapters.push({
        chapter: $(el).find('td.judulseries > a > span').text(),
        endpoint: endpoint?.replace('/ch/', ''),
        created_at: $(el).find('td.tanggalseries').text().trim(),
      });
    });

    let data = {
      title,
      title_id,
      endpoint: slug,
      thumbnail,
      synopsis,
      type,
      draft,
      status,
      author,
      legal_age,
      reader_count,
      to_read,
      genres,
      chapters,
    };

    response(res, 200, true, '', data);
  } catch (error) {
    response(res, 500, false, 'Gagal memuat pustaka.', error);
  }
});

//SEARCH
router.get(['/search', '/search/:number'], async (req, res) => {
  const keyword = req.query.q;
  const number = req.params.number;

  const pageNumber = !number ? 1 : number;

  const url = !number
    ? `${baseUrl2}/cari/?post_type=manga&s=${keyword}`
    : `${baseUrl2}/page/${pageNumber}/?post_type=manga&s=${keyword}`;

  const strUrlReplace = url.replace(baseUrl, '').split('?')[1];

  try {
    const result = await client.get(`${url}`);

    let data = primaryScrapper(result, strUrlReplace);

    response(res, 200, true, '', data);
  } catch (error) {
    response(res, 500, false, 'Gagal memuat hasil pencarian.', error);
  }
});

module.exports = router;
