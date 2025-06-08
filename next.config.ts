import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "mp3-backend-ut8t.onrender.com",
                pathname: "/api/tracks/**",
            },
        ],
    },
};

export default nextConfig;
