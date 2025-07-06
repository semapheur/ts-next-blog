import Script from "next/script"
import "./app.css"
import "katex/dist/katex.min.css"
import Header from "./Header"

// Metadata
export const metadata = {
  title: "Gelik blog",
  icons: {
    icon: "/favicon.ico",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: 0,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const setInitialTheme = `
    function getUserPreference() {
      // Check if the user has explicitly picked light or dark theme
      if (window.localStorage.getItem('theme')) {
        return window.localStorage.getItem('theme');
      }
      // Check if the media query prefers light or dark theme
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
    }
    const theme = getUserPreference();
    document.body.dataset.theme = theme;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  `

  return (
    <html lang="en">
      <head>
        <Script
          id="script-set-initial-theme"
          dangerouslySetInnerHTML={{ __html: setInitialTheme }}
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://tikzjax.com/v1/fonts.css"
        />
      </head>
      <body className="flex flex-col bg-primary">
        <Header />
        {children}
      </body>
    </html>
  )
}
