import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../../services/newsService";

function News() {
  const [newsData, setNewsData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] =
    useState("Semua");

  /*
  |--------------------------------------------------------------------------
  | LOAD NEWS FROM FIRESTORE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getNews();

        /*
         * Hanya tampilkan berita yang
         * statusnya dipublikasikan.
         */

        const publishedNews = data.filter(
          (item) => item.published === true
        );

        setNewsData(publishedNews);
      } catch (error) {
        console.error(
          "Gagal mengambil berita:",
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
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      let jsDate;

      /*
       * Firestore Timestamp
       */

      if (date?.toDate) {
        jsDate = date.toDate();
      }

      /*
       * JavaScript Date
       */

      else if (date instanceof Date) {
        jsDate = date;
      }

      /*
       * String / lainnya
       */

      else {
        jsDate = new Date(date);
      }

      if (Number.isNaN(jsDate.getTime())) {
        return "-";
      }

      return new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ).format(jsDate);

    } catch {
      return "-";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CATEGORY LIST
  |--------------------------------------------------------------------------
  */

  const categories = useMemo(() => {
    const categoryList = newsData
      .map((item) => item.category)
      .filter(Boolean);

    return [
      "Semua",
      ...new Set(categoryList),
    ];
  }, [newsData]);

  /*
  |--------------------------------------------------------------------------
  | FILTER NEWS
  |--------------------------------------------------------------------------
  */

  const filteredNews = useMemo(() => {
    if (activeCategory === "Semua") {
      return newsData;
    }

    return newsData.filter(
      (item) =>
        item.category === activeCategory
    );
  }, [
    newsData,
    activeCategory,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="news-page">

        <section className="page-header">

          <div className="page-header-container">

            <span>
              INFORMASI ORGANISASI
            </span>

            <h1>
              Berita & Informasi
            </h1>

            <p>
              Temukan berita, kegiatan, dan
              informasi terbaru mengenai
              organisasi siswa.
            </p>

          </div>

        </section>

        <section className="news-page-section">

          <div className="news-page-container">

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
                    "newsSpin 0.8s linear infinite",
                }}
              />

              <p>
                Memuat berita...
              </p>

            </div>

          </div>

        </section>

        <style>
          {`
            @keyframes newsSpin {
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

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="news-page">

        <section className="page-header">

          <div className="page-header-container">

            <span>
              INFORMASI ORGANISASI
            </span>

            <h1>
              Berita & Informasi
            </h1>

            <p>
              Temukan berita, kegiatan, dan
              informasi terbaru mengenai
              organisasi siswa.
            </p>

          </div>

        </section>

        <section className="news-page-section">

          <div className="news-page-container">

            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
              }}
            >

              <h2>
                Gagal Memuat Berita
              </h2>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                style={{
                  marginTop: "20px",
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Coba Lagi
              </button>

            </div>

          </div>

        </section>

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="news-page">

      {/* HEADER */}

      <section className="page-header">

        <div className="page-header-container">

          <span>
            INFORMASI ORGANISASI
          </span>

          <h1>
            Berita & Informasi
          </h1>

          <p>
            Temukan berita, kegiatan, dan
            informasi terbaru mengenai
            organisasi siswa.
          </p>

        </div>

      </section>


      {/* NEWS */}

      <section className="news-page-section">

        <div className="news-page-container">

          {/* FILTER */}

          {categories.length > 1 && (
            <div className="news-filter">

              {categories.map(
                (category) => (

                  <button
                    key={category}
                    type="button"
                    className={
                      activeCategory ===
                      category
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                  >
                    {category}
                  </button>

                )
              )}

            </div>
          )}


          {/* EMPTY */}

          {filteredNews.length === 0 ? (

            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
              }}
            >

              <div
                style={{
                  fontSize: "50px",
                  marginBottom: "20px",
                }}
              >
                📰
              </div>

              <h2>
                Belum Ada Berita
              </h2>

              <p>
                Belum ada berita yang
                dipublikasikan untuk kategori
                ini.
              </p>

            </div>

          ) : (

            /* GRID */

            <div className="news-page-grid">

              {filteredNews.map(
                (news) => (

                  <article
                    className="news-page-card"
                    key={news.id}
                  >

                    {/* IMAGE */}

                    <div className="news-page-image">

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
                            fontSize: "40px",
                          }}
                        >
                          📰
                        </div>

                      )}

                      <span>
                        {news.category ||
                          "Umum"}
                      </span>

                    </div>


                    {/* CONTENT */}

                    <div className="news-page-content">

                      {/* META */}

                      <div className="news-meta">

                        <span>
                          {news.category ||
                            "Umum"}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {formatDate(
                            news.createdAt
                          )}
                        </span>

                      </div>


                      {/* TITLE */}

                      <h2>
                        {news.title}
                      </h2>


                      {/* DESCRIPTION */}

                      <p>
                        {news.content
                          ? news.content.length >
                            150
                            ? `${news.content.substring(
                                0,
                                150
                              )}...`
                            : news.content
                          : "Tidak ada deskripsi berita."}
                      </p>


                      {/* LINK */}

                      <Link
                        to={`/news/${news.id}`}
                        className="news-page-link"
                      >
                        Baca Selengkapnya →
                      </Link>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </div>

      </section>

    </div>
  );
}

export default News;