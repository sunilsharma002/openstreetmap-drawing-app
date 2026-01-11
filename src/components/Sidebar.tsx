import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { downloadGeoJSON } from '../utils/geoJsonExport';
import { DrawingMode } from '../types';

const Sidebar: React.FC = () => {
  const {
    drawingMode,
    features,
    shapeLimits,
    errorMessage,
    setDrawingMode,
    removeFeature,
    clearError,
    getFeatureCount
  } = useAppStore();

  const handleToolSelect = (mode: DrawingMode) => {
    setDrawingMode(drawingMode === mode ? null : mode);
  };

  const handleExport = () => {
    if (features.length === 0) {
      alert('No features to export');
      return;
    }
    downloadGeoJSON(features);
  };

  const handleDeleteFeature = (id: string) => {
    removeFeature(id);
  };

  return (
    <div className="sidebar">
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Map Drawing Tools</h2>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
          <button 
            onClick={clearError}
            style={{ 
              float: 'right', 
              background: 'none', 
              border: 'none', 
              color: '#721c24',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="limits-section">
        <h4>Shape Limits</h4>
        <div className="limit-item">
          <span>Polygons:</span>
          <span>{getFeatureCount('polygon')}/{shapeLimits.polygon}</span>
        </div>
        <div className="limit-item">
          <span>Rectangles:</span>
          <span>{getFeatureCount('rectangle')}/{shapeLimits.rectangle}</span>
        </div>
        <div className="limit-item">
          <span>Circles:</span>
          <span>{getFeatureCount('circle')}/{shapeLimits.circle}</span>
        </div>
        <div className="limit-item">
          <span>Line Strings:</span>
          <span>{getFeatureCount('linestring')}/{shapeLimits.linestring}</span>
        </div>
      </div>

      <div className="tool-section">
        <h3>Drawing Tools</h3>
        <div className="tool-buttons">
          <button
            className={`tool-button ${drawingMode === 'polygon' ? 'active' : ''}`}
            onClick={() => handleToolSelect('polygon')}
          >
            🔷 Draw Polygon
          </button>
          <button
            className={`tool-button ${drawingMode === 'rectangle' ? 'active' : ''}`}
            onClick={() => handleToolSelect('rectangle')}
          >
            ⬜ Draw Rectangle
          </button>
          <button
            className={`tool-button ${drawingMode === 'circle' ? 'active' : ''}`}
            onClick={() => handleToolSelect('circle')}
          >
            ⭕ Draw Circle
          </button>
          <button
            className={`tool-button ${drawingMode === 'linestring' ? 'active' : ''}`}
            onClick={() => handleToolSelect('linestring')}
          >
            📏 Draw Line String
          </button>
        </div>
      </div>

      <div className="tool-section">
        <h3>Features ({features.length})</h3>
        {features.length > 0 ? (
          <div className="feature-list">
            {features.map((feature) => (
              <div key={feature.id} className="feature-item">
                <span>
                  {feature.type} - {feature.properties.name}
                </span>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteFeature(feature.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
            No features drawn yet
          </p>
        )}
      </div>

      <div className="tool-section">
        <button
          className="export-button"
          onClick={handleExport}
          disabled={features.length === 0}
          style={{ 
            opacity: features.length === 0 ? 0.5 : 1,
            cursor: features.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          📥 Export GeoJSON
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ul style={{ paddingLeft: '16px', marginTop: '8px' }}>
          <li>Select a tool and click on the map to draw</li>
          <li>Polygonal shapes cannot overlap</li>
          <li>Line strings can cross any feature</li>
          <li>Click the same tool to deactivate</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;