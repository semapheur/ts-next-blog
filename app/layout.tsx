import {Inter} from 'next/font/google'
import './globals.css'
import Header from './Header'
import StyledComponentsRegistry from 'components/StyledComponentsRegistry'

// Metadata
export const metadata = {
  title: 'Gelik blog',
  icons: {
    icon: '/favicon.ico'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 0
}

// Font
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
});

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
    <html lang='en' className={inter.variable}>
      <head />
      <body className='flex flex-col h-full w-full bg-primary'>
        <script dangerouslySetInnerHTML={{__html: setInitialTheme}}/>
        <Header/>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  )
}