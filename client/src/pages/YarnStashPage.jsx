import { useState, useEffect } from 'react';
import API from '../services/api';

function YarnStashPage() {
  const [stash, setStash] = useState([]);

  useEffect(() => {
    const fetchStash = async () => {
      try {
        const response = await API.get('/stash');     // ← This is where you use it
        setStash(response.data);
      } catch (error) {
        console.error('Failed to fetch stash:', error);
      }
    };

    fetchStash();
  }, []);

  return (
    <div>
      <h1>My Yarn Stash</h1>
      {/* display stash items here */}
    </div>
  );
}

export default YarnStashPage;