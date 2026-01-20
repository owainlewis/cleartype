'use client';

import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface EditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onEditorReady?: (editor: TiptapEditor) => void;
}

export default function Editor({ content, onContentChange, onEditorReady }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Keep only minimal features
        heading: {
          levels: [1, 2, 3],
        },
        // Disable features we don't need
        codeBlock: false,
        code: false,
        horizontalRule: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'editor-content outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
  });

  // Update editor content when switching documents
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // Focus editor on mount and notify parent
  useEffect(() => {
    if (editor) {
      editor.commands.focus();
      onEditorReady?.(editor);
    }
  }, [editor, onEditorReady]);

  return (
    <div className="flex-1 flex justify-center overflow-auto">
      <div className="w-full max-w-[700px] h-full p-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
