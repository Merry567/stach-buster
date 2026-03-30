import { useState, useEffect } from 'react';
import API from '../services/api';

function PatternsPage() {
  const [patterns, setPatterns] = useState([]);

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const response = await API.get('/patterns');   // ← Your new patterns route
        setPatterns(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPatterns();
  }, []);

  return (
    <div>
      <h1>My Patterns</h1>
      {/* render patterns */}
    </div>
  );
}

export default PatternsPage;