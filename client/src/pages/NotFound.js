import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl mt-4">Page Not Found</p>
      <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">Go back to Home</Link>
    </div>
  );
};

export default NotFound;
