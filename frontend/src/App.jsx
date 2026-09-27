import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AssessmentWizard from './components/Assessment/AssessmentWizard';
import StageLab from './components/Sandbox/StageLab';
import ModelBenchmarks from './components/Models/ModelBenchmarks';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assessment" element={<AssessmentWizard />} />
          <Route path="/sandbox" element={<StageLab />} />
          <Route path="/models" element={<ModelBenchmarks />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
