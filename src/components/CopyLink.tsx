"use client";

import { useState, useSyncExternalStore } from "react";

const noop = () => () => {};

export function CopyLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  // На сервере адрес сайта неизвестен, поэтому домен подставляем уже в браузере
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const url = `${origin}${path}`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input readOnly value={url} className="input font-mono text-sm" onFocus={(e) => e.target.select()} />
      <button
        type="button"
        className="btn-ghost shrink-0"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        }}
      >
        {copied ? "Скопировано ✓" : "Копировать"}
      </button>
    </div>
  );
}
