"use client";

// Root-level error boundary: catches crashes in the root layout itself, so it
// cannot rely on NextIntlClientProvider (that provider may be what crashed).
// Keeps its own minimal <html>/<body> and shows both languages since the
// user's locale preference isn't reliably available here.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="uk">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            Щось пішло не так / Something went wrong
          </h1>
          <p style={{ color: "#666", maxWidth: "28rem" }}>
            Сталася критична помилка застосунку. Спробуйте оновити сторінку.
            <br />
            A critical application error occurred. Try refreshing the page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1.25rem",
              borderRadius: "0.5rem",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Спробувати ще раз / Try again
          </button>
        </div>
      </body>
    </html>
  );
}
