'use client'

import { useEffect, useState } from 'react'
import { getAllTracks, addToFavorites } from '@/lib/api'
import { Track } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {toast} from "sonner";

export default function LibraryPage() {
    const [tracks, setTracks] = useState<Track[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : ''

    const fetchTracks = async () => {
        try {
            const data = await getAllTracks()
            setTracks(data)
        } catch (err) {
            console.error(err)
            setError('Failed to load tracks')
        } finally {
            setLoading(false)
        }
    }

    const handleAddFavorite = async (trackId: string) => {
        try {
            await addToFavorites(trackId, userEmail)
            toast.success('Favorite successfully added')
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Failed to add to favorites:', error.message)
                toast.error(`Failed to add to favorites: ${error.message}`)
            }
        }
    }

    useEffect(() => {
        fetchTracks()
    }, [])

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
                        className="flex items-center gap-3 sm:gap-4 py-2 sm:py-3 px-3 sm:px-4 bg-neutral-800 rounded-lg transition hover:bg-neutral-700 cursor-pointer"
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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-neutral-700 hover:bg-neutral-600 rounded-full p-2"
                                    aria-label="More options"
                                >
                                    <MoreVertical className="w-4 h-4 text-zinc-300" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="end" className="bg-neutral-800 border-neutral-700 text-white">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleAddFavorite(track.id)
                                    }}
                                    className="hover:bg-neutral-700 cursor-pointer"
                                >
                                    Add to Favorite
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </motion.div>
                ))}
            </motion.div>
        </main>
    )
}
