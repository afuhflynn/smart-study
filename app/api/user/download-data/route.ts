import { NextRequest, NextResponse } from "next/server";

// This is handled by the export-data route's GET method
// This file just redirects for cleaner URL structure
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=invalid-token", request.url)
    );
  }

  // Redirect to the actual download endpoint
  return NextResponse.redirect(
    new URL(`/api/user/export-data?token=${token}`, request.url)
  );
}
