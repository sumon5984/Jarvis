/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const {
    isJid,
    System,
    config,
    isPrivate 
} = require("../lib/");
const { isUrl, extractUrlsFromText } = require('./client/');
  
  
System({
    pattern: "wm",
    fromMe: isPrivate,
    desc: "wame generator",
    type: "misc",
}, async (message, match) => {
    if (!message.quoted) return message.reply("_*Reply to a user*_");
    let sender = message.reply_message?.sender || message.mention?.[0] || message.text;
    if (!isJid(sender)) return message.reply("*Can't find number*");
    return await message.reply('https://wa.me/' + sender.split('@')[0]);
});


System({
  pattern: 'ss',
  fromMe: true,
  desc: 'Takes a screenshot of a website',
  type: 'misc',
}, async (message, match) => {
  let url = (await extractUrlsFromText(match || message.reply_message.text))[0];
  if (!url) return await message.reply(`*Please provide a URL*`);
  if (!isUrl(url)) return await message.reply(`*Please provide a valid URL*`);
  await message.sendFromUrl(api + "tools/ssweb?q=" + url, { caption: `*Screenshot of ${url}*` });
});

  System({
      pattern: "save", 
      fromMe: true,
      desc: "used to save messages", 
      type: "misc",
  }, async (message) => {
     if (!message.quoted) return;
     await message.client.forwardMessage(message.user.jid, message.reply_message.message);
  });


System({
      pattern: 'whois',
      fromMe: isPrivate,
      desc: 'to find how is',
      type: 'whatsapp',
  }, async (message, match) => {
      let user = message.quoted ? message.reply_message.sender : `${match.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
      if (!user) return message.reply('_Reply to someone or mention_\n*Example:* .whois @user');
      let [pp, name] = await Promise.all([message.getPP(user), message.store.getName(user)]);
      let [statusObj] = await message.client.fetchStatus(user).catch(() => ([{ status: 'private' }]));
      let aboutText = (statusObj.status && statusObj.status.status) || 'private';
      let setAtDate = statusObj.status && statusObj.status.setAt;
      let formattedSetAt = setAtDate ? new Date(setAtDate).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : 'Not available';
      let caption = `*Name:* ${name}\n`;
      caption += isJid(user) ? `*About:* ${aboutText}${formattedSetAt ? `\n*About Set Date:* ${formattedSetAt}` : ''}\n*WhatsApp:* https://wa.me/${user.split('@')[0]}` : '*About:* Number is Private';
      await message.send({ url: pp }, { caption, quoted: message }, 'image');
});
  
  System({
      pattern: 'tts',
      fromMe: isPrivate,
      desc: 'It converts text to sound.',
      type: 'converter'
  }, async (message, match) => {
      if (!(match || message.reply_message.text)) return await message.reply('_Need Text!_\n_Example: tts Hello_\n_tts Hello {en}_');
      let LANG = config.LANG.toLowerCase();
      const lang = match.match("\\{([a-z]+)\\}");
      if (lang) {
        match = match.replace(lang[0], '');
        LANG = lang[1];
        if (message.reply_message.text) match = message.reply_message.text;
      }
      const response = await fetch(api + 'tools/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: match, lang: LANG }) });
      if (response.ok) {
          const data = await response.arrayBuffer();
          await message.reply(Buffer.from(data), { mimetype: 'audio/ogg; codecs=opus', ptt: true }, "audio");
      } else {
          await message.reply("Error:", response.status, response.statusText);
      }
  });
  
