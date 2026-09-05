import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNewsById } from "../../services/newsService";

function NewsDetail() {
  const { id } = useParams();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getNewsById(id);

        if (!data) {
          setError("Berita tidak ditemukan.");
          setNews(null);
          return;
        }

        // Jangan tampilkan berita draft
        if (data.published !== true) {
          setError("Berita tidak ditemukan.");
          setNews(null);
          return;
        }

        setNews(data);
      } catch (error) {
        console.error(
          "Gagal mengambil detail berita:",
          error
        );

        setError(
          "Gagal memuat berita. Silakan coba lagi."
        );
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      let jsDate;

      if (date?.toDate) {
        jsDate = date.toDate();
      } else if (date instanceof Date) {
        jsDate = date;
      } else {
        jsDate = new Date(date);
      }

      if (Number.isNaN(jsDate.getTime())) {
        return "-";
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(jsDate);
    } catch {
      return "-";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="news-detail-page">

        <section className="news-detail-header">
          <div className="news-detail-header-container">
            <span>INFORMASI ORGANISASI</span>

            <h1>Memuat Berita...</h1>

            <p>Mohon tunggu sebentar.</p>
          </div>
        </section>

        <section className="news-detail-section">
          <div className="news-detail-container">

            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  border: "4px solid #e5e7eb",
                  borderTopColor: "#6c63ff",
                  borderRadius: "50%",
                  margin: "0 auto 20px",
                  animation:
                    "newsDetailSpin 0.8s linear infinite",
                }}
              />

              <p>Memuat berita...</p>
            </div>

          </div>
        </section>

        <style>
          {`
            @keyframes newsDetailSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>

      </div>
    );
  }

  // =========================
  // ERROR / NOT FOUND
  // =========================

  if (error || !news) {
    return (
      <div className="news-detail-page">

        <section className="news-detail-header">
          <div className="news-detail-header-container">

            <span>INFORMASI ORGANISASI</span>

            <h1>Berita Tidak Ditemukan</h1>

            <p>
              Berita yang Anda cari tidak tersedia.
            </p>

          </div>
        </section>

        <section className="news-detail-section">
          <div className="news-detail-container">

            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
              }}
            >
              <div
                style={{
                  fontSize: "56px",
                  marginBottom: "20px",
                }}
              >
                📰
              </div>

              <h2>
                Berita Tidak Ditemukan
              </h2>

              <p>
                {error ||
                  "Berita yang Anda cari tidak tersedia."}
              </p>

              <Link
                to="/news"
                className="back-to-news"
                style={{
                  display: "inline-block",
                  marginTop: "20px",
                }}
              >
                ← Kembali ke Berita
              </Link>
            </div>

          </div>
        </section>

      </div>
    );
  }

  // =========================
  // DETAIL BERITA
  // =========================

  return (
    <div className="news-detail-page">

      {/* HEADER */}
      <section className="news-detail-header">

        <div className="news-detail-header-container">

          <span>
            {news.category || "UMUM"}
          </span>

          <h1>
            {news.title}
          </h1>

          <p>
            {formatDate(news.createdAt)}
          </p>

        </div>

      </section>


      {/* CONTENT */}
      <section className="news-detail-section">

        <div className="news-detail-container">

          {/* IMAGE */}
          <div className="news-detail-image">

            {news.image ? (
              <img
                src={news.image}
                alt={news.title}
                loading="lazy"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "60px",
                }}
              >
                📰
              </div>
            )}

          </div>


          {/* ARTICLE */}
          <article className="news-detail-content">

            {news.content ? (
              news.content
                .split("\n")
                .map((paragraph, index) => {

                  const text = paragraph.trim();

                  if (!text) {
                    return (
                      <div
                        key={index}
                        style={{
                          height: "10px",
                        }}
                      />
                    );
                  }

                  return (
                    <p key={index}>
                      {text}
                    </p>
                  );
                })
            ) : (
              <p>
                Tidak ada isi berita.
              </p>
            )}

          </article>


          {/* AUTHOR / META */}
          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
              color: "#6f7685",
              fontSize: "14px",
            }}
          >

            <span>
              Ditulis oleh:{" "}
              <strong
                style={{
                  color: "#303542",
                }}
              >
                {news.author || "Admin"}
              </strong>
            </span>

            <span>
              Kategori:{" "}
              <strong
                style={{
                  color: "#303542",
                }}
              >
                {news.category || "Umum"}
              </strong>
            </span>

          </div>


          {/* BACK */}
          <Link
            to="/news"
            className="back-to-news"
          >
            ← Kembali ke Berita
          </Link>

        </div>

      </section>

    </div>
  );
}

export default NewsDetail;