"use client";

import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/utils/utils";

interface StorageUsageDisplayProps {
  storageUsed: number;
  storageLimit: number;
}

export default function StorageUsageDisplay({
  storageUsed,
  storageLimit,
}: StorageUsageDisplayProps) {
  const getStoragePercentage = () => {
    return Math.min(100, (storageUsed / storageLimit) * 100);
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">Uso de Armazenamento</h3>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm">
          Utilizado: {formatFileSize(storageUsed)}
        </span>
        <span className="text-sm">Limite: {formatFileSize(storageLimit)}</span>
      </div>
      <Progress value={getStoragePercentage()} className="h-2" />
    </div>
  );
}
