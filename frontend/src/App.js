import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import UploadDocument from './components/UploadDocument';
import LocationManagement from './pages/LocationManagement';
import ClientList from './pages/ClientList';

import DocumentTracker from './pages/DocumentTracker';
import FamilyTree from './pages/FamilyTree';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/add-client" element={<Dashboard />} />
          <Route path="/locations" element={<LocationManagement />} />
          <Route path="/documents" element={<DocumentTracker />} />
          <Route path="/family-tree" element={<FamilyTree />} />
          <Route path="/upload" element={<UploadDocument />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

