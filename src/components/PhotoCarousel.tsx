import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Lightbox } from './Lightbox';

interface Props {
  photos: string[];
  alt: string;
}

export function PhotoCarousel({ photos, alt }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const displayPhotos = photos.length > 0 ? photos : ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'];

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayPhotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-background-card group">
        <img
          src={displayPhotos[currentIndex]}
          alt={`${alt} - Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        />

        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 text-white opacity-0 group-hover:opacity-100 hover:bg-primary transition-all"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {displayPhotos.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-primary hover:border-primary transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-primary hover:border-primary transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {displayPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary w-6'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Lightbox
        images={displayPhotos}
        initialIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
