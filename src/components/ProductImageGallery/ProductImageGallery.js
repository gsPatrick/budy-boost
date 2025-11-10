'use client';
import { useState } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './ProductImageGallery.module.css';

const ProductImageGallery = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageWrapper}>
        <Image
          src={images[activeIndex]}
          alt={`Imagem do produto ${activeIndex + 1}`}
          width={600}
          height={600}
          className={styles.mainImage}
          priority
        />
      </div>
      <div className={styles.thumbnailRail}>
        <button onClick={goToPrev} className={styles.navButton}><FiChevronLeft /></button>
        <div className={styles.thumbnails}>
          {images.map((img, index) => (
            <div
              key={index}
              className={`${styles.thumbnail} ${index === activeIndex ? styles.active : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <Image src={img} alt={`Miniatura ${index + 1}`} width={80} height={80} />
            </div>
          ))}
        </div>
        <button onClick={goToNext} className={styles.navButton}><FiChevronRight /></button>
      </div>
    </div>
  );
};

export default ProductImageGallery;