"use client";

type UrlInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
};

export function UrlInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Paste a YouTube URL…",
}: UrlInputProps) {
  return (
    <div className="flex w-full gap-2">
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder={placeholder}
        className="min-h-10 flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400"
        aria-label="YouTube video URL"
      />
      <button
        type="button"
        onClick={onSubmit}
        className="rounded bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-900"
      >
        Load
      </button>
    </div>
  );
}
