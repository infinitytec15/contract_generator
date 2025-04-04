export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="text-green-500 border-l-2 px-4">{message.success}</div>
      )}
      {"error" in message && (
        <div className="text-red-500 border-l-2 px-4">{message.error}</div>
      )}
      {"message" in message && (
        <div className="text-foreground border-l-2 px-4">{message.message}</div>
      )}
    </div>
  );
}

export default function FormMessage({
  type,
  message,
  className,
}: {
  type: "error" | "success";
  message: string;
  className?: string;
}) {
  if (!message) return null;

  return (
    <div
      className={`p-4 rounded-md flex items-start gap-3 ${type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"} ${className || ""}`}
    >
      <div className="text-sm">{message}</div>
    </div>
  );
}
