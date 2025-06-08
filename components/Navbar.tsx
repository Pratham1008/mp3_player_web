'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from "next/image";

const ALL_NAV_ITEMS = [
    { href: '/library', label: 'Library' },
    { href: '/upload', label: 'Upload' },
    { href: '/history', label: 'History' },
    { href: '/favorite', label: 'Favourites' },
    { href: '/personal', label: 'Personal' },
]

const ALLOWED_UPLOADERS = new Set([
    "prathamesh10082004@gmail.com",
    "prathameshcorporations@gmail.com",
    "prathamesh16052003@gmail.com"
])

export default function Navbar() {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const navbarRef = useRef<HTMLElement>(null)

    // Load userEmail from localStorage client-side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('userEmail')
            setUserEmail(email)
        }
    }, [])

    // Filter navItems based on allowed uploaders
    const navItems = ALL_NAV_ITEMS.filter(item => {
        if ((item.href === '/upload' || item.href === '/personal')) {
            return userEmail && ALLOWED_UPLOADERS.has(userEmail)
        }
        return true
    })

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    // Close mobile menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header ref={navbarRef} className="sticky top-0 z-50 w-full bg-[#1A1A1A] border-b border-zinc-800 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between h-16">
                <Link href="/" className="flex items-center text-xl md:text-2xl font-bold text-white tracking-tight transform transition-transform duration-300 hover:scale-105">
                    <span className="mr-2 text-orange-400"><Image width="50" height="50" src="https://img.icons8.com/clouds/100/apple-music.png" alt="apple-music"/></span>
                    TuneTadka
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-4 lg:gap-6">
                    {navItems.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'relative text-base lg:text-lg text-zinc-400 hover:text-white transition-all duration-300 px-3 py-2 rounded-lg',
                                'group',
                                pathname === href && 'bg-zinc-700 text-white font-semibold shadow-inner'
                            )}
                        >
                            {label}
                            <span className={cn(
                                "absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform duration-300",
                                "group-hover:scale-x-100",
                                pathname === href && "scale-x-100"
                            )}></span>
                        </Link>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleMobileMenu}
                        className="text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-md"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-7 w-7 text-white animate-in fade-in" />
                        ) : (
                            <Menu className="h-7 w-7 text-white animate-in fade-in" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-[#1A1A1A] border-t border-zinc-800 shadow-lg animate-in slide-in-from-top-10 duration-300">
                    <nav className="flex flex-col p-4 space-y-2">
                        {navItems.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    'block text-lg text-zinc-300 hover:text-white transition px-4 py-3 rounded-lg',
                                    pathname === href && 'bg-zinc-700 text-white font-medium'
                                )}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    )
}
