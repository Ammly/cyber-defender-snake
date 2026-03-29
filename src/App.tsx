import { useState, useEffect, useCallback, useRef } from 'react';
import * as Icons from 'lucide-react';
import { 
  ChevronRight,
  Activity,
  Bell,
  Settings,
  Shield,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import lessonsData from './lessons.json';

const GRID_SIZE = 40;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

type NodeType = 'defense' | 'threat';

interface Lesson {
  id: string;
  category: string;
  threat: {
    name: string;
    iconId: string;
    description: string;
    color: string;
    bg: string;
  };
  defense: {
    name: string;
    iconId: string;
    description: string;
    color: string;
    bg: string;
  };
}

interface GameNode {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  lessonId: string;
}

interface DataPacket {
  id: string;
  x: number;
  y: number;
}

const LESSONS = lessonsData as Lesson[];

const IconComponent = ({ name, ...props }: { name: string } & any) => {
  const Icon = (Icons as any)[name] || Icons.HelpCircle;
  return <Icon {...props} />;
};

interface TelemetryData {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'success' | 'danger' | 'info';
}

const TelemetryItem = ({ time, title, description, type }: Omit<TelemetryData, 'id'> & { key?: string }) => {
  const colors = {
    success: 'text-safaricom-green',
    danger: 'text-safaricom-red',
    info: 'text-slate-900'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 bg-white border border-slate-100 rounded-lg flex gap-3 hover:border-opacity-100 transition-colors group"
    >
      <div className="text-[9px] font-mono text-slate-400 mt-0.5">{time}</div>
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-tight ${colors[type]}`}>{title}</p>
        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{description}</p>
      </div>
    </motion.div>
  );
};

const LessonPopup = ({ lesson, type, onClose }: { lesson: Lesson, type: NodeType, onClose: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(20);
  const [maxTime, setMaxTime] = useState(20);

  useEffect(() => {
    if (timeLeft <= 0) {
      onClose();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const addTime = () => {
    const newTime = timeLeft + 10;
    setTimeLeft(newTime);
    if (newTime > maxTime) {
      setMaxTime(newTime);
    }
  };

  const activeData = type === 'threat' ? lesson.threat : lesson.defense;

  const progress = (timeLeft / maxTime) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="h-1.5 w-full bg-slate-100">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "linear" }}
            className={`h-full ${type === 'threat' ? 'bg-safaricom-red' : 'bg-safaricom-green'}`}
          />
        </div>
        <div className="p-5 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${type === 'threat' ? 'bg-safaricom-red/10 text-safaricom-red' : 'bg-safaricom-green/10 text-safaricom-green'}`}>
                <IconComponent name={activeData.iconId} className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lesson.category}</p>
                <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">{activeData.name}</h2>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RESUME IN</span>
              <span className={`text-xl font-mono font-bold ${timeLeft < 5 ? 'text-safaricom-red animate-pulse' : 'text-slate-900'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="w-1 bg-safaricom-red rounded-full shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <IconComponent name={lesson.threat.iconId} className="w-3 h-3 text-safaricom-red" />
                  <p className="text-[10px] font-bold text-safaricom-red uppercase tracking-wider">Threat: {lesson.threat.name}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{lesson.threat.description}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-1 bg-safaricom-green rounded-full shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <IconComponent name={lesson.defense.iconId} className="w-3 h-3 text-safaricom-green" />
                  <p className="text-[10px] font-bold text-safaricom-green uppercase tracking-wider">Defense: {lesson.defense.name}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{lesson.defense.description}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={addTime}
              className="flex-1 py-3 rounded-xl font-bold uppercase tracking-wide text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
            >
              +10s
            </button>
            <button 
              onClick={onClose}
              className={`flex-[2.5] py-3 rounded-xl font-bold uppercase tracking-wide text-white transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                type === 'threat' 
                  ? 'bg-safaricom-red hover:bg-safaricom-red/90 shadow-safaricom-red/20' 
                  : 'bg-safaricom-green hover:bg-safaricom-green/90 shadow-safaricom-green/20'
              }`}
            >
              <span className="text-[11px]">Continue (+1000 pts)</span>
              <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/20 border border-white/30 text-[8px] shrink-0">
                <Icons.Keyboard className="w-3 h-3" />
                <span>SPACE</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DPad = ({ onDir }: { onDir: (d: { x: number; y: number }) => void }) => {
  const btnBase = "flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl text-base font-bold text-slate-700 active:bg-slate-100 shadow-md select-none";
  const press = (d: { x: number; y: number }) => (e: { preventDefault(): void }) => { e.preventDefault(); onDir(d); };
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1.5" style={{ width: 154, height: 154 }}>
      <button className={`${btnBase} col-start-2 row-start-1`} onPointerDown={press({ x: 0, y: -1 })}>↑</button>
      <button className={`${btnBase} col-start-1 row-start-2`} onPointerDown={press({ x: -1, y: 0 })}>←</button>
      <button className={`${btnBase} col-start-3 row-start-2`} onPointerDown={press({ x: 1, y: 0 })}>→</button>
      <button className={`${btnBase} col-start-2 row-start-3`} onPointerDown={press({ x: 0, y: 1 })}>↓</button>
    </div>
  );
};

export default function App() {
  const [score, setScore] = useState(0);
  const [scoreLog, setScoreLog] = useState<{ id: string, amount: number, reason: string, type: 'success' | 'danger' | 'info' }[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([
    { id: 'init-1', time: '14:20:01', title: 'Node Secured', description: 'Input Sanitization layer active on Port 8080.', type: 'success' },
    { id: 'init-2', time: '14:19:55', title: 'Threat Detected', description: 'Unauthorized prompt injection in LLM gateway.', type: 'danger' },
  ]);

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [nodes, setNodes] = useState<GameNode[]>([
    { id: 'node-1', x: 15, y: 8, type: 'threat', lessonId: LESSONS[0].id },
    { id: 'node-2', x: 12, y: 15, type: 'defense', lessonId: LESSONS[1].id },
  ]);
  const [dataPackets, setDataPackets] = useState<DataPacket[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<{ lesson: Lesson, type: NodeType } | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD' | 'EXPERT'>('NORMAL');
  const [gridWidth, setGridWidth] = useState(25);
  const [gridHeight, setGridHeight] = useState(20);
  const [stats, setStats] = useState({ threats: 0, defenses: 0, packets: 0 });
  
  const gameLoopRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(0);
  const directionRef = useRef(direction);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setGridWidth(Math.floor(width / GRID_SIZE) - 1);
        setGridHeight(Math.floor(height / GRID_SIZE) - 1);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const addScore = useCallback((amount: number, reason: string, type: 'success' | 'danger' | 'info') => {
    setScore(s => s + amount);
    setScoreLog(prev => [{ id: Math.random().toString(36).substr(2, 9), amount, reason, type }, ...prev].slice(0, 5));
  }, []);

  const addTelemetry = useCallback((title: string, description: string, type: 'success' | 'danger' | 'info') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setTelemetry(prev => [{ id, time: timeStr, title, description, type }, ...prev].slice(0, 50));
  }, []);

  const spawnNode = useCallback((type?: NodeType): GameNode => {
    const x = Math.floor(Math.random() * gridWidth);
    const y = Math.floor(Math.random() * gridHeight);
    const nodeType = type || (Math.random() > 0.5 ? 'defense' : 'threat');
    const randomLesson = LESSONS[Math.floor(Math.random() * LESSONS.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      type: nodeType,
      lessonId: randomLesson.id
    };
  }, [gridWidth, gridHeight]);

  const spawnDataPacket = useCallback((): DataPacket => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    };
  }, [gridWidth, gridHeight]);

  // Initial spawn of data packets
  useEffect(() => {
    if (gridWidth > 0 && gridHeight > 0 && dataPackets.length === 0) {
      setDataPackets([spawnDataPacket(), spawnDataPacket(), spawnDataPacket()]);
    }
  }, [gridWidth, gridHeight, spawnDataPacket]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      // Wrap around logic
      if (newHead.x < 0) newHead.x = gridWidth;
      if (newHead.x > gridWidth) newHead.x = 0;
      if (newHead.y < 0) newHead.y = gridHeight;
      if (newHead.y > gridHeight) newHead.y = 0;

      const newSnake = [newHead, ...prevSnake];

      // Check node collision
      const hitNodeIndex = nodes.findIndex(node => node.x === newHead.x && node.y === newHead.y);
      const hitPacketIndex = dataPackets.findIndex(p => p.x === newHead.x && p.y === newHead.y);
      
      let shouldGrow = false;

      if (hitNodeIndex !== -1) {
        const hitNode = nodes[hitNodeIndex];
        const lesson = LESSONS.find(l => l.id === hitNode.lessonId) || LESSONS[0];
        
        // Trigger Lesson
        setCurrentLesson({ lesson, type: hitNode.type });
        setIsPaused(true);
        shouldGrow = true;

        if (hitNode.type === 'defense') {
          addScore(500, 'Defense Node Secured', 'success');
          addTelemetry('Lesson Learned', `Secured: ${lesson.defense.name}`, 'success');
          setStats(s => ({ ...s, defenses: s.defenses + 1 }));
        } else {
          addScore(250, 'Threat Neutralized', 'danger');
          addTelemetry('Threat Neutralized', `Blocked: ${lesson.threat.name}`, 'danger');
          setStats(s => ({ ...s, threats: s.threats + 1 }));
        }
        
        // Remove hit node and spawn new one
        const newNodes = [...nodes];
        newNodes.splice(hitNodeIndex, 1);
        newNodes.push(spawnNode());
        setNodes(newNodes);
      } else if (hitPacketIndex !== -1) {
        addScore(1, 'Data Packet Collected', 'info');
        shouldGrow = true;
        setStats(s => ({ ...s, packets: s.packets + 1 }));
        
        // Remove hit packet and spawn new one
        const newDataPackets = [...dataPackets];
        newDataPackets.splice(hitPacketIndex, 1);
        newDataPackets.push(spawnDataPacket());
        setDataPackets(newDataPackets);
      }

      if (!shouldGrow) {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [nodes, dataPackets, gameOver, isPaused, addTelemetry, spawnNode, spawnDataPacket, gridWidth, gridHeight]);

  const handleLessonComplete = useCallback(() => {
    addScore(1000, 'Lesson Completed', 'info');
    setIsPaused(false);
    setCurrentLesson(null);
  }, [addScore]);

  const handleDirection = useCallback((d: { x: number; y: number }) => {
    if (d.x !== 0 && directionRef.current.x === 0) {
      setDirection(d);
      directionRef.current = d;
    } else if (d.y !== 0 && directionRef.current.y === 0) {
      setDirection(d);
      directionRef.current = d;
    }
  }, []);

  const handleTouchStart = useCallback((e: { touches: TouchList }) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: { changedTouches: TouchList }) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      handleDirection({ x: dx > 0 ? 1 : -1, y: 0 });
    } else {
      handleDirection({ x: 0, y: dy > 0 ? 1 : -1 });
    }
    touchStartRef.current = null;
  }, [handleDirection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          handleDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          handleDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          handleDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          handleDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirection]);

  useEffect(() => {
    const difficultySpeeds = {
      EASY: 250,
      NORMAL: 150,
      HARD: 100,
      EXPERT: 60
    };

    const tick = (time: number) => {
      if (time - lastMoveTimeRef.current > difficultySpeeds[difficulty]) {
        moveSnake();
        lastMoveTimeRef.current = time;
      }
      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [moveSnake, difficulty]);

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans selection:bg-safaricom-green/20">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-slate-100 h-14 flex justify-between items-center px-4 md:px-6">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-safaricom-green tracking-tight">CyberDefender</span>
            <span className="hidden md:inline text-[10px] font-mono text-slate-400 mt-1">[v1.0.4]</span>
          </div>
          <div className="hidden md:block h-4 w-[1px] bg-slate-200"></div>
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-safaricom-green/10 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-safaricom-green animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-safaricom-green">Connection: Stable</span>
          </div>
        </div>

        {/* Mobile score */}
        <div className="flex md:hidden items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SCORE</span>
          <span className="text-sm font-mono font-bold text-safaricom-green">{score.toLocaleString()}</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Security Posture</span>
            <span className="text-[11px] font-mono font-bold text-safaricom-green">99.98% EFFECTIVE</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-100"></div>
          <div className="flex items-center gap-4">
            <Activity className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
            <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
            <Settings className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer">
              <img
                alt="User profile"
                src="https://picsum.photos/seed/cyber/100/100"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-14">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex md:flex-col w-60 bg-white h-full py-6 border-r border-slate-100">
          <div className="px-6 mb-8">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Operator Console</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Level 4 Clearance</p>
          </div>
          <nav className="flex-1 px-4 space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Difficulty Level</p>
              <div className="space-y-1">
                {(['EASY', 'NORMAL', 'HARD', 'EXPERT'] as const).map((level) => (
                  <div 
                    key={level} 
                    onClick={() => setDifficulty(level)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                      difficulty === level 
                        ? 'bg-safaricom-green/5 border-safaricom-green/20 text-safaricom-green shadow-sm' 
                        : 'text-slate-500 border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        difficulty === level ? 'bg-safaricom-green animate-pulse' : 'bg-slate-300'
                      }`}></div>
                      <span className="text-[11px] font-bold uppercase tracking-wider">{level}</span>
                    </div>
                    {difficulty === level && <ChevronRight className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Score Accumulation</p>
              <div className="space-y-2 px-2">
                {scoreLog.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No recent activity...</p>
                ) : (
                  scoreLog.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[10px] font-medium text-slate-600">{log.reason}</span>
                      <span className={`text-[10px] font-bold ${
                        log.type === 'success' ? 'text-safaricom-green' : 
                        log.type === 'danger' ? 'text-safaricom-red' : 'text-blue-600'
                      }`}>+{log.amount}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </nav>
          <div className="px-6 mt-auto">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Controls</p>
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-bold">↑</div>
                <div className="w-6 h-6 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-bold">↓</div>
                <div className="w-6 h-6 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-bold">←</div>
                <div className="w-6 h-6 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-bold">→</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Gameplay Canvas */}
        <main
          className="flex-1 relative overflow-hidden grid-background touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Coordinate Markers */}
          <div className="absolute top-4 left-4 font-mono text-[9px] text-slate-400">[LAT: 029ms]</div>
          <div className="absolute top-4 right-4 font-mono text-[9px] text-slate-400">[SESSION: 00:00:16]</div>
          <div className="absolute bottom-4 left-4 font-mono text-[9px] text-slate-400">
            [X: {(snake[0].x * GRID_SIZE).toFixed(2)}, Y: {(snake[0].y * GRID_SIZE).toFixed(2)}]
          </div>
          <div className="absolute bottom-4 right-4 font-mono text-[9px] text-slate-400">[ZONE: SECTOR_7G]</div>

          {/* Decorative Radial */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full sentinel-ring pointer-events-none"></div>

          <div className="absolute inset-0 p-2 md:p-12">
            <div className="relative w-full h-full" ref={containerRef}>
              
              {/* The Data Stream (Snake) */}
              {snake.map((segment, i) => (
                <motion.div 
                  key={i}
                  initial={false}
                  animate={{ 
                    left: segment.x * GRID_SIZE,
                    top: segment.y * GRID_SIZE,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`absolute w-5 h-5 rounded-sm z-20 ${i === 0 ? 'bg-safaricom-green shadow-[0_0_20px_#46B525]' : 'bg-safaricom-green/60'}`}
                >
                  {i === 0 && (
                    <div className="flex gap-0.5 items-center justify-center h-full">
                      <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                      <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Active Nodes */}
              <AnimatePresence>
                {nodes.map((node) => {
                  const lesson = LESSONS.find(l => l.id === node.lessonId) || LESSONS[0];
                  const nodeData = node.type === 'threat' ? lesson.threat : lesson.defense;
                  
                  return (
                    <motion.div 
                      key={node.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      style={{ 
                        left: node.x * GRID_SIZE,
                        top: node.y * GRID_SIZE,
                      }}
                      className="absolute group z-10"
                    >
                      <div className="relative -translate-x-1/2 -translate-y-1/2">
                        {node.type === 'threat' ? (
                          <>
                            <div className="absolute inset-0 bg-safaricom-red/10 blur-xl rounded-full scale-150 animate-pulse"></div>
                            <div className="w-12 h-12 bg-white flex items-center justify-center rounded-lg border-2 border-safaricom-red glitch-red relative z-10">
                              <IconComponent name={nodeData.iconId} className="w-6 h-6 text-safaricom-red fill-safaricom-red/20" />
                            </div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-lg border border-slate-100 px-2 py-1 rounded-sm whitespace-nowrap z-30">
                              <span className="text-[8px] font-black text-safaricom-red uppercase tracking-tighter">THREAT: {nodeData.name}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-safaricom-green/10 blur-xl rounded-full scale-150 animate-pulse"></div>
                            <div className="w-12 h-12 bg-white flex items-center justify-center rounded-lg border-2 border-safaricom-green relative z-10">
                              <IconComponent name={nodeData.iconId} className="w-6 h-6 text-safaricom-green fill-safaricom-green/20" />
                            </div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-lg border border-slate-100 px-2 py-1 rounded-sm whitespace-nowrap z-30">
                              <span className="text-[8px] font-black text-safaricom-green uppercase tracking-tighter">DEFENSE: {nodeData.name}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Data Packets */}
              <AnimatePresence>
                {dataPackets.map((packet) => (
                  <motion.div 
                    key={packet.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{ 
                      left: packet.x * GRID_SIZE,
                      top: packet.y * GRID_SIZE,
                    }}
                    className="absolute z-10"
                  >
                    <div className="relative -translate-x-1/2 -translate-y-1/2">
                      <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full animate-pulse"></div>
                      <div className="w-5 h-5 bg-white border-2 border-blue-400 rounded-sm flex items-center justify-center relative z-10">
                        <Icons.Database className="w-3 h-3 text-blue-400" />
                      </div>
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-sm border border-slate-100 px-1.5 py-0.5 rounded-sm whitespace-nowrap z-30">
                        <span className="text-[6px] font-black text-blue-400 uppercase tracking-tighter">DATA_PKT</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Technical Tether (to nearest node) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="laserGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#46B525" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#46B525" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {nodes.map(node => (
                  <line 
                    key={node.id}
                    opacity="0.2" 
                    stroke="url(#laserGrad)" 
                    strokeDasharray="4 4" 
                    strokeWidth="1" 
                    x1={snake[0].x * GRID_SIZE + 10} 
                    y1={snake[0].y * GRID_SIZE + 10} 
                    x2={node.x * GRID_SIZE} 
                    y2={node.y * GRID_SIZE} 
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Mobile: difficulty badge */}
          <div className="absolute top-3 left-3 md:hidden z-30">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/90 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-safaricom-green animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{difficulty}</span>
            </div>
          </div>

          {/* Mobile: D-pad */}
          <div className="absolute bottom-4 right-4 md:hidden z-30">
            <DPad onDir={handleDirection} />
          </div>
        </main>

        {/* Telemetry Sidebar */}
        <aside className="hidden md:flex md:flex-col w-80 bg-white border-l border-slate-100 h-[calc(100vh-3.5rem)] p-6 z-10 overflow-hidden">
          {/* Score Card */}
          <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100 mb-8 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-safaricom-green/5 rounded-full -mr-6 -mt-6"></div>
            <h3 className="text-[9px] font-extrabold text-safaricom-green uppercase tracking-[0.2em] mb-2">CURRENT SCORE</h3>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tighter">
              {score.toLocaleString()}
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${Math.min((score % 10000) / 100, 100)}%` }}
                className="h-full bg-safaricom-green rounded-full shadow-[0_0_8px_rgba(70,181,37,0.5)]"
              ></motion.div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RANK: <span className="text-slate-900">GUARDIAN PRIME</span></p>
              <span className="text-[10px] font-mono font-bold text-safaricom-green">
                {Math.floor((score % 10000) / 100)}%
              </span>
            </div>
          </div>

          {/* Live Telemetry */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center px-1">
              LIVE TELEMETRY
              <span className="w-1.5 h-1.5 bg-safaricom-red rounded-full animate-pulse"></span>
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              <AnimatePresence initial={false}>
                {telemetry.map((item) => (
                  <TelemetryItem 
                    key={item.id}
                    time={item.time}
                    title={item.title}
                    description={item.description}
                    type={item.type}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Node Distribution Chart */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-6 px-1">NODE DISTRIBUTION</h3>
            <div className="flex items-end justify-around h-20 gap-4 px-1">
              {[
                { label: 'THREATS', value: stats.threats, color: 'bg-safaricom-red' },
                { label: 'DEFENSE', value: stats.defenses, color: 'bg-safaricom-green' },
                { label: 'PACKETS', value: stats.packets, color: 'bg-blue-400' }
              ].map((item, i) => {
                const total = stats.threats + stats.defenses + stats.packets || 1;
                const h = Math.max((item.value / total) * 100, 5);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="w-full bg-slate-50 rounded-t-sm relative h-full flex items-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className={`w-full ${item.color} rounded-t-sm transition-all relative`}
                      >
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.value}
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
      
      <AnimatePresence>
        {currentLesson && (
          <LessonPopup 
            lesson={currentLesson.lesson} 
            type={currentLesson.type}
            onClose={handleLessonComplete} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
