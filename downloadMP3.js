const axios = require('axios');
const fs = require('fs');
const path = require('path');
const fetchAPI = require('node-fetch'); // Import 'node-fetch' for Node.js environment

// const url = "https://chrt.fm/track/597CEG/www.buzzsprout.com/1964407/13459963-should-we-pay-300-million-for-this-athletic-equipment-business-acquisitions-anonymous-223.mp3";
// const url = "http://open.live.bbc.co.uk/mediaselector/6/redir/version/2.0/mediaset/audio-nondrm-download/proto/http/vpid/p03jn4gx.mp3"
// const url = "https://pdst.fm/e/chrt.fm/track/28555/pdrl.fm/2a922f/traffic.megaphone.fm/HS5602143885.mp3?updated=1692405370"
// const downloadPath = path.join(__dirname, 'downloaded.mp3'); // Change the filename and path as needed

const downloadPath = path.join("./files", 'downloaded.mp4');

async function downloadAudio(audioUrl) {
  try {
    const response = await axios({
      method: 'get',
      url: audioUrl,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(downloadPath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('Audio downloaded successfully!');
        resolve('Download successful');
      });

      writer.on('error', error => {
        console.error('Error writing audio file:', error);
        reject('Error writing audio file');
      });
    });

  } catch (error) {
    console.error('Error downloading the audio:', error);
    throw 'Error downloading audio';
  }
}

module.exports = downloadAudio
