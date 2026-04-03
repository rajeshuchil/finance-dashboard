import './SidebarUser.css';

export default function SidebarUser() {
  let user = { name: 'User', role: 'viewer' };
  
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      user = JSON.parse(userStr);
    }
  } catch (err) {
    console.error('Failed to parse user from localStorage', err);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="sidebar-user">
      <div className="su-profile">
        <span className="su-name" title={user.name}>{user.name}</span>
        <span className={`su-role su-role--${user.role}`}>{user.role}</span>
      </div>
      <button className="su-logout" onClick={handleLogout}>Logout</button>
    </div>
  );
}
