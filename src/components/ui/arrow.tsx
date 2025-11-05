// Arrow component using SVG for smooth connections
const Arrow = ({ length = 60, isActive = false, label = '', direction = 'horizontal' }) => {
  const color = isActive ? '#3b82f6' : '#d1d5db';

  if (direction === 'horizontal') {
    return (
      // stack vertically so label appears above the arrow and is centered
      <div className="flex flex-col items-start gap-1">
        {label && <span className="text-xs text-gray-500">{label}</span>}
        <svg width={length} height="20" className="overflow-visible">
          <defs>
            <marker
              id={`arrowhead-${isActive ? 'active' : 'inactive'}`}
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill={color} />
            </marker>
          </defs>
          <line
            x1="0"
            y1="10"
            x2={length}
            y2="10"
            stroke={color}
            strokeWidth="2"
            markerEnd={`url(#arrowhead-${isActive ? 'active' : 'inactive'})`}
            className="transition-all duration-300"
          />
        </svg>
      </div>
    );
  }

  return (
    <svg width="20" height={length} className="overflow-visible">
      <defs>
        <marker
          id={`arrowhead-v-${isActive ? 'active' : 'inactive'}`}
          markerWidth="10"
          markerHeight="10"
          refX="3"
          refY="9"
          orient="0"
        >
          {/* polygon arranged with tip at the bottom so with orient="0" it points down */}
          <polygon points="0 0, 6 0, 3 10" fill={color} />
        </marker>
      </defs>
      <line
        x1="10"
        y1="0"
        x2="10"
        y2={length}
        stroke={color}
        strokeWidth="2"
        markerEnd={`url(#arrowhead-v-${isActive ? 'active' : 'inactive'})`}
        className="transition-all duration-300"
      />
      {label && (
        <text x="15" y={length / 2} fontSize="10" fill="#6b7280" className="text-xs">
          {label}
        </text>
      )}
    </svg>
  );
};

export { Arrow };
