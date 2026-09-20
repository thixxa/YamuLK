import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './ItineraryModal.css';

export default function ItineraryModal({ isOpen, onClose, markdownText, title }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="itinerary-modal-overlay" onClick={onClose}>
      <div className="itinerary-modal-content" onClick={e => e.stopPropagation()}>
        <div className="itinerary-modal-header">
          <h2 className="itinerary-modal-title">{title || 'Travel Itinerary'}</h2>
          <button className="itinerary-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="itinerary-modal-body">
          {markdownText ? (
            <ReactMarkdown className="markdown-content">{markdownText}</ReactMarkdown>
          ) : (
            <p className="text-muted">No itinerary data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
