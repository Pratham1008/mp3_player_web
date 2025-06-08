// app/library/layout.tsx
import React from 'react'
import { cn } from '@/lib/utils'
import { Inter } from 'next/font/google'
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ['latin'] })

export default function LibraryLayout({
                                          children,
                                      }: {
    children: React.ReactNode
}) {
    return (
        <div className={cn(inter.className, 'min-h-screen text-white')}>

            <Navbar />
            <main className="relative">{children}</main>

        </div>
    )
}