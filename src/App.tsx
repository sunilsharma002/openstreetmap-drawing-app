import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import HelpModal from './components/HelpModal';
import { useAppStore } from './store/useAppStore';
import { downloadGeoJSON } from './utils/geoJsonExport';
import './index.css';

const App: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { setDrawingMode, drawingMode, features } = useAppStore();

  const handleHelpClick = () => {
    setIsHelpOpen(true);
  };

  const handleHelpClose = () => {
    setIsHelpOpen(false);
  };

  const handleExport = () => {
    if (features.length === 0) {
      alert('No features to export');
      return;
    }
    downloadGeoJSON(features);
  };

  // Simple keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.key.toLowerCase();
      
      switch (key) {
        case 'p':
          event.preventDefault();
          setDrawingMode(drawingMode === 'polygon' ? null : 'polygon');
          break;
        case 'r':
          event.preventDefault();
          setDrawingMode(drawingMode === 'rectangle' ? null : 'rectangle');
          break;
        case 'c':
          event.preventDefault();
          setDrawingMode(drawingMode === 'circle' ? null : 'circle');
          break;
        case 'l':
          event.preventDefault();
          setDrawingMode(drawingMode === 'linestring' ? null : 'linestring');
          break;
        case 'escape':
          event.preventDefault();
          setDrawingMode(null);
          setIsHelpOpen(false);
          break;
        case 'h':
          event.preventDefault();
          setIsHelpOpen(!isHelpOpen);
          break;
        case 'e':
          event.preventDefault();
          handleExport();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setDrawingMode, drawingMode, isHelpOpen, handleExport]);

  return (
    <div className="app">
      <div className="app-body">
        <Sidebar onHelpClick={handleHelpClick} />
        <MapComponent />
      </div>
      <HelpModal isOpen={isHelpOpen} onClose={handleHelpClose} />
    </div>
  );
};

export default App;