/**
 * Generate SVG API Endpoint
 * Server-side SVG generation using existing buildSVG logic
 */

import { buildSVG } from '@/app/lib/Nouns/utils/svg-builder';
import { ImageData } from '@/app/lib/Nouns/utils/image-data';

interface GenerateSVGRequest {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

export async function POST(req: Request) {
  try {
    const { background, body, accessory, head, glasses }: GenerateSVGRequest = await req.json();

    // Validate inputs
    if (
      typeof background !== 'number' ||
      typeof body !== 'number' ||
      typeof accessory !== 'number' ||
      typeof head !== 'number' ||
      typeof glasses !== 'number'
    ) {
      return Response.json(
        { error: 'Invalid input: all fields must be numbers' },
        { status: 400 }
      );
    }

    // Validate ranges
    if (
      background < 0 || background >= ImageData.bgcolors.length ||
      body < 0 || body >= ImageData.images.bodies.length ||
      accessory < 0 || accessory >= ImageData.images.accessories.length ||
      head < 0 || head >= ImageData.images.heads.length ||
      glasses < 0 || glasses >= ImageData.images.glasses.length
    ) {
      return Response.json(
        { error: 'Invalid input: trait indices out of range' },
        { status: 400 }
      );
    }

    // Get background color
    const bgColor = ImageData.bgcolors[background];

    // Get image parts
    const parts = [
      { data: ImageData.images.bodies[body].data },
      { data: ImageData.images.accessories[accessory].data },
      { data: ImageData.images.heads[head].data },
      { data: ImageData.images.glasses[glasses].data },
    ];

    // Build SVG using existing logic
    const svg = buildSVG(parts, ImageData.palette, bgColor);

    return Response.json({ svg }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error('Error generating SVG:', error);
    return Response.json(
      { error: 'Failed to generate SVG' },
      { status: 500 }
    );
  }
}

// Also support GET requests for direct URL generation
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const background = parseInt(searchParams.get('background') || '0');
    const body = parseInt(searchParams.get('body') || '0');
    const accessory = parseInt(searchParams.get('accessory') || '0');
    const head = parseInt(searchParams.get('head') || '0');
    const glasses = parseInt(searchParams.get('glasses') || '0');

    // Validate ranges
    if (
      isNaN(background) || isNaN(body) || isNaN(accessory) || isNaN(head) || isNaN(glasses) ||
      background < 0 || background >= ImageData.bgcolors.length ||
      body < 0 || body >= ImageData.images.bodies.length ||
      accessory < 0 || accessory >= ImageData.images.accessories.length ||
      head < 0 || head >= ImageData.images.heads.length ||
      glasses < 0 || glasses >= ImageData.images.glasses.length
    ) {
      return Response.json(
        { error: 'Invalid trait indices' },
        { status: 400 }
      );
    }

    // Get background color
    const bgColor = ImageData.bgcolors[background];

    // Get image parts
    const parts = [
      { data: ImageData.images.bodies[body].data },
      { data: ImageData.images.accessories[accessory].data },
      { data: ImageData.images.heads[head].data },
      { data: ImageData.images.glasses[glasses].data },
    ];

    // Build SVG
    const svg = buildSVG(parts, ImageData.palette, bgColor);

    return Response.json({ svg }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Error generating SVG:', error);
    return Response.json(
      { error: 'Failed to generate SVG' },
      { status: 500 }
    );
  }
}

