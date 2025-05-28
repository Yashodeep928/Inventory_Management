import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.log("No token found in localStorage.");
          return navigate('/login');
        }

        const response = await fetch('http://localhost:5000/api/users/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('Logout response:', data);

        // Clear token from localStorage
        localStorage.removeItem('token');

        // Redirect to login
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Logout failed:', error);
        navigate('/login', { replace: true });
      }
    };

    logoutUser();
  }, [navigate]);

  return null;
};

export default Logout;
