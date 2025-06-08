'use client'

import React, { useEffect, useState } from 'react'
import AudioPlayer from '@/components/AudioPlayer'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image'
import { Track } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

const VinylSVG = () => (
    <svg viewBox="0 0 512 512" className="w-full h-full">
        <circle cx="256" cy="256" r="250" fill="black" />
        <circle cx="256" cy="256" r="50" fill="#444" />
    </svg>
)

const musicNotes = ['🎵', '🎶', '🎼']

const BeatWave = () => (
    <motion.div
        className="absolute bottom-40 w-full flex justify-center items-end gap-1 z-10"
        initial="initial"
        animate="animate"
    >
        {[...Array(20)].map((_, i) => (
            <motion.div
                key={i}
                className="w-1 rounded-full bg-white"
                variants={{
                    initial: { height: 8 },
                    animate: {
                        height: [8, 24, 12, 30, 10, 18],
                        transition: {
                            repeat: Infinity,
                            repeatType: 'loop',
                            duration: 1.2,
                            delay: i * 0.05,
                        },
                    },
                }}
            />
        ))}
    </motion.div>
)

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
                setCurrentTrack(tracks.find(t => t.id === trackId) || null)
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

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-black">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex space-x-2"
                >
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-8 bg-white rounded"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </motion.div>
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
        <div className="relative w-full h-screen overflow-hidden bg-black text-white">
            {/* Background Glow Pulse */}
            <motion.div
                className="absolute inset-0 z-0 bg-gradient-to-tr from-purple-700 via-black to-blue-900 opacity-40 blur-3xl"
                animate={{ opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            {/* Cover Image BG */}
            {coverUrl && (
                <motion.div
                    className="absolute inset-0 z-0"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Image
                        src={coverUrl}
                        alt="Background Cover"
                        fill
                        className="object-cover blur-2xl opacity-30 scale-110"
                        priority
                    />
                </motion.div>
            )}

            {/* Vinyl & Album */}
            <AnimatePresence>
                {coverUrl && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <motion.div
                            className="relative w-64 h-64 md:w-80 md:h-80"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
                        >
                            <VinylSVG />
                            <motion.div
                                className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full overflow-hidden border-2 border-white shadow-xl"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5, type: 'spring' }}
                            >
                                <Image
                                    src={coverUrl}
                                    alt="Album Cover"
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        </motion.div>
                        <div className="hidden md:block absolute z-20">
                            {musicNotes.map((note, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute text-4xl text-white drop-shadow-md"
                                    initial={{ y: 0, opacity: 0 }}
                                    animate={{
                                        y: [-10, -100],
                                        opacity: [0, 1, 0],
                                        x: [0, i % 2 === 0 ? -30 : 30],
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, delay: i * 1.2 }}
                                    style={{ top: `${30 + i * 20}px`, left: `${40 + i * 40}px` }}
                                >
                                    {note}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Beatwave Animation */}
            <BeatWave />

            {/* AudioPlayer */}
            <div className="relative z-20 w-full h-full flex items-end">
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
