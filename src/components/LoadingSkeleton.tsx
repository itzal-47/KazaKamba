interface LoadingSkeletonProps {
  type: 'listing' | 'story' | 'chat' | 'message' | 'profile' | 'grid';
  count?: number;
}

export function LoadingSkeleton({ type, count = 3 }: LoadingSkeletonProps) {
  if (type === 'grid') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <ListingSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'listing') {
    return <ListingSkeleton />;
  }

  if (type === 'story') {
    return (
      <div className="flex gap-4 overflow-x-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />
            <div className="w-12 h-3 mt-2 rounded bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chat') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
            <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-2" />
              <div className="h-3 w-40 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'message') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className="h-12 w-32 bg-white/10 rounded-2xl animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
        <div>
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return null;
}

function ListingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] rounded-2xl bg-white/5 mb-4" />
      <div className="h-5 bg-white/5 rounded w-3/4 mb-2" />
      <div className="h-4 bg-white/5 rounded w-1/2 mb-3" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/5" />
        <div className="h-3 bg-white/5 rounded w-24" />
      </div>
    </div>
  );
}
