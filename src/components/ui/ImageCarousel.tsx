import { useCallback, useEffect, useState } from "react";

// ✅ 올바른 예
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType, EmblaCarouselType, EmblaPluginType } from "embla-carousel";

import Autoplay from "embla-carousel-autoplay";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

type Props = {
  images: string[];
  className?: string;
  /** 자동 재생 ms(예: 4000). 0 이면 자동재생 off */
  autoplayMs?: number;
  /** object-cover | contain 등 */
  fit?: "cover" | "contain";
  options?: EmblaOptionsType;
  alt?: string;
};

export default function ImageCarousel({
  images,
  className = "",
  autoplayMs = 0,
  fit = "cover",
  options = { loop: true, dragFree: false, duration: 20 },
  alt = "event cover image",
}: Props) {
  const plugins = autoplayMs > 0 ? [Autoplay({ delay: autoplayMs, stopOnInteraction: false })] : [];
  const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelected(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setSnapCount(emblaApi.scrollSnapList().length);
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setSnapCount(emblaApi.scrollSnapList().length);
      onSelect(emblaApi);
    });
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (idx: number) => emblaApi?.scrollTo(idx);

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {/* 뷰포트 */}
      <div className="overflow-hidden rounded-2xl" ref={emblaRef} aria-roledescription="carousel">
        <div className="flex">
          {images.map((src, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full relative">
              <img
                src={src}
                alt={`${alt} ${i + 1}`}
                loading="lazy"
                className={["w-full h-40 sm:h-48 md:h-56 lg:h-60", fit === "cover" ? "object-cover" : "object-contain bg-neutral-50"].join(" ")}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 좌/우 네비게이션 (MUI + Tailwind) */}
      {snapCount > 1 && (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1">
            <IconButton
              aria-label="previous image"
              onClick={scrollPrev}
              className="pointer-events-auto !bg-white/80 hover:!bg-white shadow-sm !p-1"
              size="small"
            >
              <ChevronLeftIcon htmlColor="#111827" />
            </IconButton>
            <IconButton
              aria-label="next image"
              onClick={scrollNext}
              className="pointer-events-auto !bg-white/80 hover:!bg-white shadow-sm !p-1"
              size="small"
            >
              <ChevronRightIcon htmlColor="#111827" />
            </IconButton>
          </div>

          {/* 인디케이터 점 */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {Array.from({ length: snapCount }).map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={[
                  "h-1.5 rounded-full transition-all",
                  selected === i ? "w-5 bg-blue-600" : "w-2 bg-white/70",
                  "shadow ring-1 ring-black/5",
                ].join(" ")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
