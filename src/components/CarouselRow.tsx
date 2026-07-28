import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CarouselRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const scrollBy = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group w-full">
      {canScrollLeft && (
        <button 
          onClick={(e) => { e.stopPropagation(); scrollBy(-300); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-black transition-all hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      
      <div 
        ref={scrollRef} 
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-8 pb-6 hide-scrollbar snap-x snap-mandatory items-start pt-4"
      >
        {children}
      </div>

      {canScrollRight && (
        <button 
          onClick={(e) => { e.stopPropagation(); scrollBy(300); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-black transition-all hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
