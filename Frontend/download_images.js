const fs = require('fs');
const https = require('https');
const path = require('path');

const downloads = [
  {
    url: 'https://cloudmosaic.ai/Images/Force-ERP.jpeg',
    dest: path.join(__dirname, 'public', 'images', 'Force-ERP.jpeg')
  },
  {
    url: 'https://cloudmosaic.ai/Images/brainzyx.jpg',
    dest: path.join(__dirname, 'public', 'images', 'brainzyx.jpg')
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${url} -> ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const item of downloads) {
    try {
      await downloadFile(item.url, item.dest);
    } catch (err) {
      console.error(`Error downloading ${item.url}:`, err.message);
    }
  }
}

run();
