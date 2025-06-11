import React from 'react'
import PlayerClient from "@/app/player/PlayerClient";

export default function RecommendPage() {
    return (
        <React.Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-white bg-black">Loading...</div>}>
            <PlayerClient />
        </React.Suspense>
    )
}