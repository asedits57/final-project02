import { Skeleton } from "@components/ui/skeleton";
import { cn } from "@lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4", className)}>
      <Skeleton className="h-4 w-1/3 bg-white/10" />
      <Skeleton className="h-8 w-1/2 bg-white/10" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full bg-white/10" />
        <Skeleton className="h-3 w-4/5 bg-white/10" />
      </div>
    </div>
  );
}

export function SkeletonListRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4", className)}>
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0 bg-white/10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3 bg-white/10" />
        <Skeleton className="h-3 w-1/2 bg-white/10" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
    </div>
  );
}

export function SkeletonPodiumItem({ className, high }: { className?: string; high?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <Skeleton className={cn("rounded-full bg-white/10", high ? "w-24 h-24" : "w-16 h-16")} />
      <Skeleton className="h-4 w-20 bg-white/10" />
      <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
    </div>
  );
}
