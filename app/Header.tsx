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
    <header className='flex items-start justify-between gap-4
      p-2 bg-primary/50 border-b border-b-secondary backdrop-blur-sm z-[1]'
    >
      <>
        <Link key='logo' href='/' className='text-text hover:text-secondary text-4xl'
        >
          Γ
        </Link>
        <MobileNav width='2rem' bar='0.3rem' gap='0.5rem'> 
          {nav.map((n) => (
            <Link key={n.url} href={n.url} className='text-2xl text-text hover:text-secondary'>
                {n.title}
            </Link>
          ))}
        </MobileNav>
        <div className='h-full flex items-center gap-2'>
          <ThemeToggle key='theme' />
          <SearchHeader key='search' />
        </div>
      </>
    </header>
  )
}