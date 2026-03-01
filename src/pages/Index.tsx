import HudOverlay from "@/components/HudOverlay";
import JarvisChat from "@/components/JarvisChat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background grid */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
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
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(220 30% 3%) 100%)',
        }}
      />

      <HudOverlay />
      <JarvisChat />
    </div>
  );
};

export default Index;
