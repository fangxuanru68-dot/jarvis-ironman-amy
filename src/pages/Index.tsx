import JarvisChat from "@/components/JarvisChat";
import { useGlobalScale } from "@/hooks/useGlobalScale";

const Index = () => {
  const { globalScale, setGlobalScale } = useGlobalScale();

  return (
    <div
      className="min-h-screen bg-background relative overflow-hidden"
      style={{
        transform: `scale(${globalScale})`,
        transformOrigin: "center center",
        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        width: globalScale < 1 ? `${100 / globalScale}%` : "100%",
        height: globalScale < 1 ? `${100 / globalScale}vh` : "100vh",
      }}
    >
      {/* Background grid (visible when camera is off) */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(195 100% 50% / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(195 100% 50% / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Radial vignette */}
      <div 
        className="fixed inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, hsl(220 30% 3%) 100%)',
        }}
      />

      {/* Corner brackets */}
      <div className="fixed top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary/20 pointer-events-none z-20" />
      <div className="fixed top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-primary/20 pointer-events-none z-20" />
      <div className="fixed bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-primary/20 pointer-events-none z-20" />
      <div className="fixed bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary/20 pointer-events-none z-20" />

      {/* Scan line */}
      <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden opacity-[0.03]">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
      </div>

      <JarvisChat onGlobalScaleChange={setGlobalScale} />
    </div>
  );
};

export default Index;
