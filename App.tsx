import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import BKNLayout from './components/layout/BKNLayout';
import Overview from './pages/Overview';
import Explore from './pages/Explore';
import Align from './pages/Align';
import ChangeSets from './pages/ChangeSets';
import Schema from './pages/Schema';
import LogicViews from './pages/LogicViews';
import DataStandards from './pages/DataStandards';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/bkn/overview" replace />} />
        
        <Route path="/bkn" element={<BKNLayout />}>
           <Route path="overview" element={<Overview />} />
           <Route path="logic-views" element={<LogicViews />} />
           <Route path="explore" element={<Explore />} />
           <Route path="align" element={<Align />} />
           <Route path="changesets" element={<ChangeSets />} />
           <Route path="standards" element={<DataStandards />} />
           <Route path="schema" element={<Schema />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;