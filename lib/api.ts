// src/lib/api.ts

import axios, {AxiosProgressEvent} from 'axios'
import { Users, Track, Favorite, History } from '@/lib/types'

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE}/api/tracks`

export async function checkUser(name: string, email: string): Promise<Users> {
    const res = await axios.post<Users>(`${API_BASE}/check-user`, null, {
        params: { name, email },
    })
    return res.data
}

export async function uploadTrack(
    formData: FormData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void // ✅ Use AxiosProgressEvent
) {
    const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/tracks/upload`,
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress,
        }
    );
    return response.data;
}

export async function addToFavorites(id: string, email: string): Promise<string> {
    const res = await axios.post(`${API_BASE}/${id}/favorite`, null, {
        params: { email },
    })
    return res.data
}

export async function getAllTracks(): Promise<Track[]> {
    const res = await axios.get(`${API_BASE}`)
    return res.data
}

export async function getTrack(id: string): Promise<Track> {
    const res = await axios.get(`${API_BASE}/${id}`)
    return res.data
}

export async function getTracksByUser(email: string): Promise<Track[]> {
    const res = await axios.get(`${API_BASE}/by-user`, {
        params: { email },
    })
    return res.data
}

export async function deleteTrack(trackId: string): Promise<string> {
    const res = await axios.delete(`${API_BASE}/${trackId}`)
    return res.data
}

export async function getUserHistory(email: string): Promise<History[]> {
    const res = await axios.get(`${API_BASE}/history`, {
        params: { "userEmail": email },
    })
    return res.data
}

export async function getUserFavorites(email: string): Promise<Favorite[]> {
    const res = await axios.get(`${API_BASE}/favorites`, {
        params: { "userEmail": email },
    })
    return res.data
}
