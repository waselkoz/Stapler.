import React from "react";

export const mdComponents: Record<string, React.FC<{ children?: React.ReactNode; className?: string }>> = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-slate-900 mt-8 mb-4 pb-3 border-b border-slate-200 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <div className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
      <div className="w-1 h-6 rounded-full bg-blue-500 flex-shrink-0" />
      <h2 className="text-base font-bold text-slate-900 tracking-tight">{children}</h2>
    </div>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-6 mb-3">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-slate-600 leading-relaxed mb-4 text-sm">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="text-slate-900 font-bold">{children}</strong>
  ),
  em: ({ children }) => <em className="text-slate-700 not-italic">{children}</em>,
  ul: ({ children }) => <ul className="space-y-2 mb-5">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-2 mb-5 list-decimal pl-4">{children}</ol>,
  li: ({ children }) => (
    <li className="flex gap-2 text-slate-600 text-sm">
      <span className="text-blue-500 mt-0.5 flex-shrink-0">▸</span>
      <span>{children}</span>
    </li>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-slate-100">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-slate-50 transition-colors">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-slate-600 text-sm">{children}</td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 my-4 text-slate-500 italic text-sm bg-blue-50/50 py-2 rounded-r-lg">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = !!className?.includes("language-");
    const text = String(children);
    const isColor = /^#[0-9A-Fa-f]{6}$/i.test(text.trim());
    
    if (isColor) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          <span className="w-3 h-3 rounded-sm shadow-inner border border-black/10" style={{ backgroundColor: text.trim() }} />
          <code className="text-xs font-mono font-bold text-slate-700">{text}</code>
        </span>
      );
    }
    
    return isBlock ? (
      <code className="block bg-slate-900 border border-slate-800 text-slate-50 p-5 rounded-xl text-xs font-mono overflow-x-auto mb-6 leading-relaxed shadow-inner">
        {children}
      </code>
    ) : (
      <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono font-bold border border-blue-100">
        {children}
      </code>
    );
  },
  hr: () => <hr className="border-slate-200 my-8" />,
};
