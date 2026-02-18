export function LocalPlayerPlaceholder() {
    return (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="text-center p-6">
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Local Player Coming Soon</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                    This feature is currently in development.
                    <br />
                    Switch back to YouTube mode to continue analyzing videos.
                </p>
            </div>
        </div>
    );
}
