'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import { Track } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
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

    const handleVolumeChange = (val: number[]) => {
        if (!audioRef.current) return
        const newVolume = val[0] ?? 0
        setVolume(newVolume)
        audioRef.current.volume = newVolume
        if (newVolume > 0 && muted) {
            setMuted(false)
            audioRef.current.muted = false
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
            <div className="relative h-1.5 bg-zinc-700 rounded-full mb-3 sm:mb-4 cursor-pointer hidden sm:block"
                 onClick={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect()
                     const clickX = e.clientX - rect.left
                     const newProgress = clickX / rect.width
                     handleSeek(newProgress)
                 }}>
                <div className="absolute top-0 left-0 h-full rounded-full bg-orange-500" style={{ width: `${progress * 100}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-orange-500 shadow-md" style={{ left: `${progress * 100}%` }} />
            </div>

            {/* Desktop */}
            <div className="hidden sm:flex flex-row items-center justify-between gap-4">
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
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button size="icon" variant="ghost" onClick={handlePrevious}
                            className="rounded-full text-zinc-300 hover:bg-zinc-800 w-8 h-8 sm:w-10 sm:h-10"
                            disabled={currentIndex <= 0}>
                        <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>

                    <Button size="icon" variant="ghost" onClick={togglePlay}
                            className="rounded-full bg-white text-black hover:bg-white/90 w-10 h-10 sm:w-12 sm:h-12"
                            disabled={isLoading}>
                        {isLoading ? (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 animate-spin border-2 border-t-transparent border-black rounded-full" />
                        ) : isPlaying ? (
                            <Pause className="w-6 h-6 sm:w-7 sm:h-7" />
                        ) : (
                            <Play className="w-6 h-6 sm:w-7 sm:h-7" />
                        )}
                    </Button>

                    <Button size="icon" variant="ghost" onClick={handleNext}
                            className="rounded-full text-zinc-300 hover:bg-zinc-800 w-8 h-8 sm:w-10 sm:h-10"
                            disabled={currentIndex >= trackList.length - 1}>
                        <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                </div>

                {/* Time & Volume */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-zinc-400 tabular-nums">{formatTime(progress * duration)}</span>
                    <span className="text-sm text-zinc-400">/</span>
                    <span className="text-sm text-zinc-400 tabular-nums">{formatTime(duration)}</span>

                    <Button size="icon" variant="ghost" onClick={toggleMute}
                            className="rounded-full text-zinc-300 hover:bg-zinc-800 ml-4">
                        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>

                    <Slider value={[volume]} max={1} step={0.01}
                            onValueChange={handleVolumeChange}
                            className="w-24 text-orange-500" />
                </div>
            </div>

            {/* Mobile */}
            <div className="flex sm:hidden items-center justify-between gap-3 overflow-x-auto">
                <div className="relative w-10 h-10 min-w-10 rounded overflow-hidden bg-zinc-900 flex-shrink-0">
                    {track.coverImageUrl ? (
                        <Image
                            src={`${process.env.NEXT_PUBLIC_API_BASE}/api/tracks/${track.id}/cover`}
                            alt="Cover"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500">
                            No Cover
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={handlePrevious}
                            className="rounded-full text-zinc-300 hover:bg-zinc-800 w-8 h-8"
                            disabled={currentIndex <= 0}>
                        <SkipBack className="w-5 h-5" />
                    </Button>

                    <Button size="icon" variant="ghost" onClick={togglePlay}
                            className="rounded-full bg-white text-black hover:bg-white/90 w-10 h-10"
                            disabled={isLoading}>
                        {isLoading ? (
                            <div className="w-5 h-5 animate-spin border-2 border-t-transparent border-black rounded-full" />
                        ) : isPlaying ? (
                            <Pause className="w-6 h-6" />
                        ) : (
                            <Play className="w-6 h-6" />
                        )}
                    </Button>

                    <Button size="icon" variant="ghost" onClick={handleNext}
                            className="rounded-full text-zinc-300 hover:bg-zinc-800 w-8 h-8"
                            disabled={currentIndex >= trackList.length - 1}>
                        <SkipForward className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={toggleMute}
                            className="rounded-full text-zinc-300 hover:bg-zinc-800">
                        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>

                    <Slider
                        value={[volume]}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="w-16"
                    />
                </div>
            </div>
        </div>
    )
}
