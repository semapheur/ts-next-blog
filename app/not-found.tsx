import Blob from "lib/components/Blob"

export default function NotFound() {
  return (
    <main className="grid h-full min-h-0 grid-cols-[1fr_1fr] bg-main">
      <Blob className="h-full" />
      <div className="flex flex-col justify-center text-text">
        <p className="relative font-bold text-9xl text-shadow-3d tracking-wider">
          404
        </p>
        <p>You have entered the void...</p>
      </div>
    </main>
  )
}
