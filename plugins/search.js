/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const { System, isPrivate, Yahoo, gits } = require("../lib/");
const { IronMan, getJson, isUrl } = require('./client/');

System({
        pattern: "yahoo",
        fromMe: isPrivate,
        desc: "yahoo search (short)",
        type: "search"
}, async (message, match) => {
        if (!match) return message.send("*Need a query to search*\n_Example: who is iron man, images or video_");
        let [text, type] = match.split(',').map(s => s.trim());
        type = ['video','images','search'].includes(type?.toLowerCase()) ? type.toLowerCase() : 'search';
        const res = await Yahoo[type](text);
        const pick = res[Math.floor(Math.random() * res.length)];
        if (type === 'images') {
          for (const { image, title } of res.sort(() => 0.5 - Math.random()).slice(0, 5)) {
            await message.send(image, 'image', { caption: title });
            await new Promise(r => setTimeout(r, 1000));
          };
        } else if (type === 'video') {
                await message.reply({ url: pick.thumbnail }, { caption: `*Title:* ${pick.title}\n*Duration:* ${pick.duration}\n*Time:* ${pick.age}\n*Views:* ${pick.view}\n*Link:* ${pick.link}\n*Source:* ${pick.source}` }, 'image');
        } else {
                await message.reply(`*⬢ Title:* ${pick.title}\n*⬢ Description:* _${pick.description}_\n*⬢ Link:* ${pick.link}`);
        };
});


System({
        pattern: "scs",
        fromMe: isPrivate,
        desc: "SoundCloud search",
        type: "search"
}, async (message, match) => {
        if (!match) return await message.reply("*Need a query to search*\n_Example: .scs life waster_");
        const fullResult = match.trim().startsWith("-full");
        const query = fullResult ? match.replace("-full", "").trim() : match.trim();
        const { result: results } = await getJson(IronMan(`ironman/s/soundcloud?query=${query}`));
        if (!results || results.length === 0) return await message.send("No results found.");
        if (fullResult) {
            let fullit = "";
            results.forEach(result => {
                fullit += `*Title*: ${result.title}\n*URL*: ${result.url}\n*Artist*: ${result.artist}\n*Views*: ${result.views}\n*Release*: ${result.release}\n*Duration*: ${result.duration}\n\n`;
            });
            await message.send(fullit);
        } else {
            const furina = results[0];
            const { title, artist, views, release, duration, thumb, url } = furina;
            let caption = `╔═════◇\n\n*➭Title*: ${title}\n*➭Artist*: ${artist}\n*➭Views*: ${views}\n*➭Release*: ${release}\n*➭Duration*: ${duration}\n*➭URL*: ${url}\n\n*Use -full in front of query to get full results*\n_Example: .scs -full ${match}_\n\n╚══════════════════╝`;
            if (thumb) {
                await message.send({ url: thumb }, { caption: caption }, "image");
            } else {
                await message.send(caption);
            }
        }
});

System({
  pattern: 'img',
  fromMe: isPrivate,
  desc: 'Search google images',
  type: 'search',
}, async (message, match) => {
  const [query, count] = match.split(',').map(item => item.trim());
  const imageCount = count ? parseInt(count, 10) : 5;
  if (!query) return await message.reply("*Need a Query*\n_Example: .img ironman, 5_");
  const msg = await message.send(`Downloading ${imageCount} images of *${query}*`);
  const urls = await gits(`${encodeURIComponent(query)}`);
  if (urls.length === 0) return await message.send("No images found for the query");
  const list = urls.length <= imageCount ? urls : urls.sort(() => 0.5 - Math.random()).slice(0, imageCount);
  for (const url of list) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await message.sendFromUrl(url.url)
  }
  await msg.edit("*Downloaded*");
});

System({
  pattern: 'pstore',
  fromMe: isPrivate,
  desc: 'Searches for an app on Play Store',
  type: 'search',
}, async (message, match) => {
  if (!match) return await message.reply("*Nᴇᴇᴅ ᴀɴ ᴀᴘᴘ ɴᴀᴍᴇ*\n*Example.ps WhatsApp*");
  const query = match.startsWith('-full') ? match.slice(5).trim() : match;
  const result = await getJson(IronMan(`ironman/search/playstore?app=${query}`));
  if (match.startsWith('-full')) {
    const cap = result.map(item => `┈──────────────────────⏣\n*ɴᴀᴍᴇ:* ${item.name}\n*ᴅᴇᴠᴇʟᴏᴘᴇʀ:* ${item.developer}\n*ʀᴀᴛᴇ:* ${item.rate2}\n*ʟɪɴᴋ:* ${item.link}\n`).join("\n");
    await message.send(cap);
  } else {
    await message.send({ url: result[0].img }, {
      caption: `*◦ɴᴀᴍᴇ:* ${result[0].name}\n*◦ᴅᴇᴠᴇʟᴏᴘᴇʀ:* ${result[0].developer}\n*◦ʀᴀᴛᴇ:* ${result[0].rate2}\n*◦ʟɪɴᴋ:* ${result[0].link}\n\n*Use -full for all results*\n_Example: .ps -full ${match}_`
    }, "image");
}});

System({
    pattern: 'xsearch',
    fromMe: isPrivate,
    nsfw: true,
    type: "search",
    desc: "Xnxx searcher"
}, async (message, match) => {
    if (!match || isUrl(match)) return await message.reply('_Please provide a valid query_');
    const data = await getJson(api + `search/xnxx?q=${encodeURIComponent(match)}`);
    await message.send(data.result.map(item => `*💎 Title:* ${item.title}\n*🔗 Link:* ${item.link}\n\n`).join(""));
});

System({
    pattern: 'duckgo',
    fromMe: isPrivate,
    type: "search",
    desc: "goduck searcher"
}, async (message, match) => {
    if (!match) return await message.reply("*Need a query to search*\n_Example: who is iron man_");
    const { result } = await getJson(api + "search/duckgo?q=" + match);
    if(!result.status) return await message.reply("*Can't find try again with more info*");
    await message.reply({ url: result.image }, { caption: `*⬢ Query :* ${match}\n\n*⬢ Description :* ${result.data}\n\n*⬢ Link :* ${result.url}` }, 'image');
});
