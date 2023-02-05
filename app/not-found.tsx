import Blob from 'components/Blob'

export default function NotFound() {

  return (
    <main className='h-full min-h-0 grid grid-cols-[1fr_1fr] bg-main'>
      <Blob className='h-full'/>
      <div className='flex flex-col justify-center text-text'>
        <p className='relative text-9xl font-bold tracking-wider text-shadow-3d'>
          404
        </p>
        <p>You have entered the void...</p>
      </div>
    </main>
  );
}