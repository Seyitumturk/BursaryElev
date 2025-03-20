import React from 'react';

export default function EagleNestSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMax meet"
    >
      {/* Background curved bowl shape - indigenous style */}
      <path
        d="M50,40 C100,160 500,160 550,40 L550,180 L50,180 Z"
        fill="url(#nestGradient)"
        stroke="#5b3d2e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Indigenous pattern elements */}
      <path
        d="M75,60 C125,160 475,160 525,60"
        fill="none"
        stroke="#876650"
        strokeWidth="2"
        strokeDasharray="10,5"
        opacity="0.6"
      />
      
      <path
        d="M100,75 C150,155 450,155 500,75"
        fill="none"
        stroke="#876650"
        strokeWidth="2"
        strokeDasharray="5,3"
        opacity="0.6"
      />
      
      {/* Small feather designs */}
      <g transform="translate(180, 130) rotate(-10) scale(0.6)">
        <path
          d="M0,0 C10,-20 20,-10 30,-30 C40,-10 50,-20 60,0 C40,5 20,5 0,0Z"
          fill="#ae3d31"
          opacity="0.7"
        />
      </g>
      
      <g transform="translate(380, 140) rotate(15) scale(0.6)">
        <path
          d="M0,0 C10,-20 20,-10 30,-30 C40,-10 50,-20 60,0 C40,5 20,5 0,0Z"
          fill="#d36425"
          opacity="0.7"
        />
      </g>
      
      <g transform="translate(120, 140) rotate(-5) scale(0.5)">
        <path
          d="M0,0 C10,-20 20,-10 30,-30 C40,-10 50,-20 60,0 C40,5 20,5 0,0Z"
          fill="#bb725c"
          opacity="0.7"
        />
      </g>
      
      <g transform="translate(450, 130) rotate(5) scale(0.5)">
        <path
          d="M0,0 C10,-20 20,-10 30,-30 C40,-10 50,-20 60,0 C40,5 20,5 0,0Z"
          fill="#ae3d31"
          opacity="0.7"
        />
      </g>
      
      {/* Subtle texture */}
      <g opacity="0.2">
        {Array.from({ length: 15 }).map((_, i) => (
          <circle
            key={i}
            cx={100 + i * 30}
            cy={160}
            r="3"
            fill="#5b3d2e"
          />
        ))}
      </g>
      
      {/* Eagle head silhouette - simplified */}
      <g transform="translate(275, 155) scale(0.6)">
        <path
          d="M0,0 C-10,-10 -15,-5 -20,-15 C-10,-25 5,-25 15,-15 C20,-5 10,-10 0,0Z"
          fill="#5b3d2e"
          stroke="#5b3d2e"
          strokeWidth="1"
        />
      </g>
      
      {/* Definitions */}
      <defs>
        <linearGradient id="nestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a9866b" />
          <stop offset="50%" stopColor="#876650" />
          <stop offset="100%" stopColor="#5b3d2e" />
        </linearGradient>
      </defs>
    </svg>
  );
}
