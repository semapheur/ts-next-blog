import {Inter} from '@next/font/google';
import './globals.css'
import Header from './Header'
import StyledComponentsRegistry from 'components/StyledComponentsRegistry';

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
    <html lang="en" className={inter.variable}>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className='flex flex-col h-full w-full bg-primary'>
        <script dangerouslySetInnerHTML={{__html: setInitialTheme}}/>
        <Header/>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        <div id='react-portal'/>
      </body>
    </html>
  )
}

