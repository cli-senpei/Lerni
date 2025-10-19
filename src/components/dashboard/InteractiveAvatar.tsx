import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Box } from "@react-three/drei";
import * as THREE from "three";

const Avatar3D = () => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group 
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Head */}
      <Sphere args={[1, 32, 32]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color={hovered ? "#9b87f5" : "#7E69AB"} />
      </Sphere>
      
      {/* Body */}
      <Box args={[1.2, 1.5, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color={hovered ? "#D946EF" : "#E01A4F"} />
      </Box>
      
      {/* Left Eye */}
      <Sphere args={[0.1, 16, 16]} position={[-0.3, 1.6, 0.9]}>
        <meshStandardMaterial color="#ffffff" />
      </Sphere>
      
      {/* Right Eye */}
      <Sphere args={[0.1, 16, 16]} position={[0.3, 1.6, 0.9]}>
        <meshStandardMaterial color="#ffffff" />
      </Sphere>
      
      {/* Smile */}
      <Box args={[0.6, 0.1, 0.1]} position={[0, 1.3, 0.95]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
    </group>
  );
};

const InteractiveAvatar = () => {
  return (
    <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <Avatar3D />
        <OrbitControls 
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          enablePan={false}
        />
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-muted-foreground bg-background/80 px-4 py-2 rounded-full">
        Click and drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

export default InteractiveAvatar;
