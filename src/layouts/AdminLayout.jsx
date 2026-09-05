import { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import "../pages/admin/Admin.css";

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      <div className="admin-main">
        <AdminHeader onMenuClick={handleToggleSidebar} />

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

