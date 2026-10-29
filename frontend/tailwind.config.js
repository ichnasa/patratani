export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#E6E4DA",
        surface: {
          DEFAULT: "#EFEEE7",
          card: "#EFEEE7",
          green: "#DDE0D4",
          light: "#F7F6F2",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          secondary: "#595959",
          muted: "#767676",
          light: "#E6E4DA",
        },
        primary: {
          DEFAULT: "#0F3520",
          hover: "#092214",
          dark: "#1A1A1A",
          light: "#D5D8CC",
          50: "#DDE0D4",
        },
        border: {
          DEFAULT: "#CFCDC2",
          light: "#DAD8CD",
        },
        status: {
          open: "#64748B",
          "open-bg": "#F3F4F6",
          bidding: "#D97706",
          "bidding-bg": "#FEF3C7",
          awarded: "#0D9488",
          "awarded-bg": "#CCFBF1",
          "paid-held": "#D97706",
          "paid-held-bg": "#FEF3C7",
          handover: "#2563EB",
          "handover-bg": "#DBEAFE",
          completed: "#16A34A",
          "completed-bg": "#DCFCE7",
          disputed: "#DC2626",
          "disputed-bg": "#FEE2E2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
