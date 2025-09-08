import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <div className="absolute inset-0">
      <Spline
        scene="https://prod.spline.design/EFlEghJH3qCmzyRi/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
