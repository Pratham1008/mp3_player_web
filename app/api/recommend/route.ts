import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get("trackId");
    const userEmail = searchParams.get("userEmail");

    if (!trackId || !userEmail) {
        return NextResponse.redirect("https://mp3-player-web.vercel.app/404");
    }

    return NextResponse.redirect(
        `https://mp3-player-web.vercel.app/player?trackId=${trackId}&userEmail=${userEmail}`
    );
}
