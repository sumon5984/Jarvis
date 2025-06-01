/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const { System, isPrivate, yts } = require('../lib');
const { audioCut } = require("./client/"); 
const FormData = require('form-data');
const axios = require('axios');  
const crypto = require('crypto');
const fs = require('fs');

function buildStringToSign(
    method,
    uri,
    accessKey,
    dataType,
    signatureVersion,
    timestamp
) {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join(
        '\n'
    );
}

function sign(signString, accessSecret) {
    return crypto
        .createHmac('sha1', accessSecret)
        .update(Buffer.from(signString, 'utf-8'))
        .digest()
        .toString('base64');
}

System({
    pattern: 'find',
    fromMe: isPrivate,
    desc: 'Find details of a song',
    type: 'search',
}, async (message, match) => {
    if (!message.quoted || (!message.reply_message.audio && !message.reply_message.video)) return await message.reply('*Reply to audio or video*');
    const p = await message.reply_message.downloadAndSave();
    const options = {
       host: 'identify-eu-west-1.acrcloud.com',
       endpoint: '/v1/identify',
       signature_version: '1',
       data_type: 'audio',
       secure: true,
       access_key: '4dcedd3dc6d911b38c988b872afa7e0d',
       access_secret: 'U0PEUg2y6yGVh6NwJra2fJkiE1R5sCfiT6COLXuk',
    };
    const data = await audioCut(p, 0, 15);
    const current_data = new Date();
    const timestamp = current_data.getTime() / 1000;
    const stringToSign = buildStringToSign(
        'POST',
        options.endpoint,
        options.access_key,
        options.data_type,
        options.signature_version,
        timestamp
    );
    const signature = sign(stringToSign, options.access_secret);
    const form = new FormData();
    form.append('sample', data);
    form.append('sample_bytes', data.length);
    form.append('access_key', options.access_key);
    form.append('data_type', options.data_type);
    form.append('signature_version', options.signature_version);
    form.append('signature', signature);
    form.append('timestamp', timestamp);

    const res = await axios.post('http://' + options.host + options.endpoint, form, {
        headers: form.getHeaders()
    });

    const { status, metadata } = res.data;
    if (status.msg !== 'Success') {
        return await message.reply(status.msg);
    }
    
    const { album, release_date, artists, title } = metadata.music[0];
    const yt = await yts(title);

    const cap = `*_${yt[0].title}_*\n\n\n*Album :* ${album.name || ''}\n*Artists :* ${artists !== undefined ? artists.map((v) => v.name).join(', ') : ''}\n*Release Date :* ${release_date}\n\n\`\`\`1.⬢\`\`\` *audio*\n\`\`\`2.⬢\`\`\` *video*\n\n_*Send a number as a reply to download*_`;
    await message.send({ url: yt[0].image }, { caption: cap }, "image");
});
