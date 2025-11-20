import { NextRequest, NextResponse } from 'next/server';

// DEPRECATED: Use /api/pages/[id] (GET) and /api/pages/[id] (PUT with blocks) instead

function gone() {
  return NextResponse.json(
    {
      success: false,
      message: 'This endpoint is deprecated. Use /api/pages/[id] GET/PUT for block CRUD operations.',
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
