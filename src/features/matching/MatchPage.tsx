import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import MatchPlaceholder1 from "@/assets/MatchPlaceholder1.jpeg";
import MatchPlaceholder2 from "@/assets/MatchPlaceholder2.webp";
import MatchPlaceholder3 from "@/assets/MatchPlaceholder3.jpg";
import MatchDislike from "@/assets/MatchDislike.png";
import MatchLike from "@/assets/MatchLike.png";
import OptionDots from "@/assets/OptionDots.png";
import Match1 from "@/assets/Match1.png";
import Match2 from "@/assets/Match2.png";
import MatchBG from "@/assets/background_verification.webp";
import CupidWhite from "@/assets/cupid-white.png";

interface MatchData {
  mainImage?: string;
  info?: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
  secondaryImages?: string[];
}

interface MatchPageProps {
  matchData?: MatchData;
  // Si la cuenta del usuario está completa. Si es false, mostramos el overlay con el logo Whitecupid.
  isAccountComplete?: boolean;
  // Opcional: callback para abrir el chat con el match
  onOpenChat?: (matchId?: string) => void;
}
// info placeholder 
const mockMatchDataList: MatchData[] = [
  {
    mainImage: MatchPlaceholder1,
    info: {
      title: "Marisol Pérez",
      description: "sit amet consectetur adipisicing elitQuisquam, quos lorem ipsum dolor sit amet que? qué? quisquam, quos",
      edad: 28,
      ubicación: "Bogotá, Colombia",
      intereses: "Viajes"
    },
    secondaryImages: [MatchPlaceholder2, MatchPlaceholder3]
  },
  {
    mainImage: MatchPlaceholder2,
    info: {
      title: "Ana Maria",
      description: "consectetur adipisicing elit. Quisquam, quos. lorem ipsum dolor sit amet que? lorem ipsum dolor sit amet consectetur adipisicing elit",
      edad: 25,
      ubicación: "Medellín, Colombia",
      intereses: "Otorrinolaringologia, Arte, Lectura, Cine"
    },
    secondaryImages: [MatchPlaceholder3]
  },
  {
    mainImage: MatchPlaceholder3,
    info: {
      title: "Jimena Gomez",
      description: "consectetur adipisicing elit Quisquam, quos lorem ipsum dolor sit amet que?",
      edad: 30,
      ubicación: "Cali, Colombia",
      intereses: "Gastronomía, Fotografía, Naturaleza, Deportes, Música"
    },
    secondaryImages: []
  }
];

const MatchPage: React.FC<MatchPageProps> = ({ matchData, isAccountComplete, onOpenChat }) => {
  const accountComplete = typeof isAccountComplete === 'boolean' ? isAccountComplete : true;

  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * mockMatchDataList.length)
  );
  const [isAtTop, setIsAtTop] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayIcon, setOverlayIcon] = useState<string>("");
  const [showOptions, setShowOptions] = useState(false);
  // Modal que aparece cuando se genera un match
  const [showMatchModal, setShowMatchModal] = useState(false);
  // Animación previa al modal de match
  const [matchAnimRunning, setMatchAnimRunning] = useState(false);
  const [img1Style, setImg1Style] = useState<React.CSSProperties>({});
  const [img2Style, setImg2Style] = useState<React.CSSProperties>({});
  const [modalTranslateY, setModalTranslateY] = useState<string>('100vh');

  // Reproduce la animación previa al modal y luego muestra el modal
  const playMatchAnimation = () => {
    const enterDuration = 1200; // ms
    const pauseDuration = 1200; // 1s pause in center
    const exitDuration = 600;

    // helper: calcula estilos de tamaño para la imagen según la relación de aspecto de la pantalla
    const getImageSizeStyle = () => {
      if (typeof window === 'undefined') return { width: '80vw', maxWidth: '900px' };
      const w = window.innerWidth;
      const h = window.innerHeight;
      // si alto > ancho (portrait) -> ajustar al ancho; si ancho >= alto -> ajustar al alto
      if (h > w) {
        return { width: '90vw', maxWidth: '1200px', height: 'auto' };
      } else {
        return { height: '60vh', maxHeight: '1200px', width: 'auto' };
      }
    };

    // Inicial: colocar las imágenes fuera de pantalla horizontalmente (img1: derecha, img2: izquierda)
    setMatchAnimRunning(true);
    const sizeStyle = getImageSizeStyle();
    // imagenes mucho mas grandes (casi 4x)
    setImg1Style({
      position: 'fixed',
      left: '110vw', // start off to the right
      top: '0vh', // 0% vertical
      transform: 'translateX(-50%) rotate(-5deg)',
      transition: `left ${enterDuration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${enterDuration}ms ease`,
      opacity: 0,
      zIndex: 60,
      ...sizeStyle,
    });

    setImg2Style({
      position: 'fixed',
      left: '-110vw', // start off to the left
      bottom: '0vh', // pegada al borde inferior
      transform: 'translateX(-50%) rotate(5deg)',
      transition: `left ${enterDuration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${enterDuration}ms ease`,
      opacity: 0,
      zIndex: 60,
      ...sizeStyle,
    });

    // small timeout to allow initial styles to apply
    setTimeout(() => {
      // Entradas: mover a centro horizontal (solo izquierda/derecha), vertical no cambia
      setImg1Style(prev => ({
        ...prev,
        left: '50%',
        opacity: 1,
      }));

      setImg2Style(prev => ({
        ...prev,
        left: '50%',
        opacity: 1,
      }));

      // Pause in center for 1s
      setTimeout(() => {
        // Salida: van hacia el lado opuesto (atraviesan pantalla), easing SineIn aproximado
        setImg1Style(prev => ({
          ...prev,
          left: '-110vw',
          transition: `left ${exitDuration}ms cubic-bezier(0.47, 0, 0.745, 0.715), opacity ${exitDuration}ms ease`,
          opacity: 0,
        }));

        setImg2Style(prev => ({
          ...prev,
          left: '110vw',
          transition: `left ${exitDuration}ms cubic-bezier(0.47, 0, 0.745, 0.715), opacity ${exitDuration}ms ease`,
          opacity: 0,
        }));

        setTimeout(() => {
          // ocultar animación y mostrar modal animado desde abajo
          setMatchAnimRunning(false);
          setImg1Style({});
          setImg2Style({});

          // Mostrar fondo semitransparente y modal subiendo
          setShowMatchModal(true);
          // animación del modal: empezamos fuera de pantalla y la animamos a centered
          setModalTranslateY('100vh');
          setTimeout(() => {
            setModalTranslateY('-50%');
          }, 30);
        }, exitDuration + 50);
      }, pauseDuration + 50);
    }, 30);
  };

  // Swipe states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeRotation, setSwipeRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const displayData = matchData || mockMatchDataList[currentIndex];

  // Nota: la lógica de límite de likes fue eliminada; no necesitamos calcular reinicios.

  //efecto de scroll
  useEffect(() => {
    const handleScroll = () => {
      const viewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        setIsAtTop(viewport.scrollTop === 0);
      }
    };

    const timeoutId = setTimeout(() => {
      const viewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        viewport.addEventListener('scroll', handleScroll);
        setIsAtTop(viewport.scrollTop === 0);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const viewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        viewport.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  //animacion de like
  const handleLike = () => {
    if (isAnimating) return;

    // Si la cuenta no está completa, mostramos el overlay con el logo Whitecupid
    if (!accountComplete) {
      setOverlayIcon(CupidWhite);
      setShowOverlay(true);
      setTimeout(() => setShowOverlay(false), 2000);
      return;
    }

    setIsAnimating(true);
    setOverlayIcon(MatchLike);

    setTimeout(() => {
      setRotation(135);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mockMatchDataList.length);
        setRotation(-20);
        setShowOverlay(true);
        const viewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        if (viewport) {
          viewport.scrollTop = 0;
        }

        setTimeout(() => {
          setRotation(0);
          setIsAnimating(false);
          setTimeout(() => {
            setShowOverlay(false);
          }, 200);

          // Simular un match aleatorio (ajusta la condición según la lógica real)
          if (Math.random() < 0.35) {
            // Reproducir animación previa y luego mostrar modal
            playMatchAnimation();
          }
        }, 500);
      }, 250);
    }, 0);
  };

  //animacion de dislike
  const handleDislike = () => {
    if (isAnimating) return;

    if (!accountComplete) {
      setOverlayIcon(CupidWhite);
      setShowOverlay(true);
      setTimeout(() => setShowOverlay(false), 2000);
      return;
    }

    setIsAnimating(true);
    setOverlayIcon(MatchDislike);

    setTimeout(() => {
      setRotation(-135);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mockMatchDataList.length);
        setRotation(20);
        setShowOverlay(true);
        const viewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        if (viewport) {
          viewport.scrollTop = 0;
        }

        setTimeout(() => {
          setRotation(0);
          setIsAnimating(false);
          setTimeout(() => {
            setShowOverlay(false);
          }, 200);
        }, 500);
      }, 250);
    }, 0);
  };

  // Like/Dislike con Swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimating) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    let deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Limitar movimiento horizontal a máximo 100px en cada dirección
    const maxHorizontalMove = 100;
    const clampedDeltaX = Math.max(-maxHorizontalMove, Math.min(maxHorizontalMove, deltaX));
    
    // No permitir movimiento vertical hacia arriba, solo hacia abajo con límite
    const verticalMove = deltaY > 0 ? Math.min(deltaY, 20) : 0;
    
    setDragOffset({ x: clampedDeltaX, y: verticalMove });
    
    // rotacion lateral
    const maxRotation = 15;
    const rotationValue = (clampedDeltaX / 100) * maxRotation;
    setSwipeRotation(rotationValue);

    // overlay de la accion
    if (Math.abs(clampedDeltaX) > 50) {
      setShowOverlay(true);
      setOverlayIcon(clampedDeltaX > 0 ? MatchLike : MatchDislike);
    } else {
      setShowOverlay(false);
    }

    // Activar cuando se alcanza el limite
    if (Math.abs(deltaX) >= maxHorizontalMove) {
      // Trigger the action immediately
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      setSwipeRotation(0);
      
      if (deltaX > 0) {
        handleLike();
      } else {
        handleDislike();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;

    setIsDragging(false);
    const deltaX = e.clientX - dragStart.x;
    
    // Threshold for swipe action (won't be reached due to auto-trigger, but kept for safety)
    const threshold = 100;

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out';
    }

    if (Math.abs(deltaX) >= threshold) {
      // Swipe detected
      if (deltaX > 0) {
        // Swipe right - Like
        handleLike();
      } else {
        // Swipe left - Dislike
        handleDislike();
      }
    } else {
      // Reset to original position
      setShowOverlay(false);
    }

    // Reset drag states
    setDragOffset({ x: 0, y: 0 });
    setSwipeRotation(0);
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setSwipeRotation(0);
    setShowOverlay(false);
    
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out';
    }
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 relative"
      style={{
        backgroundImage: `url(${MatchBG})`,
        backgroundSize: '100% auto',
        backgroundPosition: 'left bottom',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Si la cuenta no está completa, el overlay se muestra inline cuando corresponde (no hay diálogo de límite de likes). */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="bg-white rounded-lg p-0 w-[300px] overflow-hidden ">
          <div className="flex flex-col w-full pt-8">
            <button
              onClick={() => {
                setShowOptions(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-red-50 transition-all hover:scale-105 hover:font-medium"
            >
              Bloquear
            </button>
            <div className="flex justify-center w-full">
              <div className="w-[95%] h-[1px] bg-black/20"></div>
            </div>
            <button
              onClick={() => {
                setShowOptions(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-red-50 transition-all hover:scale-105 hover:font-medium"
            >
              Bloquear y reportar
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Match Modal + Pre-animation */}
      {/* Fondo blanco que cubre la pantalla durante la animación/modal */}
      {(matchAnimRunning || showMatchModal) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.5)', zIndex: 50 }} aria-hidden />
      )}

      {/* Imágenes animadas previas al modal (solo durante matchAnimRunning) */}
      {matchAnimRunning && (
        <>
          <img src={Match1} alt="match-anim-1" style={{ ...img1Style }} />
          <img src={Match2} alt="match-anim-2" style={{ ...img2Style }} />
        </>
      )}

      {/* Modal del match: aparece animado desde abajo. */}
      <Dialog open={showMatchModal} onOpenChange={(open) => { if (!open) setShowMatchModal(false); }}>
        <DialogContent
            className="fixed left-1/2 -translate-x-1/2 bg-white rounded-lg text-center"
            style={{
              left: '50%',
              // Ocupa el 75% del viewport (alto y ancho)
              width: '75vw',
              height: '75vh',
              maxWidth: '1100px',
              maxHeight: '100vh',
              overflow: 'hidden',
              transform: `translate(-50%, ${modalTranslateY})`,
              zIndex: 80,
              transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%', padding: 20, boxSizing: 'border-box', overflow: 'hidden'}}>
              {/* Avatar: usa porcentajes relativos al contenedor para que escale automáticamente */}
              <div style={{height: '36%', width: 'auto', maxWidth: '40%', minWidth: 64, aspectRatio: '1/1', borderRadius: '9999px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.12)'}}>
                <img src={displayData?.mainImage || '/placeholder.svg'} alt={displayData?.info?.title || 'Match'} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
              </div>

              <h2 style={{margin: 0, fontSize: 'clamp(18px, 2.4vh, 28px)', fontWeight: 700}}>¡Es un match!</h2>
              <p style={{margin: 0, fontSize: 'clamp(13px, 1.8vh, 18px)', color: '#4B5563'}}>
                Has hecho match con <span style={{fontWeight: 700}}>{displayData?.info?.title}</span>
              </p>

              {/* Contenedor central: elementos apilados verticalmente para evitar que los botones se vayan a un lado */}
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 12, width: '100%', flexGrow: 1, overflow: 'hidden'}}>
                {/* Texto descriptivo: ocupa el ancho completo y centra el texto */}
                <div style={{width: '100%', padding: 8, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <p style={{margin: 0, fontSize: 'clamp(12px, 1.6vh, 16px)', color: '#374151', textAlign: 'center', overflow: 'hidden'}}>
                    {displayData?.info?.description || 'Descripcion'}
                  </p>
                </div>

                {/* Botones / acciones: apilados verticalmente y centrados, ocupan todo el ancho para evitar desplazamientos laterales */}
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center', padding: '8px 12px', boxSizing: 'border-box'}}>
                  <button
                    onClick={() => {
                      setShowMatchModal(false);
                      if (onOpenChat) onOpenChat();
                      else window.location.href = '/chat';
                    }}
                    className="bg-red-500 text-white px-6 py-3 rounded-full"
                    style={{width: '60%', maxWidth: 280, fontSize: 'clamp(13px, 1.6vh, 16px)'}}
                  >
                    Ir al chat
                  </button>
                  <DialogClose className="text-sm text-gray-500 underline" style={{fontSize: 'clamp(12px, 1.4vh, 14px)'}}>Cerrar y seguir</DialogClose>
                </div>
              </div>
            </div>
          </DialogContent>
      </Dialog>
      <div style={{ perspective: '1500px' }}>
        <Card
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="h-[85vh] w-[calc(85vh*101/150)] bg-white rounded-lg aspect-[101/150] overflow-hidden flex flex-col relative shadow-lg shadow-black/20 touch-none select-none"
          style={{
              transform: `rotateY(${rotation}deg) translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotateZ(${swipeRotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
              transformStyle: 'preserve-3d',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
        >
          {/* Name/age bar - Static overlay */}
          <div className={`absolute top-0 left-0 w-full px-4 py-3 flex flex-col gap-2 z-20 pointer-events-none transition-colors duration-300 ${isAtTop
            ? 'bg-gradient-to-b from-black/50 via-black/20 to-transparent shadow-transparent'
            : 'bg-white shadow-lg'
            }`}>
            <div className="flex items-center justify-between pointer-events-auto">
              <div className={`text-[30px] font-['Poppins'] transition-colors duration-300 ${isAtTop ? 'text-white' : 'text-black'
                }`}>
                {displayData?.info?.title || "Nombre"}
                {displayData?.info?.edad && `, ${displayData.info.edad}`}
              </div>
              <button
                onClick={() => setShowOptions(true)}
                className={`bg-transparent border-0 p-2 transition-opacity cursor-pointer hover:opacity-70 hover:scale-110 ${isAtTop ? "invert" : ""
                  }`}
              >
                <img
                  src={OptionDots}
                  alt="Options"
                  className={`w-6 h-6  ${isAtTop ? "invert" : ""}`}
                  style={isAtTop ? { filter: "invert(1)" } : { filter: "invert(0)" }}
                />
              </button>
            </div>
            <div className="inline-block px-1 py-1 bg-white rounded-full shadow-md shadow-black/80 pointer-events-auto w-fit min-w-[60px]">
              <div className="flex items-center justify-center">
                <span className="text-[15px] text-black font-['Poppins'] text-center whitespace-nowrap">
                  {displayData?.info?.intereses?.split(",")[0]?.trim() || "Preferencia"}
                </span>
              </div>
            </div>
          </div>
             <ScrollArea className="flex-1 w-full [&>div[data-radix-scroll-area-viewport]]:!pointer-events-auto relative touch-pan-y">
            {/* Overlay */}
            <div
              className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-200 pointer-events-none ${showOverlay ? 'opacity-100' : 'opacity-0'
                } ${!accountComplete ? 'bg-red-300' : overlayIcon === MatchLike ? 'bg-red-500' : 'bg-blue-500'}`}
            >
              <img
                src={!accountComplete ? CupidWhite : overlayIcon}
                alt="Action Icon"
                className="w-1/2 aspect-square object-contain animate-pulse invert brightness-0"
                draggable={false}
              />
            </div>
            <div className="flex flex-col w-full h-full">
              {/* Main Image Section */}
              <div className="w-full aspect-[101/150] overflow-hidden flex items-center justify-center relative shadow-sm shadow-black/50 corner-round rounded-lg select-none pointer-events-none">
                <img
                  src={displayData?.mainImage || "/placeholder.svg"}
                  alt="Main profile blurred background"
                  className="absolute inset-0 w-full h-full object-cover object-center filter blur-2xl scale-110 z-0 opacity-50 select-none pointer-events-none"
                  aria-hidden="true"
                  draggable={false}
                />
                <div className="absolute inset-0 flex items-center justify-center z-10 select-none pointer-events-none">
                  <img
                    src={displayData?.mainImage || "/placeholder.svg"}
                    alt="Main profile"
                    className="w-full rounded-lg object-contain shadow-lg shadow-black/20 select-none pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Info Frame */}
              <div className="w-full p-4 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-poppins text-black">Acerca de mi</h3>
                  <div className="w-full min-h-[150px] p-4 bg-white border border-gray-200 flex items-center justify-center">
                    <p className="text-sm text-gray-500 text-center w-full">
                      {displayData?.info?.description || "Descripcion"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-poppins text-black">Ubicacion</h3>
                  <div className="flex justify-center">
                    <span className="text-lg font-poppins text-black text-center font-bold">
                      {displayData?.info?.ubicación || "Ubicacion"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-poppins text-black">Preferencias</h3>
                  <div className="flex flex-wrap gap-2 justify-center items-center">
                    {displayData?.info?.intereses ? (
                      displayData.info.intereses.split(", ").map((interes: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-black shadow-md shadow-black/50 w-fit min-w-[50px]"
                        >
                          {interes.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-black w-fit min-w-[50px]">
                        Preferencia 1
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Two Image Frames (render sólo si existen) */}
              <div className="w-full flex flex-col select-none">
                {displayData?.secondaryImages?.[0] ? (
                  <div className="w-full aspect-square overflow-hidden rounded-lg shadow-sm shadow-black/50 select-none">
                    <img
                      src={displayData.secondaryImages[0]}
                      alt="Secondary image 1"
                      className="w-full h-full object-cover select-none pointer-events-none"
                      draggable={false}
                    />
                  </div>
                ) : null}

                {displayData?.secondaryImages?.[1] ? (
                  <div className="w-full aspect-square overflow-hidden rounded-lg mt-[10px] shadow-sm shadow-black/50 select-none">
                    <img
                      src={displayData.secondaryImages[1]}
                      alt="Secondary image 2"
                      className="w-full h-full object-cover select-none pointer-events-none"
                      draggable={false}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </ScrollArea>

          {/* Action Buttons - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex pointer-events-none">
            <button
              onClick={handleDislike}
              disabled={isAnimating}
              style={{
                left: isAtTop ? '30%' : '10%',
                bottom: isAtTop ? '30px' : '10px',
                transform: 'translateX(-50%)'
              }}
              className={`absolute pointer-events-auto ${isAtTop ? 'w-20 h-20' : 'w-10 h-10'} rounded-full bg-white shadow-lg shadow-black/30 flex items-center justify-center ${isAtTop ? 'hover:scale-110' : 'hover:scale-150'} transition-all duration-300 hover:bg-blue-500 group disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <img
                src={MatchDislike}
                alt="Dislike"
                className={`${isAtTop ? 'w-10 h-10' : 'w-8 h-8'} transition-all duration-300 group-hover:invert group-hover:brightness-200`}
              />
            </button>
            <button
              onClick={handleLike}
              disabled={isAnimating}
              style={{
                left: isAtTop ? '70%' : '90%',
                bottom: isAtTop ? '30px' : '10px',
                transform: 'translateX(-50%)'
              }}
              className={`absolute pointer-events-auto ${isAtTop ? 'w-20 h-20' : 'w-10 h-10'} rounded-full bg-white shadow-lg shadow-black/30 flex items-center justify-center ${isAtTop ? 'hover:scale-110' : 'hover:scale-150'} transition-all duration-300 hover:bg-red-500 group disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <img
                src={MatchLike}
                alt="Like"
                className={`${isAtTop ? 'w-10 h-10' : 'w-8 h-8'} transition-all duration-300 group-hover:invert group-hover:brightness-200`}
              />
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default MatchPage;