import localFont from "next/font/local";

// Self-hosted, OFL. Licences sit next to the files in src/fonts/.
export const vazirmatn = localFont({
  src: [
    { path: "../fonts/vazirmatn/Vazirmatn-FD-Regular.woff2", weight: "400" },
    { path: "../fonts/vazirmatn/Vazirmatn-FD-Medium.woff2", weight: "500" },
    { path: "../fonts/vazirmatn/Vazirmatn-FD-SemiBold.woff2", weight: "600" },
    { path: "../fonts/vazirmatn/Vazirmatn-FD-Bold.woff2", weight: "700" },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const inter = localFont({
  src: [
    { path: "../fonts/inter/Inter-Regular.woff2", weight: "400" },
    { path: "../fonts/inter/Inter-Medium.woff2", weight: "500" },
    { path: "../fonts/inter/Inter-SemiBold.woff2", weight: "600" },
    { path: "../fonts/inter/Inter-Bold.woff2", weight: "700" },
  ],
  variable: "--font-inter",
  display: "swap",
});
