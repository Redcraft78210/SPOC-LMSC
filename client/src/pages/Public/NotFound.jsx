import { useNavigate } from 'react-router-dom';

function NotFound() {
  const authToken = localStorage.getItem('authToken');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">
        Sorry, the page you are looking for does not exist.
      </p>
      <button
        onClick={() => navigate(authToken ? '/dashboard' : '/')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Go back to the homepage
      </button>
    </div>
  );
}

export default NotFound;
