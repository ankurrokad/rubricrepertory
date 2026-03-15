import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Serve the app logo as the PWA icon
    const logoPath = join(process.cwd(), 'public', 'assets', 'images', 'app_logo.png');
    const logo = readFileSync(logoPath);
    return new NextResponse(logo, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Icon not found', { status: 404 });
  }
}
