"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '../firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';

const WelcomeModal = ({ onClose }) => {
  const [media, setMedia] = useState({
    url: null,
    loading: true,
    error: null,
    naturalSize: { width: 0, height: 0 }
  });

  const [displaySize, setDisplaySize] = useState({
    width: 0,
    height: 0
  });

  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true
  );

  const imgRef = useRef(null);
  const modalRef = useRef(null);

  // Função para detectar dispositivos com notch (iPhone X e superiores)
  const hasNotch = () => {
    if (typeof window === 'undefined') return false;
    const ratio = window.devicePixelRatio || 1;
    const screenHeight = Math.round(window.screen.height * ratio);
    const screenWidth = Math.round(window.screen.width * ratio);
    
    return (
      (isPortrait && 
        (screenHeight === 2436 || screenHeight === 2688 || screenHeight === 1792 || 
         screenHeight === 2532 || screenHeight === 2778 || screenHeight === 2556 ||
         screenHeight === 2796 || screenHeight === 2388 || screenHeight === 2340)) ||
      (!isPortrait && 
        (screenWidth === 2436 || screenWidth === 2688 || screenWidth === 1792 || 
         screenWidth === 2532 || screenWidth === 2778 || screenWidth === 2556 ||
         screenWidth === 2796 || screenWidth === 2388 || screenWidth === 2340))
    );
  };

  const updateDisplaySize = useCallback(() => {
    if (!media.naturalSize.width || !media.naturalSize.height) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowRatio = windowWidth / windowHeight;
    const imageRatio = media.naturalSize.width / media.naturalSize.height;

    // Margens de segurança para dispositivos com notch
    const safeAreaInsetTop = hasNotch() ? (isPortrait ? 30 : 0) : 0;
    const safeAreaInsetBottom = hasNotch() ? (isPortrait ? 30 : 0) : 0;
    const safeAreaInsetLeft = hasNotch() ? (!isPortrait ? 30 : 0) : 0;
    const safeAreaInsetRight = hasNotch() ? (!isPortrait ? 30 : 0) : 0;

    const availableWidth = windowWidth - safeAreaInsetLeft - safeAreaInsetRight;
    const availableHeight = windowHeight - safeAreaInsetTop - safeAreaInsetBottom;

    let displayWidth, displayHeight;

    if (imageRatio > windowRatio) {
      // Imagem mais larga que a tela
      displayWidth = Math.min(availableWidth, media.naturalSize.width);
      displayHeight = displayWidth / imageRatio;
    } else {
      // Imagem mais alta que a tela
      displayHeight = Math.min(availableHeight, media.naturalSize.height);
      displayWidth = displayHeight * imageRatio;
    }

    // Garantir que a imagem não seja muito pequena em dispositivos móveis
    const minDisplaySize = Math.min(windowWidth, windowHeight) * 0.8;
    if (displayWidth < minDisplaySize && displayHeight < minDisplaySize) {
      if (imageRatio > 1) {
        displayWidth = minDisplaySize;
        displayHeight = minDisplaySize / imageRatio;
      } else {
        displayHeight = minDisplaySize;
        displayWidth = minDisplaySize * imageRatio;
      }
    }

    setDisplaySize({
      width: displayWidth,
      height: displayHeight
    });
  }, [media.naturalSize, isPortrait]);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const imageRef = storageRef(storage, 'event_images/evento.jpg');
        const imageUrl = await getDownloadURL(imageRef);
        
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          setMedia({
            url: imageUrl,
            loading: false,
            error: null,
            naturalSize: {
              width: img.naturalWidth,
              height: img.naturalHeight
            }
          });
        };
        img.onerror = () => {
          setMedia({
            url: null,
            loading: false,
            error: "Erro ao carregar imagem"
          });
        };
      } catch (error) {
        console.error("Erro ao carregar imagem:", error);
        setMedia({
          url: null,
          loading: false,
          error: "Nenhuma imagem encontrada"
        });
      }
    };

    loadImage();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      updateDisplaySize();
    };

    if (media.naturalSize.width && media.naturalSize.height) {
      updateDisplaySize();
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [media.naturalSize, updateDisplaySize]);

  // Efeito de toque para fechar em dispositivos móveis
  useEffect(() => {
    const handleTouch = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('touchstart', handleTouch, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouch);
    };
  }, [onClose]);

  if (media.loading) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-800 rounded-full mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (media.error) {
    return (
      <div 
        className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-4"
        style={{
          paddingTop: hasNotch() && isPortrait ? 'env(safe-area-inset-top)' : '1rem',
          paddingBottom: hasNotch() && isPortrait ? 'env(safe-area-inset-bottom)' : '1rem',
          paddingLeft: hasNotch() && !isPortrait ? 'env(safe-area-inset-left)' : '1rem',
          paddingRight: hasNotch() && !isPortrait ? 'env(safe-area-inset-right)' : '1rem'
        }}
      >
        <button 
          onClick={onClose}
          className="absolute z-[99999] text-white close-button-effect"
          style={{
            top: hasNotch() && isPortrait ? 'calc(1.5rem + env(safe-area-inset-top))' : '1.5rem',
            right: hasNotch() && !isPortrait ? 'calc(1.5rem + env(safe-area-inset-right))' : '1.5rem',
            fontSize: '2.5rem',
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7
          }}
        >
          &times;
        </button>
        <p className="text-white text-lg text-center max-w-md">{media.error}</p>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black z-[9999] overflow-hidden touch-none"
      style={{
        paddingTop: hasNotch() && isPortrait ? 'env(safe-area-inset-top)' : '0',
        paddingBottom: hasNotch() && isPortrait ? 'env(safe-area-inset-bottom)' : '0',
        paddingLeft: hasNotch() && !isPortrait ? 'env(safe-area-inset-left)' : '0',
        paddingRight: hasNotch() && !isPortrait ? 'env(safe-area-inset-right)' : '0'
      }}
    >
      {/* Botão de fechar premium com ajuste para notch */}
      <button
        onClick={onClose}
        className="absolute z-[99999] text-white close-button-effect"
        style={{
          top: hasNotch() && isPortrait ? 'calc(1.5rem + env(safe-area-inset-top))' : '1.5rem',
          right: hasNotch() && !isPortrait ? 'calc(1.5rem + env(safe-area-inset-right))' : '1.5rem',
          fontSize: '2.5rem',
          width: '2.5rem',
          height: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          opacity: 0.8,
          WebkitTapHighlightColor: 'transparent'
        }}
        aria-label="Fechar modal"
      >
        &times;
      </button>

      {/* Container principal */}
      <div 
        ref={modalRef}
        className="w-full h-full flex items-center justify-center p-4 touch-none"
        style={{
          paddingTop: hasNotch() && isPortrait ? 'env(safe-area-inset-top)' : '0',
          paddingBottom: hasNotch() && isPortrait ? 'env(safe-area-inset-bottom)' : '0',
          paddingLeft: hasNotch() && !isPortrait ? 'env(safe-area-inset-left)' : '0',
          paddingRight: hasNotch() && !isPortrait ? 'env(safe-area-inset-right)' : '0'
        }}
      >
        {/* Container da imagem com dimensionamento perfeito */}
        <div 
          className="animate-elite-fade image-zoom-hover touch-none"
          style={{
            width: `${displaySize.width}px`,
            height: `${displaySize.height}px`,
            maxWidth: '100%',
            maxHeight: '100%',
            position: 'relative'
          }}
        >
          <img
            ref={imgRef}
            src={media.url}
            alt="Evento Especial"
            className="modal-image-content animate-elite-scale w-full h-full object-contain touch-none select-none"
            style={{
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              KhtmlUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              userSelect: 'none'
            }}
            onLoad={(e) => {
              if (!media.naturalSize.width || !media.naturalSize.height) {
                setMedia(prev => ({
                  ...prev,
                  naturalSize: {
                    width: e.target.naturalWidth,
                    height: e.target.naturalHeight
                  }
                }));
              }
            }}
            onError={(e) => {
              console.error("Erro ao carregar imagem:", e);
              setMedia(prev => ({ ...prev, url: null, error: "Erro ao carregar imagem" }));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;