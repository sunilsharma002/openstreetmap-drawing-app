import React from 'react';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';

const App: React.FC = () => {
  return (
    <div className="app">
      <Sidebar />
      <MapComponent />
    </div>
  );
};

export default App;