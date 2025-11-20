import { NextRequest, NextResponse } from 'next/server';

// DEPRECATED: Use /api/centres, /api/pages, /api/pages/[id], and /api/pages/[id]/publish instead

function gone() {
  return NextResponse.json(
    {
      success: false,
      message:
        'This endpoint is deprecated. Use /api/centres, /api/pages, /api/pages/[id], and /api/pages/[id]/publish.',
    },
    { status: 410 },
  );
}

export async function GET(_request: NextRequest) {
  return gone();
}

export async function POST(_request: NextRequest) {
  return gone();
}

export async function PATCH(_request: NextRequest) {
  return gone();
}

export async function DELETE(_request: NextRequest) {
  return gone();
}
