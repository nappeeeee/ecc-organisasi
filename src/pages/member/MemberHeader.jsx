import { useAuth } from "../../context/AuthContext";

function MemberHeader() {
  const { userData } = useAuth();

  const userName = userData?.name || "Anggota";

  return (
    <header className="member-header">

      {/* HEADER LEFT */}

      <div className="member-header-left">

        <h2>
          Member Panel
        </h2>

        <span>
          Selamat datang kembali,{" "}
          {userName}
        </span>

      </div>


      {/* HEADER USER */}

      <div className="member-header-user">

        <div className="member-header-avatar">
          {userName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="member-header-user-info">

          <strong>
            {userName}
          </strong>

          <span>
            Anggota
          </span>

        </div>

      </div>

    </header>
  );
}

export default MemberHeader;