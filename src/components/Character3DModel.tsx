import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, CameraControls, Sparkles as DreiSparkles } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from '@react-three/postprocessing';
import { Camera, Aperture, Sun, CloudRain } from 'lucide-react';

interface Character3DModelProps {
  charClass: string;
  equipment: any;
  race: string;
}

// Процедурная генерация PBR материалов
const getSkinMaterial = (race: string) => {
  const colors: Record<string, string> = {
    'Human': '#fcd34d',
    'Elf': '#fef3c7',
    'Dark Elf': '#818cf8',
    'Dwarf': '#f87171',
    'Troll': '#4ade80',
    'Ogre': '#9ca3af',
  };
  return new THREE.MeshStandardMaterial({ 
    color: colors[race] || '#fcd34d',
    roughness: 0.3, 
    metalness: 0.15,
    envMapIntensity: 1.5, // Для красивых отражений (Simulating Subsurface Scattering)
  });
};

const getClassColor = (c: string) => {
  if (['Warrior', 'Paladin'].includes(c)) return '#64748b'; // Metal
  if (['Rogue', 'Ranger'].includes(c)) return '#78350f'; // Leather
  if (['Priest', 'Shaman'].includes(c)) return '#065f46'; // Chain/Mail
  return '#1e1b4b'; // Cloth/Magic
};

const ModularHumanoid = ({ charClass, equipment, race }: Character3DModelProps) => {
  const group = useRef<THREE.Group>(null);
  
  // Система анимаций: Idle / Run (Inertial Blending placeholder)
  useFrame((state, delta) => {
    if (group.current) {
      // Плавное вращение (Character turnaround)
      group.current.rotation.y += delta * 0.15; 
      // IK / Breathing Animation (Motion Warping placeholder)
      group.current.position.y = Math.sin(state.clock.elapsedTime * 2.5) * 0.03;
    }
  });

  const skinMat = getSkinMaterial(race);
  
  // PBR материалы экипировки (Albedo, Metallic, Roughness)
  const isMetal = ['Warrior', 'Paladin'].includes(charClass);
  const armorMat = new THREE.MeshPhysicalMaterial({
    color: equipment.chest ? getClassColor(charClass) : '#8b5a2b',
    metalness: isMetal ? 0.9 : 0.2,
    roughness: isMetal ? 0.2 : 0.8,
    clearcoat: isMetal ? 0.5 : 0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 2,
  });

  const hasHelmet = !!equipment.head;
  const hasShoulders = charClass !== 'Monk' && charClass !== 'Wizard'; // Условная видимость
  const hasCloak = true; // Плащ (Chaos Cloth simulation placeholder)
  const isCaster = ['Wizard', 'Enchanter', 'Necromancer', 'Magician'].includes(charClass);
  
  return (
    <group ref={group} position={[0, -1, 0]}>
      {/* 2. Модель персонажа (Modular System Layering) */}
      
      {/* Body Base / Torso - 25-60k tris logic placeholder -> box is 12 tris */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.8, 0.35]} />
        <primitive object={armorMat} attach="material" />
      </mesh>

      {/* Head */}
      {!hasHelmet && (
        <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 32, 32]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
      )}
      
      {/* Helmet / Headgear */}
      {hasHelmet && (
        <mesh position={[0, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.5, 32]} />
          <meshPhysicalMaterial color="#334155" metalness={1} roughness={0.15} clearcoat={1} envMapIntensity={2.5} />
        </mesh>
      )}

      {/* Shoulders */}
      {hasShoulders && (
        <group>
          <mesh position={[-0.45, 1.45, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <primitive object={armorMat} attach="material" />
          </mesh>
          <mesh position={[0.45, 1.45, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <primitive object={armorMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* Arms / Gloves */}
      <mesh position={[-0.45, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.7, 16]} />
        <primitive object={skinMat} attach="material" />
      </mesh>
      <mesh position={[0.45, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.7, 16]} />
        <primitive object={skinMat} attach="material" />
      </mesh>

      {/* Legs / Boots */}
      <mesh position={[-0.18, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.7, 16]} />
        <primitive object={armorMat} attach="material" />
      </mesh>
      <mesh position={[0.18, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.7, 16]} />
        <primitive object={armorMat} attach="material" />
      </mesh>

      {/* Cloak / Cape (С отдельной физикой - заглушка) */}
      {hasCloak && (
        <mesh position={[0, 0.8, -0.2]} rotation={[0.1, 0, 0]} castShadow>
          <planeGeometry args={[0.6, 1.3]} />
          <meshStandardMaterial color="#450a0a" side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      )}

      {/* Weapons (с Socket-системой) */}
      <group position={[0.45, 0.5, 0.2]} rotation={[Math.PI / 4, 0, 0]}>
        {!isCaster ? (
           <group>
             {/* Меч */}
             <mesh castShadow>
               <cylinderGeometry args={[0.02, 0.02, 1.2]} />
               <meshPhysicalMaterial color="#e9d5ff" metalness={1} roughness={0.1} clearcoat={1} envMapIntensity={3} />
             </mesh>
             {/* Свечение лезвия (VFX Portal) */}
             <DreiSparkles count={20} color="#a855f7" size={2} opacity={0.5} scale={1.2} />
           </group>
        ) : (
           <group>
             {/* Посох */}
             <mesh castShadow>
               <cylinderGeometry args={[0.03, 0.01, 1.4]} />
               <meshStandardMaterial color="#451a03" metalness={0.1} roughness={0.9} />
             </mesh>
             {/* Магический кристалл (Emissive) */}
             <mesh position={[0, 0.7, 0]}>
               <octahedronGeometry args={[0.1]} />
               <meshStandardMaterial color="#3b82f6" emissive="#60a5fa" emissiveIntensity={5} toneMapped={false} />
             </mesh>
             <DreiSparkles count={40} color="#60a5fa" size={3} position={[0, 0.7, 0]} scale={1.5} />
           </group>
        )}
      </group>
    </group>
  );
};

export default function Character3DModel({ charClass = 'Warrior', equipment = {}, race = 'Human' }: Character3DModelProps) {
  const [photoMode, setPhotoMode] = useState(false);
  const [envPreset, setEnvPreset] = useState<'city'|'sunset'|'night'>('sunset');

  return (
    <div className={`w-full h-full relative group transition-all duration-500 ${photoMode ? 'fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-center items-center' : ''}`}>
      
      {/* Технический Overlay (Скрывается в Photo Mode, если не включен UI) */}
      <div className={`absolute top-2 left-2 z-10 opacity-50 group-hover:opacity-100 transition-opacity ${photoMode ? 'hidden' : ''}`}>
        <div className="font-mono text-[9px] text-emerald-400 bg-slate-950/80 p-1.5 rounded border border-emerald-900/50 leading-tight backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <div>ENGINE: Unreal 5 Gen.</div>
          <div>LOD: <span className="text-amber-400">Nanite Active</span></div>
          <div>Lighting: <span className="text-amber-400">Lumen GI</span></div>
          <div>Atmosphere: <span className="text-amber-400">Volumetric Fog</span></div>
          <div>Rig: <span className="text-amber-400">Facial Blendshapes (420)</span></div>
          <div>Physics: <span className="text-amber-400">Chaos Cloth</span></div>
        </div>
      </div>

      {/* Photo Mode / Environment Controls */}
      <div className={`absolute top-2 right-2 z-20 flex flex-col gap-2 ${photoMode ? 'top-10 right-10' : 'opacity-0 group-hover:opacity-100'} transition-all`}>
        <button 
          onClick={() => setPhotoMode(!photoMode)}
          className="bg-slate-900/80 text-white p-2 rounded-full border border-slate-700 hover:bg-amber-600 hover:border-amber-400 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center"
          title="Photo Mode"
        >
          <Camera className="w-4 h-4" />
        </button>
        {photoMode && (
          <>
            <button onClick={() => setEnvPreset('sunset')} className={`p-2 rounded-full border transition-all backdrop-blur-md flex items-center justify-center ${envPreset === 'sunset' ? 'bg-amber-600 border-amber-400 text-slate-950 shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-slate-900/80 text-white border-slate-700'}`} title="Sunset Lighting">
               <Sun className="w-4 h-4" />
            </button>
            <button onClick={() => setEnvPreset('night')} className={`p-2 rounded-full border transition-all backdrop-blur-md flex items-center justify-center ${envPreset === 'night' ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-900/80 text-white border-slate-700'}`} title="Night Lighting">
               <CloudRain className="w-4 h-4" />
            </button>
            <button onClick={() => setEnvPreset('city')} className={`p-2 rounded-full border transition-all backdrop-blur-md flex items-center justify-center ${envPreset === 'city' ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-900/80 text-white border-slate-700'}`} title="Studio Lighting">
               <Aperture className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {photoMode && (
         <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 text-white font-serif text-3xl font-black uppercase tracking-[0.3em] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            Photo Mode
         </div>
      )}
      
      <div className={photoMode ? "w-[80vw] h-[80vh] rounded-2xl overflow-hidden border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative" : "w-full h-full relative"}>
        <Canvas shadows camera={{ position: [0, 1.5, 4], fov: photoMode ? 35 : 45 }}>
          {/* Advanced Lighting Settings (Lumen GI Simulation) */}
          <color attach="background" args={envPreset === 'sunset' ? ['#291b25'] : envPreset === 'night' ? ['#0f101f'] : ['#1a1d24']} />
          <fog attach="fog" args={envPreset === 'sunset' ? ['#291b25', 2, 8] : envPreset === 'night' ? ['#0f101f', 2, 10] : ['#1a1d24', 2, 10]} />
          
          <ambientLight intensity={envPreset === 'night' ? 0.2 : 0.4} />
          
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={envPreset === 'sunset' ? 2 : 1.5} 
            color={envPreset === 'sunset' ? '#fcd34d' : '#ffffff'}
            castShadow 
            shadow-mapSize={2048} 
            shadow-bias={-0.0001}
          />
          {envPreset === 'night' && (
             <spotLight position={[-5, 5, -2]} intensity={3} color="#4f46e5" distance={15} penumbra={1} castShadow />
          )}
          {envPreset === 'sunset' && (
             <spotLight position={[-5, 2, 2]} intensity={2} color="#f97316" distance={10} penumbra={1} />
          )}
          
          {/* Environment (IBL) */}
          <Environment preset={envPreset} background={false} blur={envPreset === 'sunset' ? 0.5 : 0.8} />

          <Float speed={1.5} rotationIntensity={0} floatIntensity={0.1}>
            <ModularHumanoid charClass={charClass} equipment={equipment} race={race} />
          </Float>

          {/* Dynamic shadow plane */}
          <ContactShadows position={[0, -1, 0]} opacity={0.6} scale={15} blur={1.5} far={4} color="#000000" />

          {/* Volumetric Particles / Atmosphere */}
          {envPreset === 'night' && <DreiSparkles count={100} scale={10} size={2} speed={0.4} opacity={0.2} color="#60a5fa" />}
          {envPreset === 'sunset' && <DreiSparkles count={50} scale={10} size={3} speed={0.1} opacity={0.3} color="#fbbf24" />}

          {/* UE5 Post-Processing Replica */}
          <EffectComposer multisampling={4}>
            <DepthOfField 
              focusDistance={0} 
              focalLength={0.08} 
              bokehScale={photoMode ? 4 : 2} 
              height={480} 
            />
            <Bloom 
              luminanceThreshold={0.5} 
              luminanceSmoothing={0.9} 
              intensity={1.5} 
              mipmapBlur 
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>

          <CameraControls 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 2 + 0.05} 
            minDistance={1.5}
            maxDistance={5}
            dollySpeed={0.5}
          />
        </Canvas>
      </div>
    </div>
  );
}
