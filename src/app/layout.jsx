import { Audiowide, Average_Sans } from "next/font/google";
import "../css/global.css";
import Header from "@/components/global/Header";

const audiowide = Audiowide({
  variable: "--audiowide",
  subsets: ["latin"],
  weight: "400",
});

const averageSans = Average_Sans({
  variable: "--average-sans",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "Magistick",
  description: "Application de gestion de projets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${audiowide.variable} ${averageSans.variable}`}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
