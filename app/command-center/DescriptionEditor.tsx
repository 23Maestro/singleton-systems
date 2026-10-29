"use client";

import { taskDescription } from "@/lib/command-center-description";
import {useEffect,useRef} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TextB, TextItalic, TextUnderline, TextStrikethrough, ListNumbers, ListBullets, CheckSquare, Keyboard } from "@phosphor-icons/react";

export default function DescriptionEditor({value,onChange,onBack,readOnly=false}:{value:string;onChange:(value:string)=>void;onBack:()=>void;readOnly?:boolean}) {
  const sheet=useRef<HTMLElement>(null);
  useEffect(() => {
    const viewport=window.visualViewport;
    function resize() {
      if(!sheet.current || !viewport || window.innerWidth > 680)return;
      const available=viewport.height-Math.max(0,sheet.current.getBoundingClientRect().top-viewport.offsetTop);
      sheet.current.style.maxHeight=`${Math.max(180,available)}px`;
    }
    resize();viewport?.addEventListener("resize",resize);viewport?.addEventListener("scroll",resize);
    return ()=>{viewport?.removeEventListener("resize",resize);viewport?.removeEventListener("scroll",resize);};
  },[]);
  const editor=useEditor({
    immediatelyRender:false,
    autofocus:"end",
    shouldRerenderOnTransaction:true,
    extensions:[StarterKit,Markdown,TaskList,TaskItem.extend({renderMarkdown(node, helpers) { const text = helpers.renderChildren(node.content ?? [], "\n").trim(); return `- [${node.attrs?.checked ? "x" : " "}] ${text.replace(/\n/g, "\n  ")}`; }}).configure({nested:true})],
    content:taskDescription(value),contentType:"markdown",editable:!readOnly,
    editorProps:{attributes:{role:"textbox","aria-label":"Description text","aria-multiline":"true"}},
    onUpdate:({editor})=>onChange(taskDescription(editor.getMarkdown())),
  });
  return <section ref={sheet} className="cc-description-sheet" aria-label="Description editor" onKeyDown={(event)=>{if(event.key==="Escape"){event.preventDefault();event.stopPropagation();onBack();}}}>
    <header><Button type="button" variant="ghost" aria-label="Back to task" onClick={onBack}><ArrowLeft size={22}/></Button><h2>Description</h2><span/></header>
    <EditorContent editor={editor}/>
    <footer aria-label="Description formatting" onMouseDown={(event) => event.preventDefault()}>
      <Button type="button" variant="ghost" aria-label="Bold" aria-pressed={editor?.isActive("bold")??false} disabled={readOnly} onClick={()=>editor?.chain().focus().toggleBold().run()}><TextB size={24}/></Button>
      <Button type="button" variant="ghost" aria-label="Italic" aria-pressed={editor?.isActive("italic")??false} disabled={readOnly} onClick={()=>editor?.chain().focus().toggleItalic().run()}><TextItalic size={24}/></Button>
      <Button type="button" variant="ghost" aria-label="Underline" aria-pressed={editor?.isActive("underline")??false} disabled={readOnly} onClick={()=>editor?.chain().focus().toggleUnderline().run()}><TextUnderline size={22}/></Button>
      <Button type="button" variant="ghost" aria-label="Strikethrough" aria-pressed={editor?.isActive("strike")??false} disabled={readOnly} onClick={()=>editor?.chain().focus().toggleStrike().run()}><TextStrikethrough size={22}/></Button>
      <Button type="button" variant="ghost" aria-label="Heading 1" aria-pressed={editor?.isActive("heading",{level:1})??false} disabled={readOnly} onClick={()=>editor?.chain().focus().toggleHeading({level:1}).run()}>H1</Button>
      <Button type="button" variant="ghost" aria-label="Heading 2" aria-pressed={editor?.isActive("heading",{level:2})??false} disabled={readOnly} onClick={()=>editor?.chain().focus().toggleHeading({level:2}).run()}>H2</Button>
      <Button type="button" variant="ghost" aria-label="Numbered list" aria-pressed={editor?.isActive("orderedList")??false} disabled={readOnly} onClick={()=>editor?.chain().focus().toggleOrderedList().run()}><ListNumbers size={22}/></Button>
      <Button type="button" variant="ghost" aria-label="Bulleted list" aria-pressed={editor?.isActive("bulletList")??false} disabled={readOnly} onClick={()=>editor?.chain().focus().toggleBulletList().run()}><ListBullets size={22}/></Button>
      <Button type="button" variant="ghost" aria-label="Checklist" aria-pressed={editor?.isActive("taskList")??false} disabled={readOnly} onClick={()=>editor?.chain().focus().toggleTaskList().run()}><CheckSquare size={22}/></Button>
      <Button type="button" variant="ghost" aria-label="Dismiss keyboard" onClick={()=>editor?.commands.blur()}><Keyboard size={22}/></Button>
    </footer>
  </section>;
}
