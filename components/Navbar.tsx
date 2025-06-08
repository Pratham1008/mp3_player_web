'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react' // Import useState, useEffect, useRef
import { cn } from '@/lib/utils' // Corrected relative path for cn
import { Menu, X } from 'lucide-react'
import {Button} from "@/components/ui/button"; // Import icons for hamburger menu

const navItems = [
    { href: '/library', label: 'Library' },
    { href: '/upload', label: 'Upload' },
    { href: '/history', label: 'History' },
    { href: '/favourites', label: 'Favourites' },
]

export default function Navbar() {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const navbarRef = useRef<HTMLElement>(null); // Ref for detecting clicks outside

    // Function to toggle mobile menu visibility
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    // Effect to close mobile menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Remove event listener on cleanup
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [navbarRef]); // Dependency array includes navbarRef to ensure effect runs if ref changes

    return (
        <header ref={navbarRef} className="sticky top-0 z-50 w-full bg-[#1A1A1A] border-b border-zinc-800 shadow-xl"> {/* Darker background, more prominent shadow */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between h-16"> {/* Increased height for better spacing */}
                <Link href="/" className="flex items-center text-xl md:text-2xl font-bold text-white tracking-tight transform transition-transform duration-300 hover:scale-105">
                    <span className="mr-2 text-orange-400">🎶</span> {/* Accent color for icon */}
                    SpotySaavan
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-4 lg:gap-6">
                    {navItems.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'relative text-base lg:text-lg text-zinc-400 hover:text-white transition-all duration-300 px-3 py-2 rounded-lg', // Slightly larger text, more rounded
                                'group', // For hover effects
                                pathname === href && 'bg-zinc-700 text-white font-semibold shadow-inner' // Active state styling
                            )}
                        >
                            {label}
                            {/* Underline effect on hover/active */}
                            <span className={cn(
                                "absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform duration-300",
                                "group-hover:scale-x-100",
                                pathname === href && "scale-x-100"
                            )}></span>
                        </Link>
                    ))}
                </nav>

                {/* Mobile Menu Button (Hamburger/X icon) */}
                <div className="md:hidden">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleMobileMenu}
                        className="text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-md"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-7 w-7 text-white animate-in fade-in" /> // X icon when open
                        ) : (
                            <Menu className="h-7 w-7 text-white animate-in fade-in" /> // Hamburger icon when closed
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Menu (Conditional Rendering) */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-[#1A1A1A] border-t border-zinc-800 shadow-lg animate-in slide-in-from-top-10 duration-300">
                    <nav className="flex flex-col p-4 space-y-2">
                        {navItems.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setIsMobileMenuOpen(false)} // Close menu on item click
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
