"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value, // Initialize with value prop
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // Update parent state when content changes
    },
  });

  return (
    <div>
      <EditorContent editor={editor} className="w-full min-h-[200px] bg-white text-black p-3 rounded-md"/>
    </div>
  );
}
