import { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { X } from "lucide-react";

// ========== 3D Human Body wireframe ==========
const HumanBody = ({ scanProgress, scanPhase }: { scanProgress: number; scanPhase: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const bodyColor = new THREE.Color("hsl(195, 100%, 50%)");
  const scanColor = new THREE.Color("hsl(195, 100%, 70%)");

  // Wireframe material
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: bodyColor,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  }), []);

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: bodyColor,
    transparent: true,
    opacity: 0.08,
  }), []);

  const scanLineMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: scanColor,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  }), []);

  // Scan line position: maps 0-100 to y range 2.2 to -2.2
  const scanY = 2.2 - (scanProgress / 100) * 4.4;

  // Point markers for completed scan
  const markerPositions = [
    { pos: [0, 1.8, 0] as [number, number, number], label: "HEAD" },
    { pos: [0, 0.8, 0] as [number, number, number], label: "CHEST" },
    { pos: [-0.8, 0.4, 0] as [number, number, number], label: "R.ARM" },
    { pos: [0.8, 0.4, 0] as [number, number, number], label: "L.ARM" },
    { pos: [0, -0.2, 0] as [number, number, number], label: "CORE" },
    { pos: [-0.3, -1.5, 0] as [number, number, number], label: "R.LEG" },
    { pos: [0.3, -1.5, 0] as [number, number, number], label: "L.LEG" },
  ];

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.75, 0]} material={wireMat}>
        <sphereGeometry args={[0.3, 16, 12]} />
      </mesh>
      <mesh position={[0, 1.75, 0]} material={glowMat}>
        <sphereGeometry args={[0.32, 16, 12]} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.35, 0]} material={wireMat}>
        <cylinderGeometry args={[0.08, 0.12, 0.2, 8]} />
      </mesh>

      {/* Torso - upper */}
      <mesh position={[0, 0.9, 0]} material={wireMat}>
        <cylinderGeometry args={[0.35, 0.45, 0.7, 12]} />
      </mesh>
      <mesh position={[0, 0.9, 0]} material={glowMat}>
        <cylinderGeometry args={[0.37, 0.47, 0.72, 12]} />
      </mesh>

      {/* Torso - lower */}
      <mesh position={[0, 0.3, 0]} material={wireMat}>
        <cylinderGeometry args={[0.45, 0.35, 0.5, 12]} />
      </mesh>

      {/* Hips */}
      <mesh position={[0, -0.05, 0]} material={wireMat}>
        <cylinderGeometry args={[0.35, 0.38, 0.2, 12]} />
      </mesh>

      {/* Left shoulder */}
      <mesh position={[0.5, 1.15, 0]} material={wireMat}>
        <sphereGeometry args={[0.1, 8, 6]} />
      </mesh>
      {/* Right shoulder */}
      <mesh position={[-0.5, 1.15, 0]} material={wireMat}>
        <sphereGeometry args={[0.1, 8, 6]} />
      </mesh>

      {/* Left upper arm */}
      <mesh position={[0.6, 0.75, 0]} rotation={[0, 0, 0.15]} material={wireMat}>
        <cylinderGeometry args={[0.07, 0.09, 0.7, 8]} />
      </mesh>
      {/* Left forearm */}
      <mesh position={[0.68, 0.2, 0]} rotation={[0, 0, 0.1]} material={wireMat}>
        <cylinderGeometry args={[0.05, 0.07, 0.6, 8]} />
      </mesh>
      {/* Left hand */}
      <mesh position={[0.72, -0.15, 0]} material={wireMat}>
        <boxGeometry args={[0.08, 0.12, 0.05]} />
      </mesh>

      {/* Right upper arm */}
      <mesh position={[-0.6, 0.75, 0]} rotation={[0, 0, -0.15]} material={wireMat}>
        <cylinderGeometry args={[0.07, 0.09, 0.7, 8]} />
      </mesh>
      {/* Right forearm */}
      <mesh position={[-0.68, 0.2, 0]} rotation={[0, 0, -0.1]} material={wireMat}>
        <cylinderGeometry args={[0.05, 0.07, 0.6, 8]} />
      </mesh>
      {/* Right hand */}
      <mesh position={[-0.72, -0.15, 0]} material={wireMat}>
        <boxGeometry args={[0.08, 0.12, 0.05]} />
      </mesh>

      {/* Left upper leg */}
      <mesh position={[0.18, -0.55, 0]} material={wireMat}>
        <cylinderGeometry args={[0.1, 0.14, 0.8, 8]} />
      </mesh>
      {/* Left lower leg */}
      <mesh position={[0.18, -1.35, 0]} material={wireMat}>
        <cylinderGeometry args={[0.06, 0.1, 0.8, 8]} />
      </mesh>
      {/* Left foot */}
      <mesh position={[0.18, -1.82, 0.05]} material={wireMat}>
        <boxGeometry args={[0.1, 0.06, 0.2]} />
      </mesh>

      {/* Right upper leg */}
      <mesh position={[-0.18, -0.55, 0]} material={wireMat}>
        <cylinderGeometry args={[0.1, 0.14, 0.8, 8]} />
      </mesh>
      {/* Right lower leg */}
      <mesh position={[-0.18, -1.35, 0]} material={wireMat}>
        <cylinderGeometry args={[0.06, 0.1, 0.8, 8]} />
      </mesh>
      {/* Right foot */}
      <mesh position={[-0.18, -1.82, 0.05]} material={wireMat}>
        <boxGeometry args={[0.1, 0.06, 0.2]} />
      </mesh>

      {/* Spine line */}
      {[0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2].map((y, i) => (
        <mesh key={`spine-${i}`} position={[0, -0.1 + y, -0.05]} material={wireMat}>
          <sphereGeometry args={[0.025, 6, 4]} />
        </mesh>
      ))}

      {/* Rib cage hints */}
      {[0.7, 0.85, 1.0].map((y, i) => (
        <mesh key={`rib-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={wireMat}>
          <torusGeometry args={[0.3 + i * 0.04, 0.01, 4, 16, Math.PI]} />
        </mesh>
      ))}

      {/* Scan line plane */}
      {scanPhase === "scanning" && (
        <mesh ref={scanLineRef} position={[0, scanY, 0]} rotation={[Math.PI / 2, 0, 0]} material={scanLineMat}>
          <planeGeometry args={[2.5, 2.5]} />
        </mesh>
      )}

      {/* Completed scan markers */}
      {scanPhase === "complete" && markerPositions.map((m, i) => (
        <mesh key={i} position={m.pos}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshBasicMaterial color={scanColor} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// ========== Holographic rings ==========
const HoloRings = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.y += delta * 0.5;
    if (ring2Ref.current) ring2Ref.current.rotation.y -= delta * 0.3;
  });

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color("hsl(195, 100%, 50%)"),
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
  }), []);

  return (
    <>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.01, 4, 64]} />
        <primitive object={ringMat} attach="material" />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2.5, 0.3, 0]}>
        <torusGeometry args={[2.0, 0.008, 4, 64]} />
        <primitive object={ringMat} attach="material" />
      </mesh>
    </>
  );
};

// ========== Main Panel ==========
interface BodyScanPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: () => void;
}

const BodyScanPanel = ({ isOpen, onClose, onScanComplete }: BodyScanPanelProps) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<"scanning" | "analyzing" | "complete">("scanning");
  const [vitals, setVitals] = useState({
    heartRate: 72,
    bodyTemp: 36.6,
    bloodPressure: "120/80",
    oxygenSat: 98,
    hydration: 85,
    stress: 23,
  });

  useEffect(() => {
    if (isOpen) {
      setScanProgress(0);
      setScanPhase("scanning");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanPhase("analyzing");
          setTimeout(() => {
            setScanPhase("complete");
            onScanComplete?.();
          }, 1500);
          return 100;
        }
        return prev + 0.8;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen, onScanComplete]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setVitals(v => ({
        ...v,
        heartRate: 70 + Math.floor(Math.random() * 8),
        bodyTemp: +(36.4 + Math.random() * 0.4).toFixed(1),
        oxygenSat: 97 + Math.floor(Math.random() * 3),
        stress: 20 + Math.floor(Math.random() * 10),
        hydration: 82 + Math.floor(Math.random() * 8),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const cyanColor = "hsl(195 100% 50%)";

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center animate-fade-in"
      style={{ background: "transparent" }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-3 right-[52px] z-40 p-1.5 rounded-sm border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
      >
        <X size={14} />
      </button>

      {/* Top-left header */}
      <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 text-center">
        <div className="font-orbitron text-[11px] tracking-[0.4em] text-primary/70">BIOMETRIC SCAN</div>
        <div className="font-mono text-[8px] text-primary/40 tracking-wider mt-1">
          {scanPhase === "scanning" ? "SCANNING IN PROGRESS..." : scanPhase === "analyzing" ? "ANALYZING DATA..." : "SCAN COMPLETE · ALL SYSTEMS NOMINAL"}
        </div>
        {/* Progress bar */}
        <div className="w-48 mx-auto mt-2">
          <div className="h-[2px] bg-border/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${scanProgress}%`,
                background: `linear-gradient(90deg, ${cyanColor}40, ${cyanColor})`,
                boxShadow: `0 0 8px ${cyanColor}80`,
              }}
            />
          </div>
          <div className="font-mono text-[7px] text-primary/40 text-right mt-0.5">{Math.round(scanProgress)}%</div>
        </div>
      </div>

      {/* 3D Canvas - full center */}
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={0.5} color="#00d4ff" />
          <pointLight position={[-5, -5, 5]} intensity={0.3} color="#0088cc" />
          <HumanBody scanProgress={scanProgress} scanPhase={scanPhase} />
          <HoloRings />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3 / 4}
          />
        </Canvas>
      </div>

      {/* Bottom vitals */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex gap-3">
          {[
            { label: "HEART", value: `${vitals.heartRate}`, unit: "BPM" },
            { label: "TEMP", value: `${vitals.bodyTemp}`, unit: "°C" },
            { label: "BP", value: vitals.bloodPressure, unit: "" },
            { label: "O₂", value: `${vitals.oxygenSat}`, unit: "%" },
            { label: "HYDRA", value: `${vitals.hydration}`, unit: "%" },
            { label: "STRESS", value: `${vitals.stress}`, unit: "LVL" },
          ].map((v, i) => (
            <div key={i} className="text-center px-3 py-1.5 border border-primary/15 rounded-sm bg-card/20 backdrop-blur-sm">
              <div className="font-mono text-[6px] text-primary/40 tracking-wider">{v.label}</div>
              <div className="font-orbitron text-xs text-primary/80 mt-0.5">
                {v.value}<span className="font-mono text-[6px] text-primary/40 ml-0.5">{v.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side labels */}
      {scanPhase === "complete" && (
        <>
          <div className="fixed left-[15%] top-[30%] z-40 animate-fade-in">
            <div className="font-mono text-[7px] text-primary/50 space-y-1">
              <div>SKELETAL: <span className="text-primary/80">INTACT</span></div>
              <div>MUSCULAR: <span className="text-primary/80">NOMINAL</span></div>
              <div>NERVOUS: <span className="text-primary/80">ACTIVE</span></div>
            </div>
          </div>
          <div className="fixed right-[15%] top-[30%] z-40 animate-fade-in">
            <div className="font-mono text-[7px] text-primary/50 space-y-1 text-right">
              <div>CARDIAC: <span className="text-primary/80">STRONG</span></div>
              <div>RESPIRATORY: <span className="text-primary/80">CLEAR</span></div>
              <div>NEURAL: <span className="text-primary/80">OPTIMAL</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BodyScanPanel;
