/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, isPrivate } = require("../lib/");
const { getJson, LokiXer, IronMan } = require('./client/');

System({
  pattern: 'manorama',
  fromMe: isPrivate,
  type: "news",
  desc: "Manorama news fetcher"
}, async (message, match) => {
  const { result } = await getJson(`${api}news/manorama`);
  if (!Array.isArray(result) || !result.length) return message.reply('No news items found');
  if (match.toLowerCase() === 'headline') {
    const caption = result.map((item, i) => `*${i + 1}. ${item.title}*\n🕒 ${item.time}\n🔗 ${item.link}`).join('\n\n');
    return message.send(`*📰 Manorama News Headlines:*\n\n${caption}`, 'text', { footer: '*Manorama News*' });
  };
  const news = result[Math.floor(Math.random() * result.length)];
  return message.send(news.image, 'image', {
    caption: `*Headlines:* ${news.title}\n\n*Time:* ${news.time}\n\n*Link:* ${news.link}`,
    footer: '*Manorama News*'
  });
});


System({
  pattern: 'twentyfour',
  fromMe: isPrivate,
  type: "news",
  desc: "Twentyfour news fetcher"
}, async (message, match) => {
  const parsedResult = await getJson(`${api}news/twentyfour`);
  const result = JSON.parse(parsedResult.result);
  if (!Array.isArray(result) || !result.length) return message.reply('No valid news items found');
  const filtered = result.filter(item => {
    const title = item.title?.trim().toLowerCase();
    return title && title !== 'headlines';
  });
  if (match.toLowerCase() === 'headline') {
    const caption = filtered.map((item, i) => `*${i + 1}. ${item.title}*\n🔗 ${item.url}`).join('\n\n');
    return message.send(`*📰 Twentyfour News Headlines:*\n\n${caption}`, 'text', { footer: '*Twentyfour News*' });
  }
  const news = filtered[Math.floor(Math.random() * filtered.length)];
  return message.send(news.img, 'image', {
    caption: `*Headlines:* ${news.title}\n\n*Link:* ${news.url}`,
    footer: '*Twentyfour News*'
  });
});


System({
  pattern: 'indiatoday',
  fromMe: isPrivate,
  type: "news",
  desc: "India Today news fetcher"
}, async (message, match) => {
  const result = await getJson(IronMan('ironman/news/indiatoday'));
  if (!Array.isArray(result) || result.length === 0) return message.reply('No news items found');
  if (match.toLowerCase() === 'headline') {
    const caption = result.map((item, i) => `*${i + 1}. ${item.title}*\n🔗 ${item.url}`).join('\n\n');
    return message.send(`*📰 India Today News Headlines:*\n\n${caption}`, { footer: '*India Today*' });
   };
  const news = result[Math.floor(Math.random() * result.length)];
  return message.send(news.image, 'image', {
    caption: `*Title:* ${news.title}\n\n` + `*Link:* ${news.url}`,
    footer: '*India Today*'
  });
});


System({
  pattern: 'mediaone',
  fromMe: isPrivate,
  type: "news",
  desc: "MediaOne news fetcher"
}, async (message, match) => {
  const { result } = await getJson(api + 'news/mediaone');
  if (!Array.isArray(result) || result.length === 0) return message.reply('No news items found');
  if (match.toLowerCase() === 'headline') {
    const caption = result.map((item, i) => `*${i + 1}. ${item.title}*\nCategory: ${item.category} | Time: ${item.postedTime}\nLink: ${item.link}`).join('\n\n');
    return message.send(`*MediaOne News Headlines:*\n\n${caption}`, { footer: '*MediaOne News*' });
  }
  const news = result[Math.floor(Math.random() * result.length)];
  return message.send(news.img, 'image', {
    caption: `Category: ${news.category}\n` + `Time: ${news.postedTime}\n\n` + `*${news.title}*\n\n` + `${news.summary}\n\n` + `Link: ${news.link}`,
    footer: '*MediaOne News*'
  });
});


System({
  pattern: 'mathrubhumi',
  fromMe: isPrivate,
  type: "news",
  desc: "Mathrubhumi news fetcher"
}, async (message, match) => {
  const { result } = await getJson(`${api}news/mathrubhumi`);
  if (!Array.isArray(result) || result.length === 0) return message.reply('No news items found');
  if (match.toLowerCase() === 'headline') {
    const caption = result.map((item, i) => `*${i + 1}. ${item.headline}*\nCategory: ${item.category} | Time: ${item.date}\nLink: ${item.link}`).join('\n\n');
    return message.send(`*Mathrubhumi News Headlines:*\n\n${caption}`, {
      footer: '*Mathrubhumi News*'
    });
  };
  const item = result[Math.floor(Math.random() * result.length)];
  const caption = `*Title:* ${item.headline}\n\n` + `Category: ${item.category}\n\n` + `Sub Category: ${item.subCategory}\n\n` + `Time: ${item.date}\n\n` + `Link: ${item.link}`;
  if (item.image) return message.send(item.image, 'image', {
    caption: caption, 
    footer: '*Mathrubhumi News*'
  }); 
  return message.send(caption, { footer: '*Mathrubhumi News*' });
});


System({
  pattern: 'indianexpress',
  fromMe: isPrivate,
  type: "news",
  desc: "Indian Express news fetcher"
}, async (message, match) => {
  const { result } = await getJson(LokiXer('indianexpress'));
  if (!Array.isArray(result) || !result.length) return message.reply('No news items found');
  if (match.toLowerCase() === 'headline') {
    const caption = result.map((item, i) => `*${i + 1}. ${item.title}*\n🕒 ${item.date}\n🔗 ${item.link}`).join('\n\n');
    return message.send(`*📰 Indian Express Headlines:*\n\n${caption}`, 'text', { footer: '*Indian Express*' });
  }
  const news = result[Math.floor(Math.random() * result.length)];
  return message.send(news.image, 'image', {
    caption: `*Headlines:* ${news.title}\n\n*Time:* ${news.date}\n\n*Link:* ${news.link}`,
    footer: '*Indian Express*'
  });
});


System({
  pattern: 'technews',
  fromMe: isPrivate,
  type: "news",
  desc: "Indian Express news fetcher"
}, async (message, match) => {
  const availableTopics = ['gadgets', 'technology', 'laptops', 'reviews', 'science', 'gallery', 'videos', 'mobiles', 'techook'];
  const topic = availableTopics.includes(match) ? match : 'technology';
  const { result } = await getJson(LokiXer('indianexpress?=' + topic));
  if (!Array.isArray(result) || !result.length) return message.reply('No news items found');
  if (match.toLowerCase() === 'headline') {
    const caption = result.map((item, i) => `*${i + 1}. ${item.title}*\n🕒 ${item.date}\n🔗 ${item.link}`).join('\n\n');
    return message.send(`*📰 Indian Express Headlines:*\n\n${caption}`, 'text', { footer: '*Indian Express*' });
  };
  const news = result[Math.floor(Math.random() * result.length)];
  return message.send(news.image, 'image', {
    caption: `*Headlines:* ${news.title}\n\n*Time:* ${news.date}\n\n*Link:* ${news.link}`,
    footer: '*Indian Express*'
  });
});
