import { useState, useMemo, useCallback, useRef } from 'react';
import { useStarlightStore } from '../../store/useStarlightStore';
import { useGameStore } from '../../store/useGameStore';
import { STARLIGHT_PATHS, STARLIGHT_NODES, getPathNodes, getStarlightNode } from '../../config/starlight';
import type { StarlightNode, StarlightPath } from '../../config/starlight';

// ──────────────────────────────────────────────
// Layout constants for SVG sphere grid
// ──────────────────────────────────────────────
const RING_RADII = [60, 120, 180, 240, 300];
const PATH_ANGLES = [0, 51.4, 102.9, 154.3, 205.7, 257.1, 308.6]; // degrees, 7 paths
const NODE_SPREAD = 10; // degrees offset for 3 nodes per ring (-10, 0, +10)
const NODE_RADIUS = 12;
const CENTER_RADIUS = 20;
const SVG_SIZE = 700;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function getNodePosition(pathIndex: number, ring: number, posIndex: number): { x: number; y: number } {
  const baseAngle = PATH_ANGLES[pathIndex];
  const spread = (posIndex - 1) * NODE_SPREAD; // -10, 0, +10
  const angle = degToRad(baseAngle + spread - 90); // -90 to start from top
  const radius = RING_RADII[ring - 1];
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

type NodeStatus = 'unlocked' | 'available' | 'locked';

function getNodeStatus(node: StarlightNode, unlockedNodes: string[], chessPieces: number): NodeStatus {
  if (unlockedNodes.includes(node.id)) return 'unlocked';
  const prereqsMet = node.requires.every(r => unlockedNodes.includes(r));
  if (prereqsMet && chessPieces >= node.cost) return 'available';
  return 'locked';
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export function StarlightPanel() {
  const unlockedNodes = useStarlightStore(s => s.unlockedNodes);
  const unlockNode = useStarlightStore(s => s.unlockNode);
  const getPathProgress = useStarlightStore(s => s.getPathProgress);
  const getStatBonuses = useStarlightStore(s => s.getStatBonuses);
  const getTotalInvested = useStarlightStore(s => s.getTotalInvested);
  const resources = useGameStore(s => s.resources);
  const chessPieces = resources['icqor_chess_piece'] || 0;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Zoom & pan state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const viewSize = SVG_SIZE / zoom;
  const viewHalf = viewSize / 2;
  const dynamicViewBox = `${-viewHalf + panX} ${-viewHalf + panY} ${viewSize} ${viewSize}`;

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      return Math.min(3, Math.max(0.5, prev + delta));
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (zoom <= 1) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
  }, [zoom, panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning.current) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    // Convert pixel movement to SVG coordinate movement
    const scale = viewSize / rect.width;
    const dx = (e.clientX - panStart.current.x) * scale;
    const dy = (e.clientY - panStart.current.y) * scale;
    setPanX(panStart.current.panX - dx);
    setPanY(panStart.current.panY - dy);
  }, [viewSize]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const selectedNode = selectedNodeId ? getStarlightNode(selectedNodeId) : null;
  const selectedPath = selectedNode ? STARLIGHT_PATHS.find(p => p.id === selectedNode.pathId) : null;

  // Build organized data: nodes grouped by path index and with positions
  const nodeLayout = useMemo(() => {
    const layout: { node: StarlightNode; x: number; y: number; pathIndex: number }[] = [];
    for (let pi = 0; pi < STARLIGHT_PATHS.length; pi++) {
      const pathId = STARLIGHT_PATHS[pi].id;
      const pathNodes = getPathNodes(pathId);
      // Group by ring, then assign position index (0, 1, 2) within each ring
      for (let ring = 1; ring <= 5; ring++) {
        const ringNodes = pathNodes.filter(n => n.ring === ring);
        ringNodes.forEach((node, idx) => {
          const pos = getNodePosition(pi, ring, idx);
          layout.push({ node, x: pos.x, y: pos.y, pathIndex: pi });
        });
      }
    }
    return layout;
  }, []);

  // Get prerequisite lines
  const prereqLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; color: string; unlocked: boolean }[] = [];
    for (const item of nodeLayout) {
      for (const reqId of item.node.requires) {
        const reqItem = nodeLayout.find(n => n.node.id === reqId);
        if (reqItem) {
          const path = STARLIGHT_PATHS[item.pathIndex];
          const bothUnlocked = unlockedNodes.includes(item.node.id) && unlockedNodes.includes(reqId);
          lines.push({
            x1: reqItem.x,
            y1: reqItem.y,
            x2: item.x,
            y2: item.y,
            color: path.color,
            unlocked: bothUnlocked,
          });
        }
      }
    }
    return lines;
  }, [nodeLayout, unlockedNodes]);

  const handleUnlock = useCallback(() => {
    if (selectedNodeId) {
      unlockNode(selectedNodeId);
    }
  }, [selectedNodeId, unlockNode]);

  const statBonuses = getStatBonuses();
  const totalInvested = getTotalInvested();

  // Format stat name for display
  const formatStat = (stat: string): string => {
    const map: Record<string, string> = {
      meleeAttack: 'Melee Attack', rangedAttack: 'Ranged Attack', blastAttack: 'Blast Attack',
      maxHp: 'Max HP', defense: 'Defense', evasion: 'Evasion', accuracy: 'Accuracy',
      critChance: 'Crit Chance', critDamage: 'Crit Damage', turnSpeed: 'Turn Speed',
      hpRegen: 'HP Regen', statusResist: 'Status Resist', lifesteal: 'Lifesteal',
      burnDot: 'Burn DoT', poisonDot: 'Poison DoT', frostSlow: 'Frost Slow',
      thornsDamage: 'Thorns Damage', blockChance: 'Block Chance', armorPen: 'Armor Pen',
      damageReduction: 'Damage Reduction', dropChance: 'Drop Chance',
      maxSp: 'Max SP', spRegen: 'SP Regen', spCostReduction: 'SP Cost Reduction',
      gatheringSpeed: 'Gathering Speed', gatheringYield: 'Gathering Yield',
      productionSpeed: 'Production Speed', xpBonus: 'XP Bonus',
      rareResourceChance: 'Rare Resource Chance', rarityUpgrade: 'Rarity Upgrade',
      doubleOutput: 'Double Output', abilityPower: 'Ability Power',
    };
    return map[stat] || stat;
  };

  const nodeStatus = selectedNode ? getNodeStatus(selectedNode, unlockedNodes, chessPieces) : null;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel: SVG sphere grid (70%) */}
      <div className="flex-[7] overflow-auto flex items-center justify-center p-4 relative" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* Zoom controls */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <button
            onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Zoom in"
          >+</button>
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Zoom out"
          >-</button>
          <button
            onClick={handleZoomReset}
            style={{
              width: '32px',
              height: 'auto',
              padding: '4px 0',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '9px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Reset zoom"
          >Reset</button>
          <div
            style={{
              textAlign: 'center',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              marginTop: '2px',
            }}
          >
            {Math.round(zoom * 100)}%
          </div>
        </div>
        <svg
          viewBox={dynamicViewBox}
          style={{
            width: '100%',
            maxWidth: '700px',
            maxHeight: '85vh',
            cursor: zoom > 1 ? (isPanning.current ? 'grabbing' : 'grab') : 'default',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background ring circles */}
          {RING_RADII.map((r, i) => (
            <circle
              key={`ring-${i}`}
              cx={0} cy={0} r={r}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}

          {/* Path axis lines (from center outward) */}
          {PATH_ANGLES.map((angle, i) => {
            const rad = degToRad(angle - 90);
            const outerR = RING_RADII[4] + 30;
            return (
              <line
                key={`axis-${i}`}
                x1={0} y1={0}
                x2={Math.cos(rad) * outerR}
                y2={Math.sin(rad) * outerR}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={1}
              />
            );
          })}

          {/* Prerequisite connection lines */}
          {prereqLines.map((line, i) => (
            <line
              key={`line-${i}`}
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke={line.unlocked ? line.color : 'rgba(255,255,255,0.12)'}
              strokeWidth={line.unlocked ? 2 : 1}
              strokeOpacity={line.unlocked ? 0.8 : 0.4}
            />
          ))}

          {/* Center hub node */}
          <circle
            cx={0} cy={0} r={CENTER_RADIUS}
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
          />
          <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.6)" fontSize={8} fontWeight="bold"
          >
            STARLIGHT
          </text>

          {/* Path labels at outer edge */}
          {STARLIGHT_PATHS.map((path, i) => {
            const rad = degToRad(PATH_ANGLES[i] - 90);
            const labelR = RING_RADII[4] + 40;
            return (
              <text
                key={`label-${i}`}
                x={Math.cos(rad) * labelR}
                y={Math.sin(rad) * labelR}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={path.color}
                fontSize={9}
                fontWeight="bold"
                opacity={0.8}
              >
                {path.name}
              </text>
            );
          })}

          {/* Nodes */}
          {nodeLayout.map(({ node, x, y, pathIndex }) => {
            const path = STARLIGHT_PATHS[pathIndex];
            const status = getNodeStatus(node, unlockedNodes, chessPieces);
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;

            let fill = 'rgba(30,30,30,0.8)';
            let stroke = 'rgba(255,255,255,0.15)';
            let strokeWidth = 1.5;
            let opacity = 0.5;

            if (status === 'unlocked') {
              fill = path.color;
              stroke = path.color;
              strokeWidth = 2;
              opacity = 1;
            } else if (status === 'available') {
              fill = 'rgba(30,30,30,0.9)';
              stroke = path.color;
              strokeWidth = 2;
              opacity = 0.9;
            }

            if (isSelected) {
              strokeWidth = 3;
              stroke = '#fff';
            }

            if (isHovered && status !== 'unlocked') {
              opacity = Math.min(1, opacity + 0.2);
            }

            return (
              <g
                key={node.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedNodeId(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                <circle
                  cx={x} cy={y} r={NODE_RADIUS}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
                {/* Ring number for locked nodes */}
                {status !== 'unlocked' && (
                  <text
                    x={x} y={y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="rgba(255,255,255,0.5)" fontSize={8}
                  >
                    {node.cost}
                  </text>
                )}
                {/* Checkmark for unlocked */}
                {status === 'unlocked' && (
                  <text
                    x={x} y={y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="rgba(0,0,0,0.7)" fontSize={10} fontWeight="bold"
                  >
                    &#x2713;
                  </text>
                )}
                {/* Available glow effect */}
                {status === 'available' && (
                  <circle
                    cx={x} cy={y} r={NODE_RADIUS + 3}
                    fill="none"
                    stroke={path.color}
                    strokeWidth={1}
                    opacity={0.3}
                  >
                    <animate
                      attributeName="opacity"
                      values="0.1;0.4;0.1"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 55} y={y - NODE_RADIUS - 26}
                      width={110} height={20}
                      rx={4}
                      fill="rgba(0,0,0,0.85)"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={0.5}
                    />
                    <text
                      x={x} y={y - NODE_RADIUS - 14}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="rgba(255,255,255,0.9)" fontSize={7}
                    >
                      {node.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right panel: Node details (30%) */}
      <div
        className="flex-[3] overflow-y-auto p-4 flex flex-col gap-4"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border)',
        }}
      >
        {/* Icqor Chess Pieces counter */}
        <div
          className="p-3 rounded text-center"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Icqor Chess Pieces
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
            {chessPieces}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Total invested: {totalInvested}
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && selectedPath ? (
          <div
            className="p-4 rounded"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              border: `1px solid ${selectedPath.color}40`,
            }}
          >
            <div className="text-xs font-bold mb-1" style={{ color: selectedPath.color }}>
              {selectedPath.name} - Ring {selectedNode.ring}
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {selectedNode.name}
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
              {selectedNode.description}
            </p>

            {/* Effect */}
            <div className="mb-3">
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Effect</div>
              <div className="text-sm font-bold" style={{ color: '#4ade80' }}>
                {selectedNode.effect.isPercentage ? '+' : '+'}
                {selectedNode.effect.value}
                {selectedNode.effect.isPercentage ? '%' : ''}{' '}
                {formatStat(selectedNode.effect.stat)}
              </div>
              {selectedNode.effect2 && (
                <div className="text-sm font-bold" style={{ color: '#4ade80' }}>
                  +{selectedNode.effect2.value}
                  {selectedNode.effect2.isPercentage ? '%' : ''}{' '}
                  {formatStat(selectedNode.effect2.stat)}
                </div>
              )}
            </div>

            {/* Cost */}
            <div className="mb-3">
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Cost</div>
              <div
                className="text-sm font-bold"
                style={{
                  color: chessPieces >= selectedNode.cost ? 'var(--color-text-primary)' : '#ef4444',
                }}
              >
                {selectedNode.cost} Icqor Chess Piece{selectedNode.cost !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Prerequisites */}
            {selectedNode.requires.length > 0 && (
              <div className="mb-3">
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Requires</div>
                {selectedNode.requires.map(reqId => {
                  const reqNode = getStarlightNode(reqId);
                  const isUnlocked = unlockedNodes.includes(reqId);
                  return (
                    <div
                      key={reqId}
                      className="text-sm cursor-pointer hover:underline"
                      style={{ color: isUnlocked ? '#4ade80' : '#ef4444' }}
                      onClick={() => setSelectedNodeId(reqId)}
                    >
                      {isUnlocked ? '\u2713' : '\u2717'} {reqNode?.name || reqId}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Unlock button */}
            {nodeStatus === 'available' && (
              <button
                onClick={handleUnlock}
                className="w-full py-2 px-4 rounded font-bold text-sm cursor-pointer transition-all hover:brightness-110"
                style={{
                  backgroundColor: selectedPath.color,
                  color: '#fff',
                  border: 'none',
                }}
              >
                Unlock ({selectedNode.cost} pieces)
              </button>
            )}
            {nodeStatus === 'unlocked' && (
              <div
                className="w-full py-2 px-4 rounded text-center text-sm font-bold"
                style={{
                  backgroundColor: 'rgba(74, 222, 128, 0.15)',
                  color: '#4ade80',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                }}
              >
                Unlocked
              </div>
            )}
            {nodeStatus === 'locked' && (
              <div
                className="w-full py-2 px-4 rounded text-center text-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {selectedNode.requires.some(r => !unlockedNodes.includes(r))
                  ? 'Prerequisites not met'
                  : 'Not enough Chess Pieces'}
              </div>
            )}
          </div>
        ) : (
          <div
            className="p-4 rounded text-center"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Select a node on the sphere grid to view its details.
            </div>
          </div>
        )}

        {/* Path Progress Summary */}
        <div
          className="p-3 rounded"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Path Progress
          </div>
          {STARLIGHT_PATHS.map(path => {
            const progress = getPathProgress(path.id);
            const pct = progress.total > 0 ? (progress.unlocked / progress.total) * 100 : 0;
            return (
              <div key={path.id} className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold" style={{ color: path.color }}>
                    {path.name}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {progress.unlocked}/{progress.total}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: path.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Stat Bonuses */}
        {Object.keys(statBonuses).length > 0 && (
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Active Bonuses
            </div>
            {Object.entries(statBonuses).map(([key, value]) => {
              const isPct = key.endsWith('_pct');
              const stat = isPct ? key.slice(0, -4) : key;
              return (
                <div key={key} className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {formatStat(stat)}
                  </span>
                  <span style={{ color: '#4ade80' }}>
                    +{value}{isPct ? '%' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
