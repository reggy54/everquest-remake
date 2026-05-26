import React, { useEffect, useRef, useState } from 'react';
import { PlayerCharacter, Zone } from '../types';

interface Combat2DArenaProps {
  character: PlayerCharacter;
  activeZone: Zone;
  combatMonster: { name: string; level: number; hp: number; maxHp: number; isBoss?: boolean } | null;
  combatParty: { name: string; class: string; hp: number; maxHp: number }[];
  visualTrigger: { id: number; type: 'melee' | 'taunt' | 'fire' | 'heal' | 'ice' | 'buff' | 'monster'; label: string; amount?: number } | null;
}

interface Particle {
  id: string;
  type: 'fire' | 'ice' | 'heal' | 'sparkle' | 'sword' | 'buff';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  angle?: number;
  char?: string;
}

interface TextFloat {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export default function Combat2DArena({
  character,
  activeZone,
  combatMonster,
  combatParty,
  visualTrigger,
}: Combat2DArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [textFloats, setTextFloats] = useState<TextFloat[]>([]);
  const [monsterShake, setMonsterShake] = useState<number>(0);
  const [playerShake, setPlayerShake] = useState<number>(0);

  // References to keep them state-safe inside standard canvas loop
  const particlesRef = useRef<Particle[]>([]);
  const textFloatsRef = useRef<TextFloat[]>([]);

  // Track triggers
  useEffect(() => {
    if (!visualTrigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const pList = [...particlesRef.current];
    const tList = [...textFloatsRef.current];

    const playerX = 140;
    const playerY = 160;
    const monsterX = canvas.width - 150;
    const monsterY = 150;

    const actionType = visualTrigger.type;
    const label = visualTrigger.label;
    const amount = visualTrigger.amount || 0;

    // Trigger specific animations based on type
    if (actionType === 'melee') {
      // Swipe animation & hit flash on monster
      setMonsterShake(12);
      
      // Spawn slashing line sparks
      for (let i = 0; i < 15; i++) {
        pList.push({
          id: Math.random().toString(),
          type: 'sparkle',
          x: monsterX + (Math.random() - 0.5) * 40,
          y: monsterY + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 1,
          maxLife: 20 + Math.floor(Math.random() * 20),
          size: 2 + Math.random() * 3,
          color: '#f59e0b',
        });
      }

      // Add floating text
      tList.push({
        id: Math.random().toString(),
        text: `-${amount} УРОН`,
        x: monsterX,
        y: monsterY - 30,
        vy: -1.5,
        color: '#ef4444',
        size: 18,
        life: 45,
        maxLife: 45,
      });

      // Slash icon particle
      pList.push({
        id: Math.random().toString(),
        type: 'sword',
        x: monsterX,
        y: monsterY,
        vx: 0,
        vy: 0,
        life: 1,
        maxLife: 15,
        size: 40,
        color: '#ffffff',
        angle: Math.random() * Math.PI,
        char: '⚔️',
      });
    } else if (actionType === 'taunt') {
      // Shield glowing bash
      setMonsterShake(6);
      tList.push({
        id: Math.random().toString(),
        text: 'АГГРО 🛡️',
        x: monsterX,
        y: monsterY - 40,
        vy: -1,
        color: '#10b981',
        size: 15,
        life: 45,
        maxLife: 45,
      });

      // Spawn rings of protection
      for (let i = 0; i < 8; i++) {
        pList.push({
          id: Math.random().toString(),
          type: 'buff',
          x: playerX,
          y: playerY,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 1,
          maxLife: 30,
          size: 15,
          color: '#34d399',
          char: '🛡️',
        });
      }
    } else if (actionType === 'fire') {
      // Launch a fireball from player to monster
      tList.push({
        id: Math.random().toString(),
        text: `-${amount} Огонь`,
        x: monsterX,
        y: monsterY - 30,
        vy: -1.7,
        color: '#f97316',
        size: 19,
        life: 50,
        maxLife: 50,
      });

      // Shoot projectile
      const dx = monsterX - playerX;
      const dy = monsterY - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = 25;
      
      for (let s = 0; s < steps; s++) {
        const ratio = s / steps;
        pList.push({
          id: Math.random().toString(),
          type: 'fire',
          x: playerX + dx * ratio + (Math.random() - 0.5) * 15,
          y: playerY + dy * ratio + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -0.5 - Math.random() * 2,
          life: 1,
          maxLife: 30,
          size: 4 + Math.random() * 6,
          color: '#ff4500',
          char: '🔥'
        });
      }
      setMonsterShake(15);
    } else if (actionType === 'ice') {
      // Giant freezing meteor shower
      tList.push({
        id: Math.random().toString(),
        text: `-${amount} Лед ❄️`,
        x: monsterX,
        y: monsterY - 30,
        vy: -1.4,
        color: '#06b6d4',
        size: 19,
        life: 50,
        maxLife: 50,
      });

      // Ice particles coming down
      for (let i = 0; i < 20; i++) {
        pList.push({
          id: Math.random().toString(),
          type: 'ice',
          x: monsterX + (Math.random() - 0.5) * 80,
          y: monsterY - 140 + Math.random() * 50,
          vx: (Math.random() - 0.3) * 2,
          vy: 5 + Math.random() * 4,
          life: 1,
          maxLife: 35,
          size: 8 + Math.random() * 12,
          color: '#a5f3fc',
          char: '❄️'
        });
      }
      setMonsterShake(10);
    } else if (actionType === 'heal') {
      // Green sacred halo
      tList.push({
        id: Math.random().toString(),
        text: `+${amount} Лечение`,
        x: playerX,
        y: playerY - 30,
        vy: -1.2,
        color: '#10b981',
        size: 18,
        life: 45,
        maxLife: 45,
      });

      // Shower of stars rising
      for (let i = 0; i < 15; i++) {
        pList.push({
          id: Math.random().toString(),
          type: 'heal',
          x: playerX + (Math.random() - 0.5) * 50,
          y: playerY + 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -2 - Math.random() * 3,
          life: 1,
          maxLife: 40 + Math.random() * 20,
          size: 6 + Math.random() * 8,
          color: '#34d399',
          char: '✨'
        });
      }
    } else if (actionType === 'buff') {
      // Glowing aura
      tList.push({
        id: Math.random().toString(),
        text: `${label} 🌟`,
        x: playerX,
        y: playerY - 30,
        vy: -1.2,
        color: '#67e8f9',
        size: 15,
        life: 45,
        maxLife: 45,
      });

      // Aura rings rising
      for (let i = 0; i < 12; i++) {
        pList.push({
          id: Math.random().toString(),
          type: 'buff',
          x: playerX + (Math.random() - 0.5) * 40,
          y: playerY + 10,
          vx: (Math.random() - 0.5) * 1,
          vy: -1.5 - Math.random() * 2,
          life: 1,
          maxLife: 40,
          size: 14,
          color: '#06b6d4',
          char: '🌀'
        });
      }
    } else if (actionType === 'monster') {
      // Monster attacks player
      setPlayerShake(12);
      
      tList.push({
        id: Math.random().toString(),
        text: `-${amount} ХП`,
        x: playerX,
        y: playerY - 30,
        vy: -1.5,
        color: '#ef4444',
        size: 18,
        life: 45,
        maxLife: 45,
      });

      // Spikes flying towards player
      const dx = playerX - monsterX;
      const dy = playerY - monsterY;
      for (let idx = 0; idx < 10; idx++) {
        pList.push({
          id: Math.random().toString(),
          type: 'fire',
          x: monsterX + dx * (idx / 10),
          y: monsterY + dy * (idx / 10),
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          maxLife: 20,
          size: 12,
          color: '#991b1b',
          char: '💥',
        });
      }
    }

    particlesRef.current = pList;
    textFloatsRef.current = tList;
  }, [visualTrigger]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Clear background to be completely transparent so CSS background shows
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Decrement shake values
      setMonsterShake((s) => Math.max(0, s - 1));
      setPlayerShake((s) => Math.max(0, s - 1));

      // 1. Draw Monster Silhouette & Name Tag
      if (combatMonster) {
        const mx = canvas.width - 150 + (Math.random() - 0.5) * monsterShake;
        const my = 150 + (Math.random() - 0.5) * monsterShake;
        
        // Draw boss glowing ring
        if (combatMonster.isBoss) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(mx, my + 10, 45, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.3 + Math.sin(Date.now() * 0.008) * 0.2})`;
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();
        }

        // Draw Monster Symbol (Big sized emoji representing monster type)
        ctx.save();
        ctx.font = combatMonster.isBoss ? '80px Arial' : '55px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let mEmoji = '🕷️';
        if (combatMonster.name.includes('Skeleton')) mEmoji = '💀';
        else if (combatMonster.name.includes('Beetle')) mEmoji = '🐜';
        else if (combatMonster.name.includes('Bear') || combatMonster.name.includes('cub')) mEmoji = '🐻';
        else if (combatMonster.name.includes('Wolf')) mEmoji = '🐺';
        else if (combatMonster.name.includes('Gnoll')) mEmoji = '🐕';
        else if (combatMonster.name.includes('Froglok')) mEmoji = '🐸';
        else if (combatMonster.name.includes('Spider')) mEmoji = '🕷️';
        else if (combatMonster.name.includes('Lord') || combatMonster.isBoss) mEmoji = '🐲';

        // Monster breathing wave
        const bob = Math.sin(Date.now() * 0.005) * 5;
        ctx.fillText(mEmoji, mx, my + bob);
        ctx.restore();

        // Monster HP Bar & Info
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${combatMonster.name} (Lvl ${combatMonster.level})`, mx, my - 50);

        // Health bar background
        const barW = 100;
        const barH = 6;
        const bx = mx - barW / 2;
        const by = my - 40;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx, by, barW, barH);

        // Active health fill
        const hpRatio = combatMonster.hp / combatMonster.maxHp;
        ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillRect(bx, by, barW * Math.max(0, hpRatio), barH);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(bx, by, barW, barH);
        ctx.restore();
      }

      // 2. Draw Player & Companions
      const px = 140 + (Math.random() - 0.5) * playerShake;
      const py = 160 + (Math.random() - 0.5) * playerShake;

      // Draw Companions (Combat Party)
      combatParty.forEach((member, index) => {
        // Position companions behind/above the player
        const cx = px - 55;
        const cy = py - 60 + index * 55;

        if (member.hp > 0) {
          ctx.save();
          // Animated float
          const cbob = Math.sin(Date.now() * 0.003 + index) * 3;
          
          // Outer circle background
          ctx.beginPath();
          ctx.arc(cx, cy + cbob, 18, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Companion Emoji symbol depending on class
          let cEmoji = '🛡️';
          if (member.class === 'Cleric') cEmoji = '✝️';
          else if (member.class === 'Wizard') cEmoji = '🔮';
          else if (member.class === 'Enchanter') cEmoji = '🪄';
          else if (member.class === 'Bard') cEmoji = '🎵';
          else if (member.class === 'Monk') cEmoji = '👊';

          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cEmoji, cx, cy + cbob);

          // Name and HP tiny bar
          ctx.font = '9px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(member.name, cx, cy - 23 + cbob);

          // Tiny hp
          const chpRatio = member.hp / member.maxHp;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(cx - 15, cy - 18 + cbob, 30, 3);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(cx - 15, cy - 18 + cbob, 30 * Math.max(0, chpRatio), 3);
          ctx.restore();
        } else {
          // Dead companion marker
          ctx.save();
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('💀', cx, cy);
          ctx.font = '8px monospace';
          ctx.fillStyle = '#ef4444';
          ctx.fillText(`${member.name} пал`, cx, cy - 15);
          ctx.restore();
        }
      });

      // Draw Main Player Character
      ctx.save();
      const pbob = Math.sin(Date.now() * 0.006) * 4;

      // Glowing selection ring
      ctx.beginPath();
      ctx.arc(px, py + pbob + 10, 26, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Draw character class shield/medallion
      ctx.beginPath();
      ctx.arc(px, py + pbob, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Class symbol emoji
      let pEmoji = '🛡️';
      if (character.class === 'Wizard' || character.class === 'Magician') pEmoji = '🧙‍♂️';
      else if (character.class === 'Cleric') pEmoji = '⛪';
      else if (character.class === 'Paladin') pEmoji = '🌟';
      else if (character.class === 'Ranger') pEmoji = '🏹';
      else if (character.class === 'Druid') pEmoji = '🌿';
      else if (character.class === 'Monk') cEmoji: pEmoji = '👊';
      else if (character.class === 'Bard') pEmoji = '🎻';
      else if (character.class === 'Necromancer') pEmoji = '💀';
      else if (character.class === 'Rogue') pEmoji = '🥷';

      ctx.font = '22px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pEmoji, px, py + pbob);

      // Label and HP indicator
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText(`${character.name} (Вы)`, px, py - 40 + pbob);

      // HP bar
      const pBarW = 70;
      const pBarH = 5;
      const pbx = px - pBarW / 2;
      const pby = py - 30 + pbob;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(pbx, pby, pBarW, pBarH);
      
      const pRatio = character.hp / character.maxHp;
      ctx.fillStyle = pRatio > 0.5 ? '#22c55e' : pRatio > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(pbx, pby, pBarW * Math.max(0, pRatio), pBarH);
      ctx.restore();

      // 3. Update & Draw Particles
      let pList = [...particlesRef.current];
      pList = pList.map((p) => {
        return {
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life + 1,
        };
      }).filter((p) => {
        return p.life < p.maxLife;
      });

      pList.forEach((p) => {
        ctx.save();
        const alpha = 1 - (p.life / p.maxLife);
        ctx.globalAlpha = alpha;

        if (p.char) {
          ctx.font = `${p.size}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.char, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
        ctx.restore();
      });
      particlesRef.current = pList;

      // 4. Update & Draw Floating Text
      let tList = [...textFloatsRef.current];
      tList = tList.map((t) => {
        return {
          ...t,
          y: t.y + t.vy,
          life: t.life - 1,
        };
      }).filter((t) => t.life > 0);

      tList.forEach((t) => {
        ctx.save();
        const alpha = t.life / t.maxLife;
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${t.size}px monospace`;
        ctx.fillStyle = t.color;
        
        // Dark outline for contrast
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });
      textFloatsRef.current = tList;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeZone.id, combatMonster, combatParty, character]);

  // Helper background painter removed to let CSS background show through

  return (
    <div 
      className="border border-slate-700/80 rounded-xl overflow-hidden relative shadow-2xl transition-all duration-700 group"
      style={{ 
        backgroundImage: `url('${activeZone.imageUrl || ''}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-slate-950/70 group-hover:bg-slate-950/50 transition-colors duration-500"></div>
      <canvas
        ref={canvasRef}
        width={540}
        height={260}
        className="block w-full h-[260px] rounded-lg relative z-10 mix-blend-screen"
      />
      <div className="absolute top-2 right-2 z-20 bg-slate-900/80 border border-amber-900/60 rounded px-2 py-0.5 text-[9px] text-amber-500 font-mono select-none drop-shadow-lg backdrop-blur flex items-center gap-1.5 uppercase font-bold tracking-widest">
        <span>Arena Active</span>
      </div>
    </div>
  );
}
