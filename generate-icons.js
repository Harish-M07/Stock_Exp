const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0);
    }
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function createPNG(width, height) {
  var signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  var ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  var ihdr = createChunk('IHDR', ihdrData);

  var rowSize = 1 + width * 3;
  var rawData = Buffer.alloc(height * rowSize);

  for (var y = 0; y < height; y++) {
    var rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (var x = 0; x < width; x++) {
      var pixOffset = rowOffset + 1 + x * 3;
      rawData[pixOffset] = 0;
      rawData[pixOffset + 1] = 188;
      rawData[pixOffset + 2] = 212;
    }
  }

  var compressed = zlib.deflateSync(rawData);
  var idat = createChunk('IDAT', compressed);
  var iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

var iconsDir = path.join(__dirname, 'quantsage-extension', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

var sizes = [
  { size: 16, name: 'icon16.png' },
  { size: 48, name: 'icon48.png' },
  { size: 128, name: 'icon128.png' }
];

sizes.forEach(function(item) {
  var pngBuffer = createPNG(item.size, item.size);
  var filePath = path.join(iconsDir, item.name);
  fs.writeFileSync(filePath, pngBuffer);
  console.log('Created ' + item.name + ' (' + pngBuffer.length + ' bytes)');
});

console.log('Done! All icons generated successfully.');
