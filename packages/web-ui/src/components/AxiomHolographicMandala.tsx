'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Core({ speed = 1 }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.x = t * 0.2 * speed;
      meshRef.current.rotation.y = t * 0.3 * speed;
      
      // Breathing effect
      const scale = 1 + Math.sin(t * 1.5) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Sphere args={[1, 64, 64]} ref={meshRef}>
      <MeshDistortMaterial
        color="#4f46e5"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        emissive="#1e1b4b"
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
}

function OrbitalRing({ radius, speed, color, rotation }: { radius: number, speed: number, color: string, rotation: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z += speed * 0.01;
      ref.current.rotation.x += speed * 0.005;
    }
  });

  return (
    <group ref={ref} rotation={rotation}>
      <mesh>
        <torusGeometry args={[radius, 0.02, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function AxiomHolographicMandala() {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-indigo-900/30 bg-black/60 backdrop-blur-md relative">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-xs font-bold text-indigo-400 tracking-widest">HOLOGRAPHIC CORE</span>
      </div>
      
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="purple" intensity={0.5} />
        
        <Core speed={1} />
        
        <OrbitalRing radius={1.8} speed={1} color="#06b6d4" rotation={[0.5, 0, 0]} />
        <OrbitalRing radius={2.2} speed={-0.8} color="#8b5cf6" rotation={[0, 0.5, 0]} />
        <OrbitalRing radius={2.6} speed={0.5} color="#ec4899" rotation={[0.5, 0.5, 0]} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
