import "./globals.css";

export const metadata = {
  title: "PartNear — Find Hardware. Near You.",
  description: "Find hardware parts in nearby shops with real-time availability."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
