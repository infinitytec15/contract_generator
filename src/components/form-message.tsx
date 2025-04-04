"use client";

import { cn } from "@/lib/utils";

export type Message =
    | { success: string }
    | { error: string }
    | { message: string };

interface FormMessageProps {
    message: Message | null;
    className?: string;
}

export default function FormMessage({ message, className }: FormMessageProps) {
    if (!message) return null;

    const isSuccess = "success" in message;
    const isError = "error" in message;
    const isNeutral = "message" in message;

    const text = isSuccess
        ? message.success
        : isError
            ? message.error
            : message.message;

    const baseStyle = isSuccess
        ? "bg-green-50 text-green-700"
        : isError
            ? "bg-red-50 text-red-700"
            : "bg-gray-50 text-gray-800";

    return (
        <div
            className={cn(
                "p-4 rounded-md flex items-start gap-3 border",
                baseStyle,
                className
            )}
        >
            <div className="text-sm">{text}</div>
        </div>
    );
}
