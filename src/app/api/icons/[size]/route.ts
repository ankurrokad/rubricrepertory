import { NextResponse } from 'next/server';

// Generates a minimal valid PNG for a given size with the app's teal brand color
// This is used as a fallback — replace with real icons in production
function createMinimalPNG(size: number): Buffer {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: width, height, bit depth=8, color type=2 (RGB), compression=0, filter=0, interlace=0
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = buildChunk('IHDR', ihdrData);

  // IDAT: raw image data (teal #2D6A6A = 45, 106, 106)
  const zlib = require('zlib');
  const rowSize = size * 3 + 1; // filter byte + RGB per pixel
  const raw = Buffer.alloc(rowSize * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0; // filter type None
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;
      raw[px] = 45;   // R
      raw[px + 1] = 106; // G
      raw[px + 2] = 106; // B
    }
  }
  const compressed = zlib.deflateSync(raw);
  const idat = buildChunk('IDAT', compressed);

  // IEND chunk
  const iend = buildChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

function buildChunk(type: string, data: Buffer): Buffer {
  const crc32 = require('crc-32');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBytes = Buffer.from(type, 'ascii');
  const crcVal = crc32.buf(Buffer.concat([typeBytes, data])) >>> 0;
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBytes, data, crc]);
}

export async function GET(
  request: Request,
  { params }: { params: { size: string } }
) {
  const size = parseInt(params.size, 10);
  const validSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  if (!validSizes.includes(size)) {
    return new NextResponse('Invalid size', { status: 400 });
  }
  const png = createMinimalPNG(size);
  return new NextResponse(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
