/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface TouchGhostProps {
  imageUrl: string | null;
  position: { x: number; y: number } | null;
}

const TouchGhost: React.FC<TouchGhostProps> = ({ imageUrl, position }) => {
  if (!imageUrl || !position) {
    return null;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -50%)',
    width: '120px',
    height: '120px',
    pointerEvents: 'none',
    zIndex: 9999,
  };

  return (
    <div style={style} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-2">
      <img
        src={imageUrl}
        alt="Dragging product"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default TouchGhost;
