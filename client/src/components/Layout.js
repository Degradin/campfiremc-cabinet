import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';

const Layout = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="text-xl font-bold">CampFireMC</Link>
          <nav className="flex gap-4 items-center">
            <Link to="/" className="hover:text-primary">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="hover:text-primary">Profile</Link>
                {/* TODO: Add role-based access for admin link */}
                <Link to="/admin" className="hover:text-primary">Admin</Link>
                <Button variant="ghost" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary">Login</Link>
                <Link to="/register" className="hover:text-primary">Register</Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 flex-grow">
        <Outlet />
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CampFireMC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
