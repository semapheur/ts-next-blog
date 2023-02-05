import SearchHeader from './SearchHeader';
import ThemeToggle from 'components/ThemeToggle';
import Link from 'next/link';

export default function Header() {
  const nav = [
    {'title': 'Notes', 'url': '/notes'},
    {'title': 'Apps', 'url': '/apps'}
  ]

  return (
    <header className='grid grid-cols-[auto_1fr_auto_auto] items-center justify-start gap-4
      p-2 bg-primary/50 border-b border-b-secondary backdrop-blur-sm z-[1]'
    >
      <Link key='logo' href='/' className='text-text hover:text-secondary text-4xl'
      >
        Γ
      </Link>
      <nav key='nav' className='flex items-center gap-4'>
        {nav.map((n) => (
          <Link key={n.url} href={n.url} className='text-2xl text-text hover:text-secondary align-middle'>
              {n.title}
          </Link>
        ))}
      </nav>
      <ThemeToggle key='theme' />
      <SearchHeader key='search' />
    </header>
  )
}