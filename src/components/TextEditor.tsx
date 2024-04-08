import { ChangeEvent, useEffect, useRef, useState } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { Socket, io } from "socket.io-client";
import { DeltaStatic, Sources } from "quill";
import { useDebounce } from "../hooks/use-debounce";
import { useAuth } from "../context/AuthProvider";
import { Document, User } from "../types/types";
import { DEFUALT_DOCUMENT_TITLE } from "../constants/strings";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { Link } from "react-router-dom";
import { Tooltip } from "@mui/material";

type TextEditorProps = {
  documentId: string;
};

const TextEditor = ({ documentId }: TextEditorProps) => {
  const { user } = useAuth();

  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const quillRef = useRef<null | ReactQuill>(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [delta, setDelta] = useState<DeltaStatic | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [collaborators, setCollaborators] = useState<Array<Partial<User>> | []>(
    []
  );

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    return () => {
      s.emit("exit-document", documentId, user?._id);
      s.disconnect();
    };
  }, []);

  window.addEventListener("beforeunload", () => {
    socket?.emit("exit-document", documentId, user?._id);
  });

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

    socket.on("collaborators", setCollaborators);

    socket.once("load-document", (document, collaborators) => {
      setCollaborators(collaborators);
      setDocument(document);
      editor?.setContents(document.data);
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
      <TopBar
        collaborators={collaborators}
        title={document?.title}
        documentId={documentId}
      />
      <ReactQuill
        ref={quillRef}
        modules={modules}
        onChange={handleQuillChange}
      />
    </div>
  );
};

type TopBarProps = {
  title: string | undefined;
  documentId: string;
  collaborators: Array<Partial<User>>;
};

const TopBar = ({ title: value, collaborators }: TopBarProps) => {
  const [title, setTitle] = useState<string>(value || DEFUALT_DOCUMENT_TITLE);
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);

  const debouncedValue = useDebounce(title, 500);

  useEffect(() => {
    if (title.trim().length < 1 || title.trim() === DEFUALT_DOCUMENT_TITLE)
      return;
    console.log(debouncedValue);
  }, [debouncedValue]);

  return (
    <div className="z-10 flex px-3 py-4 bg-white justify-between sticky top-0">
      <div className="flex items-center gap-3">
        <Link to={"/"}>
          <img
            width={40}
            src="https://cdn.iconscout.com/icon/free/png-256/free-google-docs-7662284-6297220.png"
            alt=""
          />
        </Link>
        <div>
          <input
            tabIndex={1}
            onFocus={() => {
              title === DEFUALT_DOCUMENT_TITLE && setTitle("");
            }}
            onBlur={() => {
              if (title.trim().length < 1) {
                setTitle(DEFUALT_DOCUMENT_TITLE);
              }
            }}
            className="px-2 py-1"
            value={title}
            onChange={handleTitleChange}
            type="text"
          />
        </div>
      </div>
      <div>
        <AvatarGroup max={4}>
          {collaborators.map((user) => (
            <Tooltip title={user.name}>
              <Avatar
                sx={{ width: "35px", height: "35px" }}
                className="!border-[3px] !border-green-500"
                key={user._id}
                alt="Remy Sharp"
                src={user.avatar}
              />
            </Tooltip>
          ))}
        </AvatarGroup>
      </div>
    </div>
  );
};

export default TextEditor;
