import { ScrubberShell } from "@/components/ScrubberShell";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Film-style scrubber
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Load a YouTube video to analyze motion with step and slow-mo controls.
          </p>
        </header>
        <ScrubberShell />
        <footer className="mt-8 border-t border-zinc-200 pt-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Created by <a
            href="https://da.nielyi.com"
            className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Daniel Yi
          </a>

        </footer>
      </div>
    </main>
  );
}
