const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp'); 
const fs = require('fs');

const audioCut = (infile, start, end, filename = "cutted") => new Promise((resolve, reject) => {
  ffmpeg(infile)
   .setStartTime(start)
   .setDuration(end)
   .save(filename + ".mp3")
   .on("error", (e => reject(new Error(e.message))))
   .on("end", (() => {
      const file = fs.readFileSync(filename + ".mp3");
      resolve(file);
    }));
});

async function trim(buff, startTrim, endTrim) {
    try {
        const tempFile = "../temp.mp4";
        const outputFile = "trimmed_video.mp4";
        await fs.promises.writeFile(tempFile, buff);
        await new Promise((resolve, reject) => {
            ffmpeg(tempFile)
                .setStartTime(startTrim)
                .setDuration(parseFloat(endTrim) - parseFloat(startTrim))
                .output(outputFile)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
        const file = await fs.promises.readFile(outputFile);
        await fs.promises.unlink(tempFile);
        await fs.promises.unlink(outputFile);
        return file;
    } catch (error) {
        return false;;
    }
};


async function createRoundSticker(mediaBuffer) {
  const roundedSticker = await sharp(mediaBuffer)
    .resize(512, 512) 
    .composite([
      {
        input: Buffer.from(
          '<svg><circle cx="256" cy="256" r="256" fill="white" /></svg>' 
        ),
        blend: 'dest-in' 
      }
    ])
    .webp({ quality: 75 }) 
    .toBuffer();

  return roundedSticker;
};

async function cropToCircle(input) {
  try {
    const image = sharp(input);
    const { width, height } = await image.metadata();
    const circleMask = Buffer.from(
      `<svg width="${width}" height="${height}">
         <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2}" fill="white"/>
       </svg>`
    );

    const croppedImage = await image
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .toFormat('webp', { quality: 50 })
      .toBuffer();

    return croppedImage;
  } catch (error) {
    console.error('Error cropping image to circle:', error);
    throw error;
  }
};

async function cropImage(mediaBuffer) {
  const image = sharp(mediaBuffer);
  const metadata = await image.metadata();

  const size = Math.min(metadata.width, metadata.height);
  const left = Math.floor((metadata.width - size) / 2);
  const top = Math.floor((metadata.height - size) / 2);

  const croppedBuffer = await image
    .extract({ left, top, width: size, height: size })
    .toBuffer();

  return croppedBuffer;
};


module.exports = { 
  trim, 
  audioCut,
  cropImage,
  cropToCircle,
  createRoundSticker
};
