/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const fs = require('fs');
const ff = require('fluent-ffmpeg');
const { Image } = require("node-webpmux");
const { fromBuffer } = require('file-type');
const { exec } = require("child_process");
const axios = require("axios");
const {
    config,
    System,
    isPrivate,
    toAudio,
    toVideo,
    sendUrl,
    webpToPng,
    webp2mp4,
    setData,
    getData,
    translate,
    makeUrl
} = require("../lib/");
const { 
    trim,
    getJson,
    IronMan,
    postJson,
    removeBg,
    getBuffer,
    cropImage,
    AddMp3Meta,
    elevenlabs,
    cropToCircle,
    extractUrlsFromText,
    createRoundSticker
} = require("./client/"); 
const stickerPackNameParts = config.STICKER_PACKNAME.split(";");
const fancy = require('./client/fancy');

System({
    pattern: "photo",
    fromMe: isPrivate,
    desc: "Sticker to Image",
    type: "converter",
}, async (message) => {
   if (!message.reply_message?.sticker) return await message.reply("_Reply to a sticker_");
   if (message.reply_message.isAnimatedSticker) return await message.reply("_Reply to a non-animated sticker message_");
   let buffer = await webpToPng(await message.reply_message.downloadAndSave());
   return await message.send(buffer, {}, "image");
});

System({
    pattern: "mp3",
    fromMe: isPrivate,
    desc: "mp3 converter",
    type: "converter",
}, async (message, match) => {
   if (!(message.reply_message.video || message.reply_message.audio))
   return await message.reply("_Reply to audio or video_");	
   var audioResult = await toAudio(await message.reply_message.download());
   const [firstName, author, image] = config.AUDIO_DATA.split(";");
   const aud = await AddMp3Meta(audioResult, await getBuffer(image), { title: firstName, body: author });
   await message.reply(aud, { mimetype: "audio/mp4" }, "audio");
});


System({
    pattern: "ptv",
    fromMe: isPrivate,
    desc: "video into pvt converter",
    type: "converter",
}, async (message) => {
   if (!message.video && !message.reply_message.video) return message.reply("_*Reply to a video*_");
   const buff = await message.downloadMediaMessage(message.video ? message.msg : message.quoted ? message.reply_message.msg : null);
   await message.reply(buff, { ptv: true }, "video");
});

System({
    pattern: "wawe",
    fromMe: isPrivate,
    desc: "audio into wave",
    type: "converter",
}, async (message) => {
   if (!message.quoted || !message.reply_message?.audio && !message.reply_message?.video) return await message.reply("_Reply to an audio/video_");
   let media = await toAudio(await message.reply_message.download());
   return await message.send(media, { mimetype: 'audio/mpeg', ptt: true, quoted: message.data }, "audio");
});

System({
    pattern: "mp4",
    fromMe: isPrivate,
    desc: "Changes sticker to Video",
    type: "converter",
}, async (message) => {
   if (!message.reply_message?.sticker) return await message.reply("_Reply to a sticker_");
   if (!message.reply_message.isAnimatedSticker) return await message.reply("_Reply to an animated sticker message_");
   let buffer = await webp2mp4(await message.reply_message.download());
   return await message.send(buffer, {}, "video");
});

System({
    pattern: "gif",
    fromMe: isPrivate,
    desc: "Changes sticker to Gif",
    type: "converter",
}, async (message) => {
   if (!message.reply_message?.sticker) return await message.reply("_Reply to a sticker_");
   if (!message.reply_message.isAnimatedSticker) return await message.reply("_Reply to an animated sticker message_");
   const buffer = await webp2mp4(await message.reply_message.download());
   return await message.send(buffer, { gifPlayback: true }, "video");
});

System({
    pattern: 'black',
    fromMe: isPrivate,
    desc: 'make audio into black video',
    type: "converter"
}, async (message) => {
        const ffmpeg = ff();
        if (!message.reply_message?.audio) return await message.send("_Reply to an audio message_");
        const file = './plugins/client/black.jpg';
        const audioFile = './lib/temp/audio.mp3';
        fs.writeFileSync(audioFile, await message.reply_message.download());
        ffmpeg.input(file);
        ffmpeg.input(audioFile);
        ffmpeg.output('./lib/temp/videoMixed.mp4');
        ffmpeg.on('end', async () => {
            await message.send(fs.readFileSync('./lib/temp/videoMixed.mp4'), {}, 'video');
        });
        ffmpeg.on('error', async (err) => {
            console.error('FFmpeg error:', err);
            await message.reply("An error occurred during video conversion.");
        });
        ffmpeg.run();
});

System({
    pattern: "fancy",
    fromMe: isPrivate,
    desc: "converts text to fancy text",
    type: "converter",
 }, (async (message, match) => {    
    if (!match && !message.reply_message.message) return await message.reply('\n*Fancy text*\n\n*Example:*\n*reply to a text and : fancy 7*\n*or*\n*use : fancy hy 5*\n\n'+String.fromCharCode(8206).repeat(4001)+fancy.list('Text here',fancy));
    const id = match.match(/\d/g)?.join('')
     try {
        if (id === undefined && !message.reply_message){
            return await message.reply(fancy.list(match, fancy));
        }
        return await message.reply(fancy.apply(fancy[parseInt(id)-1], message.reply_message.text || match.replace(id,'')))    
    } catch {
        return await message.reply('_*No such style :(*_')
     }
 }));

System({
    pattern: "circle",
    fromMe: isPrivate,
    desc: "Make circle photo or sticker",
    type: "converter",
}, async (message) => {
   if (!(message.image || message.reply_message.sticker || message.reply_message.image)) return await message.reply("_*Reply to photo or sticker*_");
   if (message.reply_message.isAnimatedSticker) return await message.reply("_Reply to a non-animated sticker message_");
   let media = await message.downloadMediaMessage(message.image ? message : message.quoted ? message.reply_message : null);
   if(message.image || message.reply_message.image) {
       return await message.send(await cropToCircle(media), {}, 'image');
   };
   await message.send(await createRoundSticker(media), { packname: stickerPackNameParts[0], author: stickerPackNameParts[1] }, "sticker");
});

System({
    pattern: "crop",
    fromMe: isPrivate,
    desc: "crop image or sticker",
    type: "converter",
}, async (message) => {
   if (!(message.image || message.reply_message.sticker || message.reply_message.image)) return await message.reply("_*Reply to photo or sticker*_");
   if (message.reply_message.isAnimatedSticker) return await message.reply("_Reply to a non-animated sticker message_");
   if(message.image || message.reply_message.image) {
       let media = await message.downloadMediaMessage(message.image ? message : message.quoted ? message.reply_message : null);
       return await message.send(await cropImage(media), {}, 'image');
   };
   await message.send(await cropImage(await webpToPng(await message.reply_message.downloadAndSave())), { packname: stickerPackNameParts[0], author: stickerPackNameParts[1] }, "sticker");
});

System({
    pattern: "take",
    fromMe: isPrivate,
    desc: "Changes Exif data of stickers",
    type: "converter",
}, async (message, match) => {
   let data;
   if (!message.quoted || (!message.reply_message.sticker && !message.reply_message.audio)) return await message.reply("_Reply to a sticker or audio_");
   if (message.reply_message.sticker) {
   const stickerPackName = (match || config.STICKER_PACKNAME).split(";");
   await message.send(await message.reply_message.download(), { packname: stickerPackName[0], author: stickerPackName[1] }, "sticker");
   } else if (message.reply_message.audio) {
   const buff = await message.reply_message.download();
   const audioBuffer = Buffer.from(buff);
   const audioResult = await toAudio(audioBuffer, 'mp4');
   if (match) data = match.split(";");
   data = config.AUDIO_DATA.split(";");
   await message.reply(await AddMp3Meta(audioResult, await getBuffer(data[2]), { title: data[0], body: data[1] }), { mimetype: "audio/mp4" }, "audio");
}});


System({
    pattern: "sticker",
    fromMe: isPrivate,
    type: "converter",
    desc: "_Converts Photo or video to sticker_",
}, async (message, match) => {
   if (!(message.image || message.video || message.reply_message.video || message.reply_message.image)) return await message.reply("_Reply to photo or video_"); 
   let media = (message.video || message.image)? message.msg : message.quoted? message.reply_message.msg : null;  
   let buff = await message.downloadMediaMessage(media);
   await message.send(buff, { packname: stickerPackNameParts[0], author: stickerPackNameParts[1] }, "sticker");
});

System({
    pattern: "exif",
    fromMe: isPrivate,
    desc: "get exif data",
    type: "converter",
}, async (message, match) => {
   if (!message.reply_message || !message.reply_message.sticker) return await message.reply("_Reply to sticker_");
   let img = new Image();
   await img.load(await message.reply_message.download());
   const exif = JSON.parse(img.exif.slice(22).toString());
   const stickerPackId = exif['sticker-pack-id'];
   const stickerPackName = exif['sticker-pack-name'];
   const stickerPackPublisher = exif['sticker-pack-publisher'];
   const cap = (`*Sticker Pack ID -->* ${stickerPackId}\n\n*Pack name -->* ${stickerPackName}\n\n*Publisher Name -->* ${stickerPackPublisher}`)
   await message.reply(cap);
});

System({
    pattern: "aitts",
    type: "converter",
    fromMe: isPrivate,
    desc: 'generate ai voices'
}, async (message, match) => {
   if (match == 'list') 
   return await message.send(` *List of Aitts*\n\n 1 _rachel_ \n 2 _clyde_ \n 3 _domi_ \n 4 _dave_ \n 5 _fin_ \n 6 _bella_ \n 7 _antoni_ \n 8 _thomas_ \n 9 _charlie_ \n 10 _emily_ \n 11 _elli_ \n 12 _callum_ \n 13 _patrick_ \n 14 _harry_ \n 15 _liam_ \n 16 _dorothy_ \n 17 _josh_ \n 18 _arnold_ \n 19 _charlotte_ \n 20 _matilda_ \n 21 _matthew_ \n 22 _james_ \n 23 _joseph_ \n 24 _jeremy_ \n 25 _michael_ \n 26 _ethan_ \n 27 _gigi_ \n 28 _freya_ \n 29 _grace_ \n 30 _daniel_ \n 31 _serena_ \n 32 _adam_ \n 33 _nicole_ \n 34 _jessie_ \n 35 _ryan_ \n 36 _sam_ \n 37 _glinda_ \n 38 _giovanni_ \n 39 _mimi_ \n`.replace(/├/g, ''));
   const [v, k] = match.split(/,;|/);
   if (!k && !v) return await message.send(`*_need voice id and text_*\n_example_\n\n_*aitts* hey vroh its a test,adam_\n_*aitts list*_`)
   const stream = await elevenlabs(match)
   if (!stream) return await message.send(`_*please upgrade your api key*_\n_get key from http://docs.elevenlabs.io/api-reference/quick-start/introduction_\n_example_\n\nsetvar elvenlabs: your key\n_or update your config.js manually_`);
   return await message.send({ stream }, { mimetype: 'audio/mpeg' }, 'audio');
});

System({
    pattern: 'doc',
    desc: "convert media to document",
    type: 'converter',
    fromMe: isPrivate
}, async (message, match) => {
    match = (match || "converted media").replace(/[^A-Za-z0-9]/g,'-');
    if (!(message.image || message.video || (message.quoted && (message.reply_message.image || message.reply_message.audio || message.reply_message.video)))) return message.send("_*Reply to a video/audio/image message!*_");
    let msg = (message.video || message.image)? message.msg : message.quoted? message.reply_message.msg : null;  
    let media = await message.downloadMediaMessage(msg);
    const { ext, mime } = await fromBuffer(media);
    return await message.reply(media, { mimetype: mime, fileName: match + "." + ext }, "document");
});

System({
  pattern: 'rotate',
  fromMe: isPrivate,
  desc: 'Rotate image or video in any direction',
  type: 'converter'
}, async (message, match) => {
  if (!(message.image || message.video || (message.quoted && (message.reply_message.image || message.reply_message.video)))) return await message.reply('*Reply to an image/video*');
  const rmap = { 'left': 90, 'right': 180, 'vertical': 'vertical', 'horizontal': 'horizontal' };
  const rtype = match ? match.toLowerCase() : '';
  if (!rmap.hasOwnProperty(rtype)) return await message.reply('*Need rotation type.*\n_Example: .rotate left, right, vertical, or horizontal_');
  const option = rmap[rtype];
  var url = await makeUrl(await message.reply_message.downloadAndSave(), { 'User-Agent': 'Jarvis' });
  await message.sendFromUrl(IronMan(`ironman/convert/rotate?image=${url}&option=${option}`));
});

System({
    pattern: "url",
    fromMe: isPrivate,
    desc: "make media into url",
    type: "converter",
}, async (message, match) => {
    if (!message.quoted || (!message.reply_message.image && !message.reply_message.video && !message.reply_message.audio && !message.reply_message.sticker)) return await message.reply('*Reply to image,video,audio,sticker*');
    return await sendUrl(message);
});


System({
    pattern: "rbg", 
    fromMe: isPrivate,
    desc: "To remove bg", 
    type: "converter",
}, async (m, match) => {
   if (match && match.includes("key")) {
        await setData(m.user.id, match.split(":")[1].trim(), "true", "removeBg");
        return m.reply("*Key added successfully. Now you can use rbg.*");
    }
    if (!m.image && !m.reply_message.image) return m.reply("*Reply to an image*");
    const db = await getData(m.user.id);
    if (!db.removeBg) return m.reply(`*Dear user, get an API key to use this command. Sign in to remove.bg and get an API key. After that, use* \n\n *${m.prefix} rbg key: _your API key_* \n\n Sign in here: https://www.remove.bg/dashboard#api-key`);
    
    let buff = await removeBg(await m.downloadAndSaveMediaMessage(m.image ? m.msg : m.quoted ? m.reply_message.msg : null), db.removeBg.message);
    if(!buff) return m.reply("*Error in api key or can't upload to remove.bg*");
    await m.reply(buff, {}, "image");
});

System({
    pattern: "trim",
    fromMe: isPrivate,
    desc: "to trim audio/video",
    type: "converter",
}, async (m, text) => {
    if (!(m.video || (m.quoted && (m.reply_message.audio || m.reply_message.video)))) return m.reply("*Reply to a video/audio e.g. _.trim 1.0,3.0*");
    if (!text) return m.reply("*Need query to trim e.g.: _.trim 1.0,3.0*");
    const parts = text.split(',');
    const numberRegex = /^-?\d+(\.\d+)?$/;
    const areValidNumbers = parts.every(part => numberRegex.test(part));
    if (!areValidNumbers) return m.reply("*Please check your format. The correct format is .trim 1.0,3.0*");
    if (m.video && m.reply_message.video) {
        const file = await m.downloadMediaMessage(m.video ? m.msg : m.quoted ? m.reply_message.msg : null);
        const output = await trim(file, parts[0], parts[1]);
        if (!output) return m.reply("*Please check your format. The correct format is .trim 1.0,3.0*"); 
        await m.reply(output, {}, "video");
    } else if (m.reply_message.audio) {
        const file = await toVideo(await m.reply_message.downloadAndSave());
        const output = await trim(file, parts[0], parts[1]);
        if (!output) return m.reply("*Please check your format. The correct format is .trim 1.0,3.0*");
        await m.reply(output, { mimetype: "audio/mp4" }, "audio");
    }
});


System({
  pattern: "trt",
  fromMe: isPrivate,
  desc: "change language",
  type: "converter",
}, async (message, match) => {
  match = message.reply_message.text || match;
  if(message.quoted && message.reply_message.text && match) match = message.reply_message.text + ";" + match;
  if (!match) return await message.reply("_provide text to translate *eg: i am fine;ml*_");
  const text = match.split(";");  
  const result = await translate(text[0], text[1] || config.LANG);
  return await message.reply(result);
});
