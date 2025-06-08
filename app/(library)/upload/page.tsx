"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { uploadTrack } from "@/lib/api";

// Zod schema
const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters").max(100),
    email: z.string().email("Invalid email"),
    file: z
        .any()
        .refine((file) => file?.[0] instanceof File, "MP3 file is required.")
        .refine((file) => file?.[0]?.type === "audio/mpeg", {
            message: "Only MP3 files are allowed",
        })
        .refine((file) => file?.[0]?.size <= 50 * 1024 * 1024, {
            message: "File size must be less than 50MB",
        }),
});

type FormData = z.infer<typeof formSchema>;

export default function UploadPage() {
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormData) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("userEmail", data.email);
        formData.append("file", data.file[0]);

        try {
            const res = await uploadTrack(formData, (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                setUploadProgress(percent);
            });

            if (!res) throw new Error("Upload failed");

            toast.success("MP3 uploaded successfully!");
            reset();
            setUploadProgress(null);
        } catch (error: unknown) {
            setUploadProgress(null);
            if (error instanceof Error) {
                toast.error(`Upload failed: ${error.message}`);
            } else {
                toast.error("An unknown error occurred.");
            }
        }
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-800 px-4 py-8 sm:px-6 lg:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl text-white shadow-2xl rounded-xl p-8 sm:p-10">
                <div className="pb-6 sm:pb-8 text-center border-b border-zinc-700 mb-8 sm:mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                        Upload Your MP3
                    </h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-zinc-300">
                            Track Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g., Summer Chill Beats"
                            className="bg-zinc-700 border border-zinc-600 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 rounded-md py-3 px-4 text-base"
                            {...register("title")}
                        />
                        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                            Your Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@example.com"
                            className="bg-zinc-700 border border-zinc-600 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 rounded-md py-3 px-4 text-base"
                            {...register("email")}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* File */}
                    <div className="space-y-2">
                        <Label htmlFor="file" className="text-sm font-medium text-zinc-300">
                            MP3 File
                        </Label>
                        <Input
                            id="file"
                            type="file"
                            accept="audio/mpeg"
                            className="bg-zinc-700 border border-zinc-600 text-white file:text-white file:bg-zinc-600 file:hover:bg-zinc-700 file:border-0 file:rounded-md file:py-2 file:px-4 file:mr-4 transition-all duration-200 cursor-pointer rounded-md py-3 px-4 text-base"
                            {...register("file")}
                        />
                        {errors.file && <p className="text-red-400 text-xs mt-1">{errors.file.message as string}</p>}
                    </div>

                    {/* Progress Bar */}
                    {uploadProgress !== null && (
                        <>
                            <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-zinc-400 text-center mt-1">
                                {uploadProgress}% uploaded
                            </p>
                        </>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg text-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-10"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5" />
                                Uploading...
                            </>
                        ) : (
                            "Upload Track"
                        )}
                    </Button>
                </form>
            </div>
        </motion.div>
    );
}
