import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import Organization from "../pages/public/Organization";
import News from "../pages/public/News";
import NewsDetail from "../pages/public/NewsDetail";
import About from "../pages/public/About";
import AdminLayout from "../layouts/AdminLayout";
import Accounts from "../pages/admin/Accounts";
import AdminNews from "../pages/admin/News";
import AdminOrganization from "../pages/admin/Organization";
import AdminAbout from "../pages/admin/About";
import AdminAttendance from "../pages/admin/Attendance";
import AdminMembers from "../pages/admin/Members";
import MemberLayout from "../layouts/MemberLayout";

import MemberDashboard from "../pages/member/Dashboard";
import MemberProfile from "../pages/member/Profile";
import MemberAttendance from "../pages/member/Attendance";

import PublicLayout from "../layouts/PublicLayout";

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC WEBSITE */}

        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        {/* AUTH */}

        <Route path="/login" element={<Login />} />


        

        <Route
          path="/organization"
          element={
            <PublicLayout>
              <Organization />
            </PublicLayout>
          }
        />

        <Route
          path="/news"
          element={
            <PublicLayout>
              <News />
            </PublicLayout>
          }
        />

        <Route
          path="/news/:id"
          element={
            <PublicLayout>
              <NewsDetail />
            </PublicLayout>
          }
        />

        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/accounts"
          element={
            <AdminLayout>
              <Accounts />
            </AdminLayout>
          }
        />

       <Route
        path="/admin/news"
        element={
          <AdminLayout>
            <AdminNews />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/organization"
        element={
          <AdminLayout>
            <AdminOrganization />
          </AdminLayout>
        }
      />

      <Route
      path="/admin/about"
      element={
        <AdminLayout>
          <AdminAbout />
        </AdminLayout>
      }
    />

    <Route
      path="/admin/attendance"
      element={
        <AdminLayout>
          <AdminAttendance />
        </AdminLayout>
      }
    />

    <Route
      path="/admin/members"
      element={
        <AdminLayout>
          <AdminMembers />
        </AdminLayout>
      }
    />


  {/* MEMBER */}

    <Route
    path="/member/dashboard"
    element={
      <MemberLayout>
        <MemberDashboard />
      </MemberLayout>
    }
  />

  <Route
    path="/member/profile"
    element={
      <MemberLayout>
        <MemberProfile />
      </MemberLayout>
    }
  />

  <Route
    path="/member/attendance"
    element={
      <MemberLayout>
        <MemberAttendance />
      </MemberLayout>
    }
  />


      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;