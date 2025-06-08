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

        return () => {
            setTrackList([])
            setCurrentTrack(null)
        }
    }, [trackId, email])

    const coverUrl = currentTrack?.coverImageUrl
        ? `${process.env.NEXT_PUBLIC_API_BASE}/api/tracks/${currentTrack.id}/cover`
        : null

    // Custom Animated Loader
    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-black">
                <div className="flex space-x-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-8 bg-white rounded animate-bounce`}
                            style={{
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: '1.2s',
                                animationIterationCount: 'infinite',
                            }}
                        />
                    ))}
                </div>
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

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Blurred background cover */}
            {coverUrl && (
                <Image
                    src={coverUrl}
                    alt="Background Cover"
                    fill
                    className="absolute inset-0 object-cover blur-2xl scale-110 opacity-40 z-0"
                    priority
                />
            )}

            {/* Centered spinning CD on mobile */}
            {coverUrl && (
                <div className="sm:hidden absolute inset-0 z-10 flex items-center justify-center">
                    <div className="w-60 h-60 rounded-full overflow-hidden border-4 border-white shadow-xl animate-spin-slow">
                        <Image
                            src={coverUrl}
                            alt="CD Cover"
                            width={240}
                            height={240}
                            className="object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Player */}
            <div className="relative z-20 w-full h-full text-white flex items-end">
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
