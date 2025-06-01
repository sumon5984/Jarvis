/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, sendAlive, setData, getData, isPrivate, config, database, removeData, removeCmd, bot } = require("../lib/");  
const { getUptime, Runtime } = require("./client/"); 

System({
	pattern: "(ping|speed)",
	fromMe: isPrivate,
	type: "tool",
	desc: "To check ping",
	adminAccess: true,
}, async (message) => {
	const start = new Date().getTime();
	const ping = await message.send("*𝆺𝅥 running 𝆺𝅥*");
	const end = new Date().getTime();
	return await ping.edit("*☇ ꜱᴩᷨᴇͦᴇͭᴅ ☁ :* " + (end - start) + " *ᴍꜱ* ");
});

System({
    pattern: 'mention',
    fromMe: true,
    desc: 'mention',
    type: 'tool'
}, async (message, match) => {
   const { mention = { status: "false", message: "" } } = await getData(message.user.id);
   if (match === "get" && message.isOwner) return await message.send(mention.message || '_*Mention not set yet*_');
   if (match && message.isOwner) {
       const status = match === "on" ? "true" : match === "off" ? "false" : mention.status;
       const msg = ["on", "off"].includes(match) ? mention.message : match;
       if (!msg.trim()) return await message.reply('_Invalid mention message! Please provide valid text._');
       const update = await setData(message.user.id, msg, status, "mention");
       return await message.reply(update ? '_Mention Updated_' : '_Error in updating_');
   };
   return await message.reply("_Check mention format at https://github.com/Loki-Xer/Jarvis-md/wiki_");
});

System({
    pattern: "(vv|view)",
    fromMe: true,
    type: "tool",
    desc: "get view ones message"
}, async (message) => {
   if (!message.reply_message.viewones) return await message.reply("_*Reply to a view once*_");
   return await message.client.forwardMessage(message.chat, message.reply_message.message, { readViewOnce: true });
});

System({
   pattern: "uptime",
   fromMe: true,
   type: "tool",
   desc: "get the running time of the bot"
}, async (message) => {
    const uptime = getUptime();
    if(message.fromMe) return await message.edit(uptime);
    return await message.reply(uptime);
});

System({
   pattern: "runtime",
   fromMe: true,
   desc: "get the delpoyed running time of the bot",
   type: "tool",
}, async (m) => {
    const { loginData } = await getData(m.user.number);
    const runtime = await Runtime(loginData.message);
    if(m.fromMe) return await m.edit(runtime);
    m.reply(runtime);
});

System({
   pattern: "reboot",
   fromMe: true,
   desc: "to reboot your bot",
   type: "tool",
}, async (message, match) => {
    await message.reply('_Rebooting..._')
    bot.restart();
});

System({
    pattern: 'alive',
    fromMe: isPrivate,
    desc: 'Check if the bot is alive',
    type: 'tool'
}, async (message, match) => {
    const { alive } = await getData(message.user.id);
    const data = alive ? alive.message : config.ALIVE_DATA;
    if (match === "get" && message.isOwner) return await message.send(data);
    if (match && message.isOwner) {
        const isUpdated = await setData(message.user.id, match, "true", "alive");
        return await message.send(isUpdated ? "_Alive Message Updated_" : "_Error in updating_");
    };
    return await sendAlive(message, data);
});

System({
    pattern: "setcmd",
    fromMe: true,
    desc: "set a sticker as a cmd",
    type: "tool",
}, async (message, match) => { 
    if (!message.quoted || !message.reply_message.msg || !message.reply_message.msg.fileSha256) return await message.reply('_Reply to an image/video/audio/sticker_'); 
    if (!match) return await message.reply('_Example: setcmd ping_'); 
    const hash = message.reply_message.msg.fileSha256.join("");
    const setcmd = await setData(hash, match, "true", "setCmd");
    if (!setcmd) return await message.reply('_Failed_');
    await message.reply('_Success_');
});

System({
    pattern: 'delcmd',
    fromMe: true,
    desc: 'to delete audio/image/video cmd',
    type: 'tool'
}, async (message, match) => {
    if (!match && !message.quoted) return await message.reply('_Send a cmd name to remove it or reply to an image/video/audio/sticker_');
    if(match) {
	const cmd = await removeCmd(match);
	if(!cmd) return await message.reply('_Failed_');
	return await message.reply('_Success_');
    };
    const hash = message.reply_message.msg.fileSha256.join("");
    if (!hash) return await message.reply('_Failed_');
    const delcmd = await removeData(hash, "setCmd");
    if (!delcmd) return await message.reply('_Failed_');
    await message.reply('_Success_');
});

System({
    pattern: 'listcmd',
    fromMe: true,
    desc: 'to list all commands',
    type: 'tool'
}, async (message, match) => {
    const result = await database.findAll({ where: { name: "setCmd" } });
    if (!result || result.length === 0) return await message.reply("_*No commands set*_");
    const messages = result.map((entry, index) => `_${index + 1}. ${entry.dataValues.message}_`);
    const formattedList = messages.join('\n');
    return await message.reply("*List Cmd*\n\n" + formattedList);
});
