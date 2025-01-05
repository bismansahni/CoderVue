//
//
//
// import type { Metadata } from "next";
// import localFont from "next/font/local";
// import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs";
// import "regenerator-runtime/runtime";
//
// // Load custom fonts with multiple weights for bold look
// const geistSans = localFont({
//   src: [
//     {
//       path: "./fonts/GeistVF.woff",
//       weight: "100 900", // Regular to Bold
//     },
//   ],
//   variable: "--font-geist-sans",
// });
//
// const geistMono = localFont({
//   src: [
//     {
//       path: "./fonts/GeistMonoVF.woff",
//       weight: "100 900", // Regular to Bold
//     },
//   ],
//   variable: "--font-geist-mono",
// });
//
// export const metadata: Metadata = {
//   title: "CoderVue",
//   description: "Your realtime hands-on AI coding interviewer",
//     icons: {
//         icon: "/logo.png"
//     },
// };
//
// export default function RootLayout({
//                                      children,
//                                    }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//       <ClerkProvider>
//         <html lang="en">
//         <body
//             className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//         >
//         {children}
//         </body>
//         </html>
//       </ClerkProvider>
//   );
// }



import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import "regenerator-runtime/runtime";

// Import Inter font from Google Fonts
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap", // Optimize font loading
});

export const metadata: Metadata = {
    title: "CoderVue",
    description: "Your realtime hands-on AI coding interviewer",
    icons: {
        icon: "/logo.png",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body className={`${inter.variable} antialiased`}>
            {children}
            </body>
            </html>
        </ClerkProvider>
    );
}
