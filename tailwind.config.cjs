/** Lab 7: existing Gaming Hub design tokens and the landing page entry point. */
module.exports = {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1018",
        surface: "#151E2B",
        paper: "#F5F7FA",
        muted: "#AAB7C8",
        primary: "var(--primary-color)",
        primaryHover: "#61FFDF",
        primaryActive: "#00CDA6",
        secondary: "#B200FF",
        border: "#73839A",
      },
      fontFamily: { sans: ["Arimo", "Arial", "sans-serif"] },
      maxWidth: { site: "1200px" },
      minHeight: { hero: "440px" },
      fontSize: {
        hero: ["40px", { lineHeight: "1.2" }],
        heading: ["28px", { lineHeight: "1.3" }],
      },
      boxShadow: {
        card: "0 12px 30px rgb(0 0 0 / 22%)",
        glow: "0 8px 28px rgb(0 255 204 / 12%)",
      },
    },
  },
  plugins: [],
};
