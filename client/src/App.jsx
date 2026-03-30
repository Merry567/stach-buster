import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route - go to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard (protected for now) */}
        <Route 
          path="/dashboard" 
          element={
            <div className="p-10 text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to Stash Buster 🧶</h1>
              <p className="text-lg text-gray-600">Dashboard coming soon...</p>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;