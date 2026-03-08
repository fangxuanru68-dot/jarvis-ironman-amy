import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { X } from "lucide-react";

// ========== Iron Man Armor 3D Model ==========
const IronManArmor = ({ scanProgress, scanPhase }: { scanProgress: number; scanPhase: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  const cyan = new THREE.Color("hsl(195, 100%, 50%)");
  const cyanBright = new THREE.Color("hsl(195, 100%, 70%)");

  const armorWire = useMemo(() => new THREE.MeshPhongMaterial({
    color: cyan,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
    emissive: cyan,
    emissiveIntensity: 0.15,
  }), []);

  const armorSolid = useMemo(() => new THREE.MeshPhongMaterial({
    color: cyan,
    transparent: true,
    opacity: 0.06,
    emissive: cyan,
    emissiveIntensity: 0.1,
    side: THREE.DoubleSide,
  }), []);

  const armorEdge = useMemo(() => new THREE.MeshBasicMaterial({
    color: cyan,
    transparent: true,
    opacity: 0.5,
    wireframe: true,
  }), []);

  const arcReactorMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: cyanBright,
    transparent: true,
    opacity: 0.9,
  }), []);

  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color("hsl(195, 100%, 80%)"),
    transparent: true,
    opacity: 0.95,
  }), []);

  const scanLineMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: cyanBright,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  }), []);

  const scanY = 2.5 - (scanProgress / 100) * 5.0;

  return (
    <group ref={groupRef}>
      {/* ===== HELMET ===== */}
      {/* Main helmet - elongated, angular Iron Man shape */}
      <mesh position={[0, 1.85, 0]} material={armorWire}>
        <sphereGeometry args={[0.32, 24, 16]} />
      </mesh>
      <mesh position={[0, 1.85, 0]} material={armorSolid}>
        <sphereGeometry args={[0.33, 24, 16]} />
      </mesh>
      {/* Face plate - flattened front */}
      <mesh position={[0, 1.78, 0.22]} material={armorEdge}>
        <boxGeometry args={[0.28, 0.22, 0.08]} />
      </mesh>
      {/* Jaw / chin guard */}
      <mesh position={[0, 1.65, 0.15]} material={armorWire}>
        <boxGeometry args={[0.24, 0.1, 0.15]} />
      </mesh>
      {/* Eye slits */}
      <mesh position={[-0.08, 1.82, 0.3]} rotation={[0, 0, 0.15]} material={eyeMat}>
        <boxGeometry args={[0.1, 0.025, 0.02]} />
      </mesh>
      <mesh position={[0.08, 1.82, 0.3]} rotation={[0, 0, -0.15]} material={eyeMat}>
        <boxGeometry args={[0.1, 0.025, 0.02]} />
      </mesh>
      {/* Helmet top ridge */}
      <mesh position={[0, 1.98, 0]} material={armorEdge}>
        <boxGeometry args={[0.04, 0.04, 0.3]} />
      </mesh>
      {/* Helmet side panels */}
      <mesh position={[-0.3, 1.85, 0]} rotation={[0, 0, 0.2]} material={armorWire}>
        <boxGeometry args={[0.06, 0.25, 0.2]} />
      </mesh>
      <mesh position={[0.3, 1.85, 0]} rotation={[0, 0, -0.2]} material={armorWire}>
        <boxGeometry args={[0.06, 0.25, 0.2]} />
      </mesh>

      {/* ===== NECK ===== */}
      <mesh position={[0, 1.48, 0]} material={armorWire}>
        <cylinderGeometry args={[0.12, 0.15, 0.2, 12]} />
      </mesh>
      {/* Neck rings */}
      {[1.42, 1.48, 1.54].map((y, i) => (
        <mesh key={`neck-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={armorEdge}>
          <torusGeometry args={[0.13 + i * 0.005, 0.005, 4, 16]} />
        </mesh>
      ))}

      {/* ===== CHEST / TORSO ===== */}
      {/* Upper chest - broad, armored */}
      <mesh position={[0, 1.05, 0]} material={armorWire}>
        <cylinderGeometry args={[0.38, 0.5, 0.7, 16]} />
      </mesh>
      <mesh position={[0, 1.05, 0]} material={armorSolid}>
        <cylinderGeometry args={[0.4, 0.52, 0.72, 16]} />
      </mesh>
      {/* Chest plate panels */}
      <mesh position={[-0.15, 1.1, 0.38]} rotation={[0.1, 0.2, 0]} material={armorEdge}>
        <boxGeometry args={[0.2, 0.35, 0.03]} />
      </mesh>
      <mesh position={[0.15, 1.1, 0.38]} rotation={[0.1, -0.2, 0]} material={armorEdge}>
        <boxGeometry args={[0.2, 0.35, 0.03]} />
      </mesh>
      {/* Arc Reactor! */}
      <mesh position={[0, 1.05, 0.42]} material={arcReactorMat}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
      </mesh>
      <mesh position={[0, 1.05, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.01, 8, 16]} />
        <meshBasicMaterial color={cyanBright} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0.43]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.05, 0.005, 6, 12]} />
        <meshBasicMaterial color={cyanBright} transparent opacity={0.8} />
      </mesh>

      {/* Lower torso / abs */}
      <mesh position={[0, 0.45, 0]} material={armorWire}>
        <cylinderGeometry args={[0.5, 0.4, 0.5, 16]} />
      </mesh>
      {/* Ab plate lines */}
      {[0.55, 0.45, 0.35].map((y, i) => (
        <mesh key={`ab-${i}`} position={[0, y, 0.35]} material={armorEdge}>
          <boxGeometry args={[0.25, 0.008, 0.02]} />
        </mesh>
      ))}
      {/* Center line */}
      <mesh position={[0, 0.45, 0.36]} material={armorEdge}>
        <boxGeometry args={[0.008, 0.35, 0.02]} />
      </mesh>

      {/* Waist / belt */}
      <mesh position={[0, 0.15, 0]} material={armorWire}>
        <cylinderGeometry args={[0.4, 0.42, 0.12, 16]} />
      </mesh>
      <mesh position={[0, 0.15, 0]} material={armorEdge}>
        <cylinderGeometry args={[0.42, 0.44, 0.05, 16]} />
      </mesh>

      {/* ===== SHOULDERS ===== */}
      {/* Shoulder pads - chunky, angular */}
      <mesh position={[-0.55, 1.25, 0]} rotation={[0, 0, 0.3]} material={armorWire}>
        <sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[-0.55, 1.25, 0]} rotation={[0, 0, 0.3]} material={armorSolid}>
        <sphereGeometry args={[0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0.55, 1.25, 0]} rotation={[0, 0, -0.3]} material={armorWire}>
        <sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0.55, 1.25, 0]} rotation={[0, 0, -0.3]} material={armorSolid}>
        <sphereGeometry args={[0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {/* ===== ARMS ===== */}
      {/* Upper arms */}
      <mesh position={[-0.65, 0.85, 0]} rotation={[0, 0, 0.12]} material={armorWire}>
        <cylinderGeometry args={[0.09, 0.12, 0.65, 10]} />
      </mesh>
      <mesh position={[0.65, 0.85, 0]} rotation={[0, 0, -0.12]} material={armorWire}>
        <cylinderGeometry args={[0.09, 0.12, 0.65, 10]} />
      </mesh>
      {/* Elbow joints */}
      <mesh position={[-0.7, 0.5, 0]} material={armorEdge}>
        <sphereGeometry args={[0.08, 8, 6]} />
      </mesh>
      <mesh position={[0.7, 0.5, 0]} material={armorEdge}>
        <sphereGeometry args={[0.08, 8, 6]} />
      </mesh>
      {/* Forearms */}
      <mesh position={[-0.73, 0.15, 0]} rotation={[0, 0, 0.08]} material={armorWire}>
        <cylinderGeometry args={[0.07, 0.1, 0.6, 10]} />
      </mesh>
      <mesh position={[0.73, 0.15, 0]} rotation={[0, 0, -0.08]} material={armorWire}>
        <cylinderGeometry args={[0.07, 0.1, 0.6, 10]} />
      </mesh>
      {/* Forearm armor plates */}
      <mesh position={[-0.73, 0.15, 0.08]} material={armorEdge}>
        <boxGeometry args={[0.08, 0.4, 0.03]} />
      </mesh>
      <mesh position={[0.73, 0.15, 0.08]} material={armorEdge}>
        <boxGeometry args={[0.08, 0.4, 0.03]} />
      </mesh>
      {/* Hands / Gauntlets */}
      <mesh position={[-0.75, -0.2, 0]} material={armorWire}>
        <boxGeometry args={[0.08, 0.15, 0.06]} />
      </mesh>
      <mesh position={[0.75, -0.2, 0]} material={armorWire}>
        <boxGeometry args={[0.08, 0.15, 0.06]} />
      </mesh>
      {/* Repulsor palms */}
      <mesh position={[-0.75, -0.2, 0.04]} material={arcReactorMat}>
        <circleGeometry args={[0.025, 12]} />
      </mesh>
      <mesh position={[0.75, -0.2, 0.04]} material={arcReactorMat}>
        <circleGeometry args={[0.025, 12]} />
      </mesh>

      {/* ===== LEGS ===== */}
      {/* Hip joints */}
      <mesh position={[-0.2, 0.02, 0]} material={armorEdge}>
        <sphereGeometry args={[0.1, 8, 6]} />
      </mesh>
      <mesh position={[0.2, 0.02, 0]} material={armorEdge}>
        <sphereGeometry args={[0.1, 8, 6]} />
      </mesh>
      {/* Upper legs / thighs */}
      <mesh position={[-0.2, -0.45, 0]} material={armorWire}>
        <cylinderGeometry args={[0.1, 0.15, 0.8, 10]} />
      </mesh>
      <mesh position={[0.2, -0.45, 0]} material={armorWire}>
        <cylinderGeometry args={[0.1, 0.15, 0.8, 10]} />
      </mesh>
      {/* Thigh armor plates */}
      <mesh position={[-0.2, -0.45, 0.12]} material={armorEdge}>
        <boxGeometry args={[0.1, 0.5, 0.03]} />
      </mesh>
      <mesh position={[0.2, -0.45, 0.12]} material={armorEdge}>
        <boxGeometry args={[0.1, 0.5, 0.03]} />
      </mesh>
      {/* Knee joints */}
      <mesh position={[-0.2, -0.9, 0]} material={armorEdge}>
        <sphereGeometry args={[0.09, 8, 6]} />
      </mesh>
      <mesh position={[0.2, -0.9, 0]} material={armorEdge}>
        <sphereGeometry args={[0.09, 8, 6]} />
      </mesh>
      {/* Knee guards */}
      <mesh position={[-0.2, -0.9, 0.09]} material={armorWire}>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
      </mesh>
      <mesh position={[0.2, -0.9, 0.09]} material={armorWire}>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
      </mesh>
      {/* Shins */}
      <mesh position={[-0.2, -1.35, 0]} material={armorWire}>
        <cylinderGeometry args={[0.07, 0.1, 0.75, 10]} />
      </mesh>
      <mesh position={[0.2, -1.35, 0]} material={armorWire}>
        <cylinderGeometry args={[0.07, 0.1, 0.75, 10]} />
      </mesh>
      {/* Shin armor plates */}
      <mesh position={[-0.2, -1.35, 0.08]} material={armorEdge}>
        <boxGeometry args={[0.08, 0.5, 0.03]} />
      </mesh>
      <mesh position={[0.2, -1.35, 0.08]} material={armorEdge}>
        <boxGeometry args={[0.08, 0.5, 0.03]} />
      </mesh>
      {/* Boots */}
      <mesh position={[-0.2, -1.8, 0.03]} material={armorWire}>
        <boxGeometry args={[0.12, 0.12, 0.22]} />
      </mesh>
      <mesh position={[0.2, -1.8, 0.03]} material={armorWire}>
        <boxGeometry args={[0.12, 0.12, 0.22]} />
      </mesh>
      {/* Boot thrusters */}
      <mesh position={[-0.2, -1.87, 0]} material={arcReactorMat}>
        <cylinderGeometry args={[0.04, 0.04, 0.01, 8]} />
      </mesh>
      <mesh position={[0.2, -1.87, 0]} material={arcReactorMat}>
        <cylinderGeometry args={[0.04, 0.04, 0.01, 8]} />
      </mesh>

      {/* ===== BACK DETAILS ===== */}
      {/* Back plate */}
      <mesh position={[0, 0.9, -0.35]} material={armorEdge}>
        <boxGeometry args={[0.3, 0.5, 0.03]} />
      </mesh>
      {/* Back thrusters */}
      <mesh position={[-0.12, 0.7, -0.38]} material={armorWire}>
        <cylinderGeometry args={[0.04, 0.06, 0.08, 8]} />
      </mesh>
      <mesh position={[0.12, 0.7, -0.38]} material={armorWire}>
        <cylinderGeometry args={[0.04, 0.06, 0.08, 8]} />
      </mesh>

      {/* ===== SCAN LINE ===== */}
      {scanPhase === "scanning" && (
        <mesh position={[0, scanY, 0]} rotation={[Math.PI / 2, 0, 0]} material={scanLineMat}>
          <planeGeometry args={[3, 3]} />
        </mesh>
      )}

      {/* ===== COMPLETED SCAN MARKERS ===== */}
      {scanPhase === "complete" && [
        { pos: [0, 1.85, 0.35] as [number, number, number], label: "HELMET" },
        { pos: [0, 1.05, 0.5] as [number, number, number], label: "ARC REACTOR" },
        { pos: [-0.75, -0.2, 0.1] as [number, number, number], label: "REPULSOR L" },
        { pos: [0.75, -0.2, 0.1] as [number, number, number], label: "REPULSOR R" },
        { pos: [0, 0.15, 0.45] as [number, number, number], label: "CORE ARMOR" },
        { pos: [-0.2, -1.87, 0.1] as [number, number, number], label: "THRUSTER L" },
        { pos: [0.2, -1.87, 0.1] as [number, number, number], label: "THRUSTER R" },
      ].map((m, i) => (
        <mesh key={i} position={m.pos}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshBasicMaterial color={cyanBright} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// ========== Holographic rings ==========
const HoloRings = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.y += delta * 0.5;
    if (ring2Ref.current) ring2Ref.current.rotation.y -= delta * 0.3;
    if (ring3Ref.current) ring3Ref.current.rotation.x += delta * 0.2;
  });

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color("hsl(195, 100%, 50%)"),
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  }), []);

  return (
    <>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.008, 4, 64]} />
        <primitive object={ringMat} attach="material" />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2.5, 0.3, 0]}>
        <torusGeometry args={[1.8, 0.006, 4, 64]} />
        <primitive object={ringMat} attach="material" />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI / 3, -0.5, 0.2]}>
        <torusGeometry args={[2.0, 0.005, 4, 64]} />
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

  const onScanCompleteStable = useCallback(() => {
    onScanComplete?.();
  }, [onScanComplete]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanPhase("analyzing");
          setTimeout(() => {
            setScanPhase("complete");
            onScanCompleteStable();
          }, 1500);
          return 100;
        }
        return prev + 0.8;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen, onScanCompleteStable]);

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

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-30 flex flex-col animate-slide-in-right"
      style={{
        width: "420px",
        background: "transparent",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 z-10">
        <div>
          <div className="font-orbitron text-[10px] tracking-[0.3em] text-primary/70">ARMOR DIAGNOSTIC</div>
          <div className="font-mono text-[7px] text-primary/40 tracking-wider mt-0.5">
            {scanPhase === "scanning" ? "SCANNING ARMOR INTEGRITY..." : scanPhase === "analyzing" ? "ANALYZING SYSTEMS..." : "DIAGNOSTIC COMPLETE"}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-sm border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
        >
          <X size={12} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-1 z-10">
        <div className="h-[2px] bg-border/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${scanProgress}%`,
              background: "linear-gradient(90deg, hsl(195 100% 50% / 0.3), hsl(195 100% 50% / 0.8))",
              boxShadow: "0 0 8px hsl(195 100% 50% / 0.5)",
            }}
          />
        </div>
        <div className="font-mono text-[7px] text-primary/40 text-right mt-0.5">{Math.round(scanProgress)}%</div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 0.2, 4.5], fov: 45 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[3, 4, 5]} intensity={0.6} color="#00d4ff" />
          <pointLight position={[-3, -2, 3]} intensity={0.3} color="#0088cc" />
          <pointLight position={[0, 0, -4]} intensity={0.15} color="#005588" />
          <IronManArmor scanProgress={scanProgress} scanPhase={scanPhase} />
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

      {/* Vitals / System readout */}
      <div className="px-3 pb-3 z-10">
        <div className="font-orbitron text-[7px] tracking-[0.2em] text-primary/40 mb-1.5">SYSTEM STATUS</div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "ARC REACTOR", value: `${vitals.heartRate}`, unit: "%" },
            { label: "ARMOR TEMP", value: `${vitals.bodyTemp}`, unit: "°C" },
            { label: "POWER", value: vitals.bloodPressure, unit: "kW" },
            { label: "O₂ SUPPLY", value: `${vitals.oxygenSat}`, unit: "%" },
            { label: "COOLANT", value: `${vitals.hydration}`, unit: "%" },
            { label: "THREAT", value: `${vitals.stress}`, unit: "LVL" },
          ].map((v, i) => (
            <div key={i} className="border border-primary/10 rounded-sm p-1.5 bg-card/10 backdrop-blur-sm">
              <div className="font-mono text-[5px] text-primary/35 tracking-wider">{v.label}</div>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-orbitron text-[11px] text-primary/75">{v.value}</span>
                <span className="font-mono text-[5px] text-primary/30">{v.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {scanPhase === "complete" && (
          <div className="mt-2 p-1.5 border border-primary/20 rounded-sm animate-fade-in bg-card/10 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[7px] text-primary/70 tracking-wider">ALL ARMOR SYSTEMS NOMINAL</span>
            </div>
            <div className="font-mono text-[6px] text-primary/35 mt-0.5">
              No structural damage detected. All repulsors charged. Flight systems ready.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyScanPanel;
