import { useState } from "react";
import MemberSidebar from "../pages/member/MemberSidebar";
import MemberHeader from "../pages/member/MemberHeader";
import "../pages/member/Member.css";

function MemberLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="member-layout">

      <MemberSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="member-main">

        {/* MOBILE HEADER */}

        <div className="member-mobile-header">

          <button
            type="button"
            className={`member-mobile-menu-button ${
              sidebarOpen ? "open" : ""
            }`}
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            aria-label="Buka menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="member-mobile-title">
            Member Panel
          </div>

        </div>


        {/* DESKTOP HEADER */}

        <MemberHeader />


        <main className="member-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default MemberLayout;