'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useGesture } from '@use-gesture/react'
import { Track } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
    Volume2,
    VolumeX,
    Pause,
    Play,
    SkipBack,
    SkipForward,
} from 'lucide-react'
import Image from 'next/image'

export default function AudioPlayer({
                                        track,
                                        userEmail,
                                        trackList,
                                        setTrack,
                                    }: {
    track: Track
    userEmail: string
    trackList: Track[]
    setTrack: (track: Track) => void
}) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const gestureRef = useRef<HTMLDivElement | null>(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(1)
    const [muted, setMuted] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const currentIndex = trackList.findIndex((t) => t.id === track.id)
    const audioSrc = `${process.env.NEXT_PUBLIC_API_BASE}/api/tracks/audio?email=${userEmail}&trackId=${track.id}`

    useEffect(() => {
        if (!audioRef.current) return

        setIsLoading(true)
        setProgress(0)
        setDuration(0)
        audioRef.current.src = audioSrc
        audioRef.current.load()

        const onLoadedMetadata = () => {
            setDuration(audioRef.current?.duration || 0)
            setIsLoading(false)
            audioRef.current?.play()
            setIsPlaying(true)
        }

        const onEnded = () => {
            setIsPlaying(false)
            if (currentIndex < trackList.length - 1) {
                setTrack(trackList[currentIndex + 1])
            }
        }

        const onTimeUpdate = () => {
            if (!audioRef.current) return
            setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1))
        }

        audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata)
        audioRef.current.addEventListener('ended', onEnded)
        audioRef.current.addEventListener('timeupdate', onTimeUpdate)

        return () => {
            audioRef.current?.pause()
            audioRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata)
            audioRef.current?.removeEventListener('ended', onEnded)
            // eslint-disable-next-line react-hooks/exhaustive-deps
            audioRef.current?.removeEventListener('timeupdate', onTimeUpdate)
        }
    }, [audioSrc, currentIndex, setTrack, trackList])

    const togglePlay = () => {
        if (!audioRef.current) return
        if (audioRef.current.paused) {
            audioRef.current.play()
            setIsPlaying(true)
        } else {
            audioRef.current.pause()
            setIsPlaying(false)
        }
    }

    const handleSeek = (val: number) => {
        if (!audioRef.current) return
        audioRef.current.currentTime = val * duration
        setProgress(val)
    }

    const toggleMute = useCallback(() => {
        if (!audioRef.current) return
        const newMuted = !muted
        audioRef.current.muted = newMuted
        setMuted(newMuted)
    }, [muted])

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setTrack(trackList[currentIndex - 1])
        }
    }, [currentIndex, setTrack, trackList])

    const handleNext = useCallback(() => {
        if (currentIndex < trackList.length - 1) {
            setTrack(trackList[currentIndex + 1])
        }
    }, [currentIndex, setTrack, trackList])

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00'
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const haptic = () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(10)
        }
    }

    // 🔄 Gesture Handling
    useGesture(
        {
            onDragEnd: ({ direction: [xDir, yDir], velocity: [vx, vy] }) => {
                const swipeThreshold = 0.3

                // Swipe Left/Right – Track Change
                if (Math.abs(xDir) > 0 && Math.abs(vx) > swipeThreshold) {
                    if (xDir < 0) {
                        handleNext()
                        haptic()
                    } else if (xDir > 0) {
                        handlePrevious()
                        haptic()
                    }
                }

                // Swipe Up/Down – Volume Control
                if (Math.abs(yDir) > 0 && Math.abs(vy) > swipeThreshold) {
                    if (!audioRef.current) return
                    let newVolume = volume

                    if (yDir < 0) newVolume = Math.min(1, volume + 0.1) // Swipe Up
                    else if (yDir > 0) newVolume = Math.max(0, volume - 0.1) // Swipe Down

                    setVolume(newVolume)
                    audioRef.current.volume = newVolume
                    if (newVolume > 0 && muted) {
                        setMuted(false)
                        audioRef.current.muted = false
                    }
                    haptic()
                }
            }
        },
        {
            target: gestureRef,
            eventOptions: { passive: false },
        }
    )


    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            )
                return

            if (e.key === ' ') {
                e.preventDefault()
                togglePlay()
            } else if (e.key === 'ArrowRight') {
                handleNext()
            } else if (e.key === 'ArrowLeft') {
                handlePrevious()
            } else if (e.key.toLowerCase() === 'm') {
                toggleMute()
            }
        }

        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [track, muted, toggleMute, handleNext, handlePrevious])

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 text-white p-3 sm:p-4 shadow-lg">
            <audio ref={audioRef} preload="metadata" />

            {/* Progress Bar */}
            <div
                className="relative h-1.5 bg-zinc-700 rounded-full mb-3 sm:mb-4 cursor-pointer"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const clickX = e.clientX - rect.left
                    const newProgress = clickX / rect.width
                    handleSeek(newProgress)
                }}>
                <div
                    className="absolute top-0 left-0 h-full rounded-full bg-orange-500"
                    style={{ width: `${progress * 100}%` }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-orange-500 shadow-md"
                    style={{ left: `${progress * 100}%` }}
                />
            </div>

            {/* Desktop UI */}
            <div className="hidden sm:flex items-center justify-between gap-4">
                {/* Track Info */}
                <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-zinc-900 flex-shrink-0">
                        {track.coverImageUrl ? (
                            <Image
                                src={`${process.env.NEXT_PUBLIC_API_BASE}/api/tracks/${track.id}/cover`}
                                alt="Cover"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                                No Cover
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold truncate text-base text-white">{track.title}</p>
                        <p className="text-sm text-zinc-400 truncate">{track.artist}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <Button onClick={handlePrevious} disabled={currentIndex <= 0} className="text-zinc-300 hover:bg-zinc-800 rounded-full w-10 h-10" variant="ghost" size="icon">
                        <SkipBack className="w-6 h-6" />
                    </Button>
                    <Button onClick={togglePlay} disabled={isLoading} className="bg-white text-black hover:bg-white/90 rounded-full w-12 h-12" variant="ghost" size="icon">
                        {isLoading ? (
                            <div className="w-6 h-6 animate-spin border-2 border-t-transparent border-black rounded-full" />
                        ) : isPlaying ? (
                            <Pause className="w-7 h-7" />
                        ) : (
                            <Play className="w-7 h-7" />
                        )}
                    </Button>
                    <Button onClick={handleNext} disabled={currentIndex >= trackList.length - 1} className="text-zinc-300 hover:bg-zinc-800 rounded-full w-10 h-10" variant="ghost" size="icon">
                        <SkipForward className="w-6 h-6" />
                    </Button>
                </div>

                {/* Time & Volume */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-zinc-400 tabular-nums">{formatTime(progress * duration)}</span>
                    <span className="text-sm text-zinc-400">/</span>
                    <span className="text-sm text-zinc-400 tabular-nums">{formatTime(duration)}</span>

                    <Button onClick={toggleMute} className="text-zinc-300 hover:bg-zinc-800 ml-4 rounded-full" variant="ghost" size="icon">
                        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile UI with Gesture */}
            <div
                ref={gestureRef}
                className="sm:hidden flex items-center justify-between gap-3 mb-2 touch-pan-x"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-zinc-900 flex-shrink-0">
                        {track.coverImageUrl ? (
                            <Image
                                src={`${process.env.NEXT_PUBLIC_API_BASE}/api/tracks/${track.id}/cover`}
                                alt="Cover"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                                No Cover
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold truncate text-white text-sm">{track.title}</p>
                        <p className="text-xs text-zinc-400 truncate">{track.album ?? 'Unknown Album'}</p>
                        <p className="text-xs text-zinc-400 tabular-nums">
                            {formatTime(progress * duration)} / {formatTime(duration)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={handlePrevious} disabled={currentIndex <= 0} className="text-zinc-300 hover:bg-zinc-800 rounded-full w-8 h-8" variant="ghost" size="icon">
                        <SkipBack className="w-5 h-5" />
                    </Button>
                    <Button onClick={togglePlay} disabled={isLoading} className="bg-white text-black hover:bg-white/90 rounded-full w-10 h-10" variant="ghost" size="icon">
                        {isLoading ? (
                            <div className="w-5 h-5 animate-spin border-2 border-t-transparent border-black rounded-full" />
                        ) : isPlaying ? (
                            <Pause className="w-6 h-6" />
                        ) : (
                            <Play className="w-6 h-6" />
                        )}
                    </Button>
                    <Button onClick={handleNext} disabled={currentIndex >= trackList.length - 1} className="text-zinc-300 hover:bg-zinc-800 rounded-full w-8 h-8" variant="ghost" size="icon">
                        <SkipForward className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
