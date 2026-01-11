import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { downloadGeoJSON } from '../utils/geoJsonExport';
import { DrawingMode } from '../types';
import SearchBar from './SearchBar';

interface SidebarProps {
  onHelpClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onHelpClick }) => {
  const {
    drawingMode,
    features,
    shapeLimits,
    errorMessage,
    searchQuery,
    setDrawingMode,
    removeFeature,
    clearError,
    getFeatureCount,
    getFilteredFeatures
  } = useAppStore();

  const filteredFeatures = getFilteredFeatures();

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>🗺️ Map Tools</h2>
        <button
          onClick={onHelpClick}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          title="Help (H)"
        >
          ❓ Help
        </button>
      </div>
      
      {/* Drawing Status Indicator */}
      <div className={`drawing-status ${drawingMode ? 'active' : 'inactive'}`}>
        {drawingMode ? (
          <>
            ✏️ Drawing: {drawingMode === 'polygon' && '🔷 Polygon'}
            {drawingMode === 'rectangle' && '⬜ Rectangle'}
            {drawingMode === 'circle' && '⭕ Circle'}
            {drawingMode === 'linestring' && '📏 Line'}
          </>
        ) : (
          '🎯 Select a tool to start drawing'
        )}
      </div>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
          <button onClick={clearError} title="Close">×</button>
        </div>
      )}

      <div className="limits-section">
        <h4>📊 Usage</h4>
        <div className="limits-grid">
          <div className="limit-item">
            <span>🔷</span>
            <span>{getFeatureCount('polygon')}/{shapeLimits.polygon}</span>
          </div>
          <div className="limit-item">
            <span>⬜</span>
            <span>{getFeatureCount('rectangle')}/{shapeLimits.rectangle}</span>
          </div>
          <div className="limit-item">
            <span>⭕</span>
            <span>{getFeatureCount('circle')}/{shapeLimits.circle}</span>
          </div>
          <div className="limit-item">
            <span>📏</span>
            <span>{getFeatureCount('linestring')}/{shapeLimits.linestring}</span>
          </div>
        </div>
      </div>

      <div className="tool-section">
        <h3>✏️ Draw</h3>
        <div className="tool-buttons">
          <button
            className={`tool-button ${drawingMode === 'polygon' ? 'active' : ''}`}
            onClick={() => handleToolSelect('polygon')}
            data-shortcut="P"
            title="Polygon (P)"
          >
            <div className="tool-icon">🔷</div>
            <div className="tool-label">Polygon</div>
          </button>
          <button
            className={`tool-button ${drawingMode === 'rectangle' ? 'active' : ''}`}
            onClick={() => handleToolSelect('rectangle')}
            data-shortcut="R"
            title="Rectangle (R)"
          >
            <div className="tool-icon">⬜</div>
            <div className="tool-label">Rectangle</div>
          </button>
          <button
            className={`tool-button ${drawingMode === 'circle' ? 'active' : ''}`}
            onClick={() => handleToolSelect('circle')}
            data-shortcut="C"
            title="Circle (C)"
          >
            <div className="tool-icon">⭕</div>
            <div className="tool-label">Circle</div>
          </button>
          <button
            className={`tool-button ${drawingMode === 'linestring' ? 'active' : ''}`}
            onClick={() => handleToolSelect('linestring')}
            data-shortcut="L"
            title="Line (L)"
          >
            <div className="tool-icon">📏</div>
            <div className="tool-label">Line</div>
          </button>
        </div>
      </div>

      <div className="tool-section">
        <div className="features-header">
          <h3>📋 Features ({features.length})</h3>
          {features.length > 0 && <SearchBar />}
        </div>
        
        {searchQuery && (
          <div className="search-results-info">
            {filteredFeatures.length} of {features.length} shown
          </div>
        )}
        
        {features.length > 0 ? (
          <div className="feature-list">
            {filteredFeatures.length > 0 ? (
              filteredFeatures.map((feature) => (
                <div key={feature.id} className="feature-item">
                  <div className="feature-info">
                    <div className="feature-name">{feature.properties.name}</div>
                    <div className="feature-meta">
                      <span>
                        {feature.type === 'polygon' && '🔷'} 
                        {feature.type === 'rectangle' && '⬜'} 
                        {feature.type === 'circle' && '⭕'} 
                        {feature.type === 'linestring' && '📏'} 
                        {feature.type}
                      </span>
                      <span>•</span>
                      <span>{new Date(feature.properties.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteFeature(feature.id)}
                    title={`Delete ${feature.properties.name}`}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                No matching features
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">✨</div>
            Start drawing on the map!
          </div>
        )}
      </div>

      <div className="tool-section">
        <button
          className="export-button"
          onClick={handleExport}
          disabled={features.length === 0}
          title={features.length === 0 ? 'No features to export' : 'Export as GeoJSON (E)'}
        >
          📥 Export ({features.length})
        </button>
      </div>

      <div className="instructions">
        <h4>💡 Tips</h4>
        <ul>
          <li>Search Indian cities above</li>
          <li>Click to start, double-click to finish</li>
          <li>Shapes can't overlap</li>
          <li>Lines can cross anything</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;