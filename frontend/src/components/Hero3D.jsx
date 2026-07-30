import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

function InteractiveVaultScene({ isUnlocked }) {
  const keyRef = useRef();
  const shackleRef = useRef();
  const [hovered, setHovered] = useState(false);

  const defaultKeyPos = new THREE.Vector3(1.6, 0.4, 0.5);
  const targetKeyPos = useRef(defaultKeyPos.clone());

  const handlePointerOver = () => {
    if (isUnlocked) return;
    setHovered(true);
    const fleeX = 1.8 + (Math.random() - 0.5) * 1.5;
    const fleeY = 0.5 + (Math.random() - 0.5) * 1.5;
    const fleeZ = 0.8 + (Math.random() - 0.5) * 0.8;
    targetKeyPos.current.set(fleeX, fleeY, fleeZ);
  };

  const handlePointerOut = () => {
    if (isUnlocked) return;
    setHovered(false);
    setTimeout(() => {
      targetKeyPos.current.copy(defaultKeyPos);
    }, 600);
  };

  useFrame((_, delta) => {
    if (!keyRef.current || !shackleRef.current) return;

    if (isUnlocked) {
      const exactKeyholePos = new THREE.Vector3(-0.2, -0.4, 0.55);

      // ১. চাবি ধীরে ধীরে ছিদ্রের দিকে এগিয়ে আসবে
      keyRef.current.position.lerp(exactKeyholePos, delta * 2.5);

      // ২. চাবির রোটেশন ধীর গতিতে হবে
      keyRef.current.rotation.x = THREE.MathUtils.lerp(
        keyRef.current.rotation.x,
        Math.PI / 2,
        delta * 2.5,
      );
      keyRef.current.rotation.z = THREE.MathUtils.lerp(
        keyRef.current.rotation.z,
        -Math.PI / 4,
        delta * 2.5,
      );

      // ৩. চাবি ছিদ্রের কাছে পৌঁছানোর পর ঘুরবে
      if (keyRef.current.position.distanceTo(exactKeyholePos) < 0.15) {
        keyRef.current.rotation.y = THREE.MathUtils.lerp(
          keyRef.current.rotation.y,
          Math.PI / 2,
          delta * 2.5,
        );

        // ৪. তালা খোলার গতি আগের মতো ফাস্ট ও ঝটপট করা হলো (delta * 6.5)
        if (Math.abs(keyRef.current.rotation.y - Math.PI / 2) < 0.3) {
          shackleRef.current.position.y = THREE.MathUtils.lerp(
            shackleRef.current.position.y,
            0.95, // সম্পূর্ণ খোলা পজিশন
            delta * 6.5,
          );
        }
      } else {
        keyRef.current.rotation.y = THREE.MathUtils.lerp(
          keyRef.current.rotation.y,
          0,
          delta * 2.5,
        );
      }
    } else {
      // 🔒 LOCKED state - চাবি তার নিজ জায়গায় ভাসবে
      keyRef.current.position.lerp(targetKeyPos.current, delta * 4);

      keyRef.current.rotation.x = THREE.MathUtils.lerp(
        keyRef.current.rotation.x,
        0,
        delta * 4,
      );
      keyRef.current.rotation.y += delta * 0.8;
      keyRef.current.rotation.z += delta * 0.5;

      // তালা বন্ধ হবে
      shackleRef.current.position.y = THREE.MathUtils.lerp(
        shackleRef.current.position.y,
        0.35,
        delta * 6,
      );
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 🔒 ৩ডি তালা */}
      <Float
        speed={isUnlocked ? 0 : 1.5}
        rotationIntensity={isUnlocked ? 0 : 0.3}
        floatIntensity={1}
      >
        <group position={[-0.2, -0.3, 0]}>
          {/* রিং / শ্যাকল */}
          <group ref={shackleRef} position={[0, 0.35, 0]}>
            <mesh position={[0, 0.55, 0]}>
              <torusGeometry args={[0.55, 0.15, 32, 64, Math.PI]} />
              <meshStandardMaterial
                color="#f1f5f9"
                metalness={0.95}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[-0.55, 0.35, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.4, 32]} />
              <meshStandardMaterial
                color="#f1f5f9"
                metalness={0.95}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[0.55, 0.05, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 1.0, 32]} />
              <meshStandardMaterial
                color="#f1f5f9"
                metalness={0.95}
                roughness={0.1}
              />
            </mesh>
          </group>

          {/* তালার ব্রাস বডি */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[1.7, 1.5, 0.7]} />
            <meshStandardMaterial
              color="#eab308"
              metalness={0.9}
              roughness={0.18}
            />
          </mesh>

          {/* চাবির ছিদ্র (Keyhole) */}
          <group position={[0, -0.1, 0.36]}>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
              <meshStandardMaterial color="#020617" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.08, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.1, 0.22, 32]} />
              <meshStandardMaterial color="#020617" roughness={0.9} />
            </mesh>
          </group>
        </group>
      </Float>

      {/* 🔑 চাবি */}
      <group
        ref={keyRef}
        position={[1.6, 0.4, 0.5]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <group scale={0.7} rotation={[0, 0, Math.PI / 4]}>
          <mesh position={[0, 0.7, 0]}>
            <torusGeometry args={[0.22, 0.06, 16, 32]} />
            <meshStandardMaterial
              color={hovered ? "#ef4444" : "#fbbf24"}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
            <meshStandardMaterial
              color={hovered ? "#ef4444" : "#fbbf24"}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0.1, -0.2, 0]}>
            <boxGeometry args={[0.18, 0.08, 0.04]} />
            <meshStandardMaterial
              color={hovered ? "#ef4444" : "#fbbf24"}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0.08, -0.32, 0]}>
            <boxGeometry args={[0.14, 0.08, 0.04]} />
            <meshStandardMaterial
              color={hovered ? "#ef4444" : "#fbbf24"}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function Hero3D({ isUnlocked = false }) {
  return (
    <div className="w-full h-[380px] sm:h-[450px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />

        <InteractiveVaultScene isUnlocked={isUnlocked} />

        <OrbitControls
          enableZoom={false}
          autoRotate={!isUnlocked}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
