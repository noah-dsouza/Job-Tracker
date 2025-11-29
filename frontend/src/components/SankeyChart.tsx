import { useEffect, useRef, useState } from 'react';

interface SankeyChartProps {
  stats: {
    applied: number;
    noReply: number;
    rejected: number;
    rejectedFromInitial: number;
    rejectedFromOA: number;
    rejectedFromFinal: number;
    reply: number;
    initialInterview: number;
    initialFromOA: number;
    initialFromReplies: number;
    OA: number;
    finalInterview: number;
    offer: number;
    offerRejected: number;
    accepted: number;
  };
}

export function SankeyChart({ stats }: SankeyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  const totalApplied = stats.applied;

  useEffect(() => {
    if (!svgRef.current) return;

    // Animate paths on mount
    const paths = svgRef.current.querySelectorAll('.flow-path');
    paths.forEach((path, index) => {
      const pathElement = path as SVGPathElement;
      const length = pathElement.getTotalLength();
      pathElement.style.strokeDasharray = `${length}`;
      pathElement.style.strokeDashoffset = `${length}`;
      
      setTimeout(() => {
        pathElement.style.transition = 'stroke-dashoffset 1.5s ease-out';
        pathElement.style.strokeDashoffset = '0';
      }, index * 150);
    });
  }, []);

  // Box dimensions
  const boxWidth = 140;
  const boxHeight = 80;

  // Define node positions and data
  const nodes = [
    { id: 'applied', x: 40, y: 210, label: 'Jobs Applied', count: totalApplied, color: '#8a9a8f' },
    { id: 'reply', x: 240, y: 110, label: 'Replies', count: stats.reply, color: '#9ca592' },
    { id: 'no-reply', x: 240, y: 320, label: 'No Reply', count: stats.noReply, color: '#b5aea5' },
    { id: 'initial-interview', x: 460, y: 50, label: 'Initial Interview', count: stats.initialInterview, color: '#7a8d7f' },
    { id: 'oa', x: 460, y: 250, label: 'OA Requested', count: stats.OA, color: '#d9b5a0' },
    { id: 'final-interview', x: 680, y: 80, label: 'Final Interview', count: stats.finalInterview, color: '#5a6d5e' },
    { id: 'offer', x: 900, y: 150, label: 'Offers', count: stats.offer, color: '#c5a987' },
    { id: 'rejected', x: 900, y: 320, label: 'Rejected', count: stats.rejected, color: '#b39189' },
    { id: 'accepted', x: 1120, y: 60, label: 'Accepted', count: stats.accepted, color: '#6b8273' },
    { id: 'offer-rejected', x: 1120, y: 260, label: 'Offers Rejected', count: stats.offerRejected, color: '#d97b66' },
  ];

  // Define connections (from, to, value, color)
  const connections = [
    { from: 'applied', to: 'reply', fromSide: 'right', toSide: 'left', value: stats.reply, color: '#8a9a8f' },
    { from: 'applied', to: 'no-reply', fromSide: 'right', toSide: 'left', value: stats.noReply, color: '#b5aea5' },
    { from: 'reply', to: 'initial-interview', fromSide: 'right', toSide: 'left', value: stats.initialFromReplies, color: '#7a8d7f' },
    { from: 'reply', to: 'oa', fromSide: 'right', toSide: 'left', value: stats.OA, color: '#d9b5a0' },
    { from: 'oa', to: 'initial-interview', fromSide: 'top', toSide: 'bottom', value: stats.initialFromOA, color: '#7a8d7f' },
    { from: 'oa', to: 'rejected', fromSide: 'right', toSide: 'left', value: stats.rejectedFromOA, color: '#b39189' },
    { from: 'initial-interview', to: 'final-interview', fromSide: 'right', toSide: 'left', value: stats.finalInterview, color: '#5a6d5e' },
    { from: 'initial-interview', to: 'rejected', fromSide: 'right', toSide: 'left', value: stats.rejectedFromInitial, color: '#b39189' },
    { from: 'final-interview', to: 'offer', fromSide: 'right', toSide: 'left', value: stats.offer, color: '#c5a987' },
    { from: 'final-interview', to: 'rejected', fromSide: 'right', toSide: 'left', value: stats.rejectedFromFinal, color: '#b39189' },
    { from: 'offer', to: 'accepted', fromSide: 'right', toSide: 'left', value: stats.accepted, color: '#6b8273' },
    { from: 'offer', to: 'offer-rejected', fromSide: 'right', toSide: 'left', value: stats.offerRejected, color: '#d97b66' },
  ];

  // Helper to get box edge coordinates
  const getBoxEdge = (node: typeof nodes[0], side: string) => {
    const centerX = node.x + boxWidth / 2;
    const centerY = node.y + boxHeight / 2;
    
    switch (side) {
      case 'right':
        return { x: node.x + boxWidth, y: centerY };
      case 'left':
        return { x: node.x, y: centerY };
      case 'top':
        return { x: centerX, y: node.y };
      case 'bottom':
        return { x: centerX, y: node.y + boxHeight };
      default:
        return { x: centerX, y: centerY };
    }
  };

  // Create path between two boxes
  const createPath = (conn: typeof connections[0]) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    
    if (!fromNode || !toNode || conn.value === 0) return null;

    const start = getBoxEdge(fromNode, conn.fromSide);
    const end = getBoxEdge(toNode, conn.toSide);

    const midX = (start.x + end.x) / 2;
    
    // Create smooth curve
    if (conn.fromSide === 'right' && conn.toSide === 'left') {
      return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
    } else if (conn.fromSide === 'bottom' && conn.toSide === 'top') {
      const midY = (start.y + end.y) / 2;
      return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
    } else if (conn.fromSide === 'top' && conn.toSide === 'bottom') {
      const midY = (start.y + end.y) / 2;
      return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
    }
    
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  };

  return (
    <div className="relative w-full overflow-x-auto">
      <svg ref={svgRef} width="1300" height="500" viewBox="0 0 1300 500" className="w-full h-auto">
        <defs>
          {/* Arrow markers */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#7a8a7e" opacity="0.6" />
          </marker>
        </defs>

        {/* Draw connections first (behind boxes) */}
        {connections.map((conn, idx) => {
          const path = createPath(conn);
          if (!path) return null;
          
          return (
            <path
              key={`conn-${idx}`}
              className="flow-path transition-all duration-300"
              d={path}
              stroke={conn.color}
              strokeWidth={Math.max(conn.value * 3, 2)}
              fill="none"
              opacity="0.7"
              strokeLinecap="round"
            />
          );
        })}

        {/* Draw nodes (boxes) on top */}
        {nodes.map((node, idx) => (
          <g
            key={node.id}
            className="animate-fade-in cursor-pointer transition-all duration-300"
            style={{ animationDelay: `${idx * 0.1}s` }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Shadow */}
            {hoveredNode === node.id && (
              <rect
                x={node.x - 4}
                y={node.y - 4}
                width={boxWidth + 8}
                height={boxHeight + 8}
                rx="12"
                fill={node.color}
                opacity="0.2"
                className="animate-fade-in"
              />
            )}
            
            {/* Main box */}
            <rect
              x={node.x}
              y={node.y}
              width={boxWidth}
              height={boxHeight}
              rx="8"
              fill={node.color}
              opacity={hoveredNode === node.id ? "0.9" : "0.7"}
              className="transition-all duration-300"
              style={{
                filter: hoveredNode === node.id ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none',
              }}
            />
            
            {/* Text */}
            <text
              x={node.x + boxWidth / 2}
              y={node.y + boxHeight / 2 - 8}
              textAnchor="middle"
              className="text-[#2d2d2d]"
              fontSize="13"
              fontWeight="500"
            >
              {node.label}
            </text>
            <text
              x={node.x + boxWidth / 2}
              y={node.y + boxHeight / 2 + 12}
              textAnchor="middle"
              className="text-[#2d2d2d]"
              fontSize="18"
              fontWeight="600"
            >
              {node.count}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
export default SankeyChart;
