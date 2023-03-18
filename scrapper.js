const cheerio = require('cheerio');
const { baseUrl } = require('./constant');

const primaryScrapper = (web, strUrlReplace = '') => {
  const $ = cheerio.load(web.data);

  let mangas = [];
  let pagination = [];

  const content = $('.daftar');

  content.find('.bge').each((i, el) => {
    mangas.push({
      title: $(el).find('.kan > a > h3').text().trim(),
      title_id: $(el).find('.kan > span').text(),
      endpoint: $(el).find('.kan > a').attr('href').replace('/manga/', ''),
      type: $(el).find('.bgei > a > div.tpe1_inf > b').text(),
      thumbnail: $(el).find('.bgei > a > img').attr('src'),
      description: $(el).find('.kan > p').text().trim(),
      updated_at: $(el).find('.kan > p').text().split('. ')[0].trim(),
      reader_count: $(el).find('.bgei > a > div.vw').text().trim(),
      chapter: {
        begining: {
          title: $(el)
            .find('.kan > div:nth-child(4) > a > span:nth-child(2)')
            .text(),
          endpoint: $(el)
            .find('.kan > div:nth-child(4) > a')
            .attr('href')
            .replace('ch/', '')
            .replace(baseUrl, ''),
        },
        lastest: {
          title: $(el)
            .find('.kan > div:nth-child(5) > a > span:nth-child(2)')
            .text(),
          endpoint: $(el)
            .find('.kan > div:nth-child(5) > a')
            .attr('href')
            .replace('ch/', '')
            .replace(baseUrl, ''),
        },
      },
    });
  });

  // pagination
  $('.loop-nav.pag-nav')
    .find('a')
    .each((i, el) => {
      pagination.push({
        title: $(el).text().trim(),
        endpoint: $(el)
          .attr('href')
          .replace(strUrlReplace, '')
          .replace('genre', 'genres')
          //   .replace('page/', '')
          .replace(/page\/|\/\?|\/manga\//gi, '')
          .replace('?', 1)
          .replace('/', '')
          .trim(),
      });
    });

  let data = {
    mangas,
    pagination: {
      prev: pagination[0],
      next: pagination[1],
    },
  };

  return data;
};

module.exports = { primaryScrapper };
