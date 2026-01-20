'use client';

import { useEffect, useRef } from 'react';

interface EditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export default function Editor({ content, onContentChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when switching documents
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  return (
    <div className="flex-1 flex justify-center overflow-auto">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="Start writing..."
        className="editor-textarea w-full max-w-[700px] h-full p-8 outline-none"
      />
    </div>
  );
}
