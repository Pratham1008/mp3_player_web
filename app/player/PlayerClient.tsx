'use client'

import React, { useEffect, useState } from 'react'
import AudioPlayer from '@/components/AudioPlayer'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image'
import { Track } from '@/lib/types'

export default function PlayerClient() {
    const searchParams = useSearchParams()
    const trackId = searchParams.get('trackId')
    const email = searchParams.get('email')

    const [trackList, setTrackList] = useState<Track[]>([])
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!trackId || !email) return

        const fetchTracks = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/tracks`)
                const tracks: Track[] = res.data
                setTrackList(tracks)

                const foundTrack = tracks.find((t) => t.id === trackId)
                setCurrentTrack(foundTrack || null)
            } catch (err) {
                console.error('Failed to fetch tracks', err)
                setCurrentTrack(null)
            } finally {
                setLoading(false)
            }
        }

        fetchTracks()
    }, [trackId, email])

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center text-white bg-black">
                Loading track...
            </div>
        )
    }

    if (!currentTrack) {
        return (
            <div className="w-full h-screen flex items-center justify-center text-white bg-black">
                Track not found.
            </div>
        )
    }

    const coverUrl = currentTrack.coverImageUrl
        ? `${process.env.NEXT_PUBLIC_API_BASE}/api/tracks/${currentTrack.id}/cover`
        : null

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {coverUrl && (
                <Image
                    src={coverUrl}
                    alt="Background Cover"
                    fill
                    className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40"
                    priority
                />
            )}

            <div className="relative z-20 w-full h-full text-white flex items-center justify-center">
                <AudioPlayer
                    track={currentTrack}
                    userEmail={email!}
                    trackList={trackList}
                    setTrack={setCurrentTrack}
                />
            </div>
        </div>
    )
}
