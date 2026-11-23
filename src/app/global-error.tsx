"use client";

/** Last-resort boundary: replaces the root layout, so it brings its own html. */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "1.5rem",
          background: "#f7f8fa",
          color: "#111827",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
            Yuricart is having a problem
          </h1>
          <p style={{ color: "#4b5563" }}>
            Please reload the page. If it keeps happening, message us on
            WhatsApp.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1rem",
              background: "#003B73",
              color: "#fff",
              border: 0,
              borderRadius: 9999,
              padding: "0.75rem 1.5rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
