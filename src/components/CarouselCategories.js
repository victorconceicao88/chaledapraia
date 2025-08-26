"use client";
import React, { useRef, useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { menuItems, CategoryIcons } from "../data/menuItems";

const CarouselCategories = ({ activeCategory, setActiveCategory, language }) => {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const breakpoints = {
    320: { slidesPerView: 2.2, spaceBetween: 4 },
    375: { slidesPerView: 2.8, spaceBetween: 4 },
    425: { slidesPerView: 3.2, spaceBetween: 4 },
    480: { slidesPerView: 4.2, spaceBetween: 4 },
    640: { slidesPerView: 6.5, spaceBetween: 4 },
    768: { slidesPerView: 7.5, spaceBetween: 4 },
    1024: { slidesPerView: 9, spaceBetween: 4 },
    1280: { slidesPerView: 12, spaceBetween: 4 },
  };

  useEffect(() => {
    const swiper = swiperRef.current;
    if (swiper) {
      const handleSlideChange = () => {
        setIsBeginning(swiper.isBeginning);
        setIsEnd(swiper.isEnd);
      };
      swiper.on("slideChange", handleSlideChange);
      return () => {
        swiper.off("slideChange", handleSlideChange);
      };
    }
  }, []);

  const slideNext = () => {
    if (swiperRef.current && !isEnd) {
      swiperRef.current.slideNext(30);
    }
  };

  const slidePrev = () => {
    if (swiperRef.current && !isBeginning) {
      swiperRef.current.slidePrev(30);
    }
  };

  return (
    <div className="relative w-full pt-4 pb-1 bg-white shadow-sm">
      <button
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all ${
          isBeginning ? "opacity-30 cursor-default" : "opacity-100 cursor-pointer"
        }`}
        onClick={slidePrev}
        aria-label="Categoria anterior"
      >
        <FaArrowLeft className="text-gray-700 text-lg sm:text-xl" />
      </button>

      <Swiper
        modules={[Navigation, FreeMode]}
        slidesPerView={"auto"}
        breakpoints={breakpoints}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        className="!mx-0 !px-6 w-full"
        speed={30}
        resistanceRatio={0}
        preventInteractionOnTransition={true}
        freeMode={{
          enabled: true,
          momentumVelocityRatio: 0.05
        }}
      >
        {Object.keys(menuItems).map((category) => {
          const Icon = CategoryIcons[category];
          return (
            <SwiperSlide
              key={category}
              className="min-w-[104px] sm:min-w-[112px] flex-shrink-0 px-0.5"
            >
              <button
                onClick={() => setActiveCategory(category)}
                className={`flex flex-col items-center justify-center rounded-lg py-3 px-2 w-full h-[82px] transition-all border relative ${
                  activeCategory === category
                    ? "border-green-400 text-green-600 shadow-sm bg-white after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-1 after:bg-green-500 after:rounded-full"
                    : "border-transparent text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="mb-1">
                  {Icon ? (
                    <Icon size={28} strokeWidth={1.5} />
                  ) : (
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-xs">?</span>
                    </div>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-center leading-tight break-words w-[96px] sm:w-[104px]">
                  {language?.menu?.[category] || category}
                </span>
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <button
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all ${
          isEnd ? "opacity-30 cursor-default" : "opacity-100 cursor-pointer"
        }`}
        onClick={slideNext}
        aria-label="Próxima categoria"
      >
        <FaArrowRight className="text-gray-700 text-lg sm:text-xl" />
      </button>
    </div>
  );
};

export default CarouselCategories;