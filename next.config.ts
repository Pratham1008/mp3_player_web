import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "mp3-backend-ut8t.onrender.com",
                pathname: "/api/tracks/**",
            },
            {
                protocol: "https",
                hostname: "img.icons8.com",
                pathname: "/clouds/**"
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "8080",
                pathname: "/api/tracks/**",
            }
        ],
    },
};

export default nextConfig;
