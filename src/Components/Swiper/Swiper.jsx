import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import { Navigation } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/navigation';
import './swiper.css';
import { Image } from '@aws-amplify/ui-react';
import ProductCard from '../Card/ProductCard';

export default () => {
  return (
    <Swiper

      modules={[Navigation]}
      navigation={true}
      spaceBetween={10}
      slidesPerView={4}

      onSwiper={(swiper) => console.log(swiper)}
      onSlideChange={() => console.log('slide change')}

    >

      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
      <SwiperSlide><ProductCard /></SwiperSlide>
    </Swiper>
  );
};