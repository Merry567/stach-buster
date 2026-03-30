import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', formData);

      // Save token
      localStorage.setItem('token', response.data.token);

      // Save user info if returned
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      alert('Login successful! Welcome back 🧶');
      navigate('/dashboard');

    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stash Buster</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your yarn stash</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 hover:underline font-medium">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;