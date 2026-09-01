"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export const JsonViewer: React.FC<{ content: string }> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  let formattedJson = content;
  let parsedObject: any = null;

  try {
    parsedObject = JSON.parse(content);
    formattedJson = JSON.stringify(parsedObject, null, 2);
  } catch {
    formattedJson = content;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl border border-border bg-surface-raised/40 p-4 font-mono text-xs overflow-x-auto">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text-secondary text-[11px] font-semibold transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? "Copied" : "Copy JSON"}</span>
      </button>

      <pre className="text-accent dark:text-accent-light leading-relaxed">
        {formattedJson}
      </pre>
    </div>
  );
};
