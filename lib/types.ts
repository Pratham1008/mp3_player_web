// types.ts

export interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    durationSeconds: number;
    bitrateKbps: number;
    audioFilePath: string;
    coverImageUrl?: string;
    uploadedAt: string;
}

export interface Users {
    id: string;
    name: string;
    email: string;
    favoriteTracks?: Favorite[];
    trackHistory?: History[];
}

export interface Favorite {
    id: string;
    title: string;
    userId: string;
    trackId: string;
    favoritedAt: string;
}

export interface History {
    id: string;
    title: string;
    userId: string;
    trackId: string;
    listenedAt: string;
}
