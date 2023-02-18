import Link from 'next/link';

import SearchHeader from './SearchHeader';
import ThemeToggle from 'components/ThemeToggle';
import MobileNav from 'components/MobileNav';

export default function Header() {
  const nav = [
    {'title': 'Notes', 'url': '/notes'},
    {'title': 'Apps', 'url': '/apps'}
  ]

  return (
    <header className='grid grid-cols-[auto_1fr_auto] justify-items-center content-start gap-4
      p-2 bg-primary/50 border-b border-b-secondary backdrop-blur-sm z-[1] transition-[height]'
    >
      <>
        <Link key='logo' href='/' className='text-text hover:text-secondary text-4xl leading-none'>
          Γ
        </Link>
        <MobileNav width='1.75rem' bar='0.25rem' gap='0.5rem'> 
          {nav.map((n) => (
            <Link key={n.url} href={n.url} className='text-2xl text-text hover:text-secondary'>
                {n.title}
            </Link>
          ))}
        </MobileNav>
        <div className='flex items-start gap-2'>
          <ThemeToggle key='theme' />
          <SearchHeader key='search' />
        </div>
      </>
    </header>
  )
}