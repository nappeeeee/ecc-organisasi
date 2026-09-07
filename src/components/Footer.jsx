function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div>
          <p>
            Website resmi ecc organisasi.
          </p>
        </div>

        <div>
          <h4>Menu</h4>
          <p>Beranda</p>
          <p>Struktur Organisasi</p>
          <p>Berita</p>
        </div>

        <div>
          <h4>Kontak</h4>
          <p>Email: -</p>
          <p>
            Instagram:{" "}
            <a
              href="https://www.instagram.com/ecc_smala/"
              target="_blank"
              rel="noopener noreferrer"
            >
              @ecc_smala
            </a>
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 ENGLISH CONVERSATION CLUB. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;