'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserFavorites, getTrack } from '@/lib/api'
import { Favorite, Track} from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function FavoritePage() {
    const router = useRouter()
    const [userEmail, setUserEmail] = useState('')
    const [favorites, setFavorites] = useState<Favorite[]>([])
    const [tracks, setTracks] = useState<Record<string, Track>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : ''
        setUserEmail(email)
    }, [])

    useEffect(() => {
        if (!userEmail) return

        async function loadFavorites() {
            setLoading(true)
            setError(null)
            try {
                const data = await getUserFavorites(userEmail)
                setFavorites(data)

                const trackPromises = data.map(item => getTrack(item.trackId))
                const trackResults = await Promise.all(trackPromises)

                const trackMap: Record<string, Track> = {}
                trackResults.forEach(track => {
                    trackMap[track.id] = track
                })
                setTracks(trackMap)
            } catch (err) {
                console.error(err)
                setError('Failed to load favorites')
            } finally {
                setLoading(false)
            }
        }

        loadFavorites()
    }, [userEmail])

    if (!userEmail) return <p className="text-white p-4">Please login to view your favorites.</p>

    return (
        <main className="p-4 sm:p-6 mx-auto pb-48 bg-neutral-900 text-white min-h-screen space-y-6">
            {loading && (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-[76px] w-full rounded-xl bg-neutral-800" />
                    ))}
                </div>
            )}

            {!loading && error && <p className="text-red-400 text-center text-lg font-medium">{error}</p>}

            <motion.div
                className="flex flex-col gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {favorites.map(item => {
                    const track = tracks[item.trackId]
                    if (!track) return null

                    return (
                        <motion.div
                            key={item.id}
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
                                <p className="text-xs text-zinc-500">Favorited at: {new Date(item.favoritedAt).toLocaleString()}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>
        </main>
    )
}
