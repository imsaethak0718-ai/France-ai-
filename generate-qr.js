const QRCode = require('qrcode');

const url = process.argv[2] || 'https://france-ai.vercel.app';
const artifactPath = '/Users/sarthakmangalwedhekar/.gemini/antigravity/brain/abf7d681-9014-4734-8974-33f2243f2f9f/website_qr.png';
const publicPath = './public/website-qr.png';

const options = {
  color: {
    dark: '#0f172a', // slate-900 (matches typical scheme)
    light: '#ffffff'
  },
  width: 1024,
  margin: 2
};

QRCode.toFile(artifactPath, url, options, function (err) {
  if (err) throw err;
  console.log('QR Code saved for user to see at', artifactPath);
});

QRCode.toFile(publicPath, url, options, function (err) {
  if (err) throw err;
  console.log('QR Code saved to public/website-qr.png');
});
