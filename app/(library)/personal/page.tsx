'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Track } from '@/lib/types'
import { toast } from 'sonner'
import { Trash } from 'lucide-react'
import { deleteTrack as deleteTrackApi } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE + '/api/tracks'

export default function PersonPage() {
    const [tracks, setTracks] = useState<Track[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const router = useRouter()
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : ''

    const fetchUserTracks = async () => {
        try {
            const res = await axios.get(`${API_BASE}/by-user`, {
                params: { email: userEmail },
            })
            setTracks(res.data)
        } catch (err) {
            console.error(err)
            setError('Failed to load your uploaded tracks.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (trackId: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this track?')
        if (!confirmDelete) return

        try {
            await deleteTrackApi(trackId)
            toast.success('Track deleted successfully')
            setTracks(prev => prev.filter(track => track.id !== trackId))
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete track')
        }
    }

    useEffect(() => {
        if (userEmail) {
            fetchUserTracks()
        } else {
            setError('No user email found. Please log in.')
            setLoading(false)
        }
    }, [userEmail])

    return (
        <main className="p-4 sm:p-6 mx-auto pb-48 bg-neutral-900 text-white min-h-screen space-y-6">
            {loading && (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-[76px] w-full rounded-xl bg-neutral-800" />
                    ))}
                </div>
            )}

            {!loading && error && (
                <p className="text-red-400 text-center text-lg font-medium">{error}</p>
            )}

            <motion.div
                className="flex flex-col gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {tracks.map(track => (
                    <motion.div
                        key={track.id}
                        onClick={() => {
                            const encodedEmail = encodeURIComponent(userEmail)
                            router.push(`/player?trackId=${track.id}&email=${encodedEmail}`)
                        }}
                        className="group flex items-center gap-3 sm:gap-4 py-2 sm:py-3 px-3 sm:px-4 bg-neutral-800 rounded-lg transition hover:bg-neutral-700 cursor-pointer"
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 relative rounded-md overflow-hidden bg-zinc-900 flex-shrink-0">
                            {track.coverImageUrl ? (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_BASE}/api/tracks/${track.id}/cover`}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                    loading="lazy"
                                    sizes="56px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">No Cover</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-medium truncate">{track.title}</h3>
                            <p className="text-xs sm:text-sm text-zinc-400 truncate">{track.artist}</p>
                        </div>

                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(track.id)
                            }}
                            className="rounded-full hover:bg-red-600 p-2"
                            aria-label="Delete track"
                        >
                            <Trash className="w-4 h-4 text-zinc-300 group-hover:text-red-500" />
                        </Button>
                    </motion.div>
                ))}
            </motion.div>
        </main>
    )
}
