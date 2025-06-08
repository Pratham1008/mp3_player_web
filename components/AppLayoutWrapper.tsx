'use client'

import Navbar from './Navbar'

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <main className="min-h-[calc(100vh-56px)]">{children}</main>
        </>
    )
}
