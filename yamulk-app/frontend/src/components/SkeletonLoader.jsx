import React from 'react';
import './SkeletonLoader.css';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const renderSkeletons = () => {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      if (type === 'card') {
        skeletons.push(
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-img"></div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
        );
      } else if (type === 'page') {
        skeletons.push(
          <div key={i} className="skeleton-page">
            <div className="skeleton skeleton-header"></div>
            <div className="skeleton skeleton-block"></div>
            <div className="skeleton skeleton-block large"></div>
          </div>
        );
      }
    }
    return skeletons;
  };

  return (
    <div className={`skeleton-container ${type}-layout`}>
      {renderSkeletons()}
    </div>
  );
}
