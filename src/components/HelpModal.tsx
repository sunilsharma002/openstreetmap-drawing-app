import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="help-modal">
        <div className="modal-header">
          <h2>🗺️ Help & Shortcuts</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <section className="help-section">
            <h3>🎯 How to Draw</h3>
            <ul>
              <li><strong>Polygon & Line:</strong> Click points, double-click to finish</li>
              <li><strong>Rectangle:</strong> Click two opposite corners</li>
              <li><strong>Circle:</strong> Click center, then click for radius</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>⌨️ Keyboard Shortcuts</h3>
            <div className="shortcuts-grid">
              <div className="shortcut-item">
                <kbd>P</kbd>
                <span>Polygon tool</span>
              </div>
              <div className="shortcut-item">
                <kbd>R</kbd>
                <span>Rectangle tool</span>
              </div>
              <div className="shortcut-item">
                <kbd>C</kbd>
                <span>Circle tool</span>
              </div>
              <div className="shortcut-item">
                <kbd>L</kbd>
                <span>Line tool</span>
              </div>
              <div className="shortcut-item">
                <kbd>Esc</kbd>
                <span>Cancel drawing</span>
              </div>
              <div className="shortcut-item">
                <kbd>H</kbd>
                <span>Show help</span>
              </div>
              <div className="shortcut-item">
                <kbd>E</kbd>
                <span>Export GeoJSON</span>
              </div>
              <div className="shortcut-item">
                <kbd>/</kbd>
                <span>Search features</span>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>📏 Spatial Rules</h3>
            <ul>
              <li><strong>No Overlaps:</strong> Polygonal shapes cannot overlap</li>
              <li><strong>Auto-trim:</strong> Overlapping areas are automatically removed</li>
              <li><strong>Lines are Free:</strong> Line strings can cross anything</li>
              <li><strong>Shape Limits:</strong> Each shape type has a maximum count</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>🔍 Search Tips</h3>
            <ul>
              <li>Search Indian cities: "Mumbai", "Delhi", "Bangalore"</li>
              <li>Try landmarks: "India Gate", "Gateway of India"</li>
              <li>Search features by name or type</li>
              <li>Use the clear button (×) to reset searches</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>📥 Export</h3>
            <ul>
              <li>Download all features as GeoJSON format</li>
              <li>Compatible with GIS software and web mapping libraries</li>
              <li>Includes all properties and metadata</li>
            </ul>
          </section>
        </div>

        <div className="modal-footer">
          <p>Made with ❤️ for India | Press <kbd>Esc</kbd> to close</p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;