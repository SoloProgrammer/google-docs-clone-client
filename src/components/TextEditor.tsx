import { useEffect, useRef, useState } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { Socket, io } from "socket.io-client";
import { DeltaStatic, Sources } from "quill";
import { useDebounce } from "../hooks/use-debounce";
import { useAuth } from "../context/AuthProvider";

type TextEditorProps = {
  documentId: string;
};

const TextEditor = ({ documentId }: TextEditorProps) => {
  const { user } = useAuth();


  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const quillRef = useRef<null | ReactQuill>(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [delta, setDelta] = useState<DeltaStatic | null>(null);

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const deltaChange = useDebounce<DeltaStatic | null>(delta);
  useEffect(() => {
    if (!socket) return;
    const editor = quillRef.current?.getEditor();
    socket.emit("save-changes", editor?.getContents());
  }, [deltaChange]);

  useEffect(() => {
    if (!socket) return;
    const editor = quillRef.current?.getEditor();
    editor?.disable();
    editor?.setText("Loading...");

    socket.emit("get-document", documentId, user?._id);

    socket.once("load-document", (document) => {
      editor?.setContents(document);
      editor?.enable();
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const ReceiveChangesHandler = (changes: DeltaStatic) => {
      const editor = quillRef.current?.getEditor();
      editor?.updateContents(changes);
    };
    socket.on("receive-changes", ReceiveChangesHandler);

    return () => {
      socket.off("receive-changes", ReceiveChangesHandler);
    };
  }, [socket]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ["code-block", "link", "image"],
      ["clean"],
    ],
  };

  const handleQuillChange = (
    _: string,
    delta: DeltaStatic,
    source: Sources
  ) => {
    if (source !== "user") return;

    setDelta(delta);

    if (socket) {
      socket.emit("send-changes", delta);
    }
  };

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        modules={modules}
        onChange={handleQuillChange}
      />
    </div>
  );
};

export default TextEditor;
