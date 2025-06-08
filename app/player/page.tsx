// app/player/page.tsx (Server Component)
import React from 'react'
import PlayerClient from './PlayerClient'

export default function PlayerPage() {
    return (
        <React.Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-white bg-black">Loading...</div>}>
            <PlayerClient />
        </React.Suspense>
    )
}