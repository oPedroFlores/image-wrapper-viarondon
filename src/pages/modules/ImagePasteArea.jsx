import React, { useState, useRef } from "react";
import styles from "../../css/imagePasteArea.module.css";
import { FaTrash } from "react-icons/fa";
import Masonry from "react-masonry-css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const ImagePasteArea = () => {
  const [images, setImages] = useState([]);
  const [layoutStyle, setLayoutStyle] = useState("grid");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dropAreaRef = useRef(null);

  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith("image")) {
        const file = item.getAsFile();
        const imageUrl = URL.createObjectURL(file);
        setImages((prevImages) => [...prevImages, imageUrl]);
      }
    }
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    for (let file of files) {
      if (file.type.startsWith("image")) {
        const imageUrl = URL.createObjectURL(file);
        setImages((prevImages) => [...prevImages, imageUrl]);
      }
    }
  };

  const deleteImage = (index, event) => {
    if (
      !event.ctrlKey &&
      !window.confirm("Tem certeza que deseja excluir esta imagem?")
    ) {
      return;
    }
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("imageIndex", index);
    e.currentTarget.classList.add(styles.dragging);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessário para permitir o drop
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData("imageIndex");
    e.preventDefault(); // Impede o comportamento padrão

    const newImages = [...images];
    const draggedImage = newImages[dragIndex];
    newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    setImages(newImages);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove(styles.dragging);
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOverUpload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDropUpload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const imageUrl = URL.createObjectURL(file);
          setImages((prevImages) => [...prevImages, imageUrl]);
        }
      }
    }
  };

  return (
    <div className={styles.container} onPaste={handlePaste}>
      <div 
        className={`${styles.pasteArea} ${isDragging ? styles.dragging : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOverUpload}
        onDragLeave={handleDragLeave}
        onDrop={handleDropUpload}
        ref={dropAreaRef}
      >
        Arraste e solte imagens aqui, cole suas imagens ou
        <label htmlFor="fileUpload" className={styles.uploadLabel}>
          selecione um arquivo
        </label>
        <input
          type="file"
          id="fileUpload"
          className={styles.fileInput}
          multiple
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>
      <div className={styles.controls}>
        <label>Estilo de Layout:</label>
        <select
          value={layoutStyle}
          onChange={(e) => setLayoutStyle(e.target.value)}
        >
          <option value="grid">Grade</option>
          <option value="list">Lista</option>
          <option value="masonry">Alvenaria</option>
          <option value="columns">Colunas</option>
        </select>
      </div>
      {layoutStyle === "masonry" ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className={styles.myMasonryGrid}
          columnClassName={styles.myMasonryGridColumn}
          id="imageList"
        >
          {images.map((image, index) => (
            <div
              key={index}
              className={styles.imageWrapper}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.hoverEffect}>
                <span onClick={(event) => deleteImage(index, event)}>
                  <FaTrash />
                </span>
              </div>
              <img
                src={image}
                alt={`Pasted ${index}`}
                onClick={() => openLightbox(index)}
              />
            </div>
          ))}
        </Masonry>
      ) : (
        <div
          className={`${styles.imageList} ${styles[layoutStyle]}`}
          id="imageList"
        >
          {images.map((image, index) => (
            <div
              key={index}
              className={styles.imageWrapper}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.hoverEffect}>
                <span onClick={(event) => deleteImage(index, event)}>
                  <FaTrash />
                </span>
              </div>
              <img
                src={image}
                alt={`Pasted ${index}`}
                onClick={() => openLightbox(index)}
              />
            </div>
          ))}
        </div>
      )}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={images.map((src) => ({ src }))}
          index={currentImageIndex}
          render={{ slide: Lightbox.defaultSlide }}
          onIndexChange={(index) => setCurrentImageIndex(index)}
        />
      )}
    </div>
  );
};

export default ImagePasteArea;
