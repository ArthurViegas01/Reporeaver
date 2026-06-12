const REPO_URL = "https://github.com/ArthurViegas01/devscope";

export default function Footer() {
  return (
    <footer className="mx-auto mt-8 max-w-6xl px-4 pb-10">
      <div className="border-t border-violet-500/10 pt-6 text-center text-xs text-ink-400/60">
        devscope · GitHub portfolio intelligence via MCP · built by Arthur Viegas ·{" "}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="text-accent-400 underline-offset-2 hover:underline"
        >
          source on GitHub
        </a>
      </div>
    </footer>
  );
}
