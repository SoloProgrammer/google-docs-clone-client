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
import { useAxiosFn } from "use-axios-http-requests-ts";
import { DOCUMENT_URI } from "../constants/urls";
import { BsCloudCheck } from "react-icons/bs";
import { LuRefreshCcw } from "react-icons/lu";
import { BiCaretDown } from "react-icons/bi";
import { IoLinkSharp, IoShareSocialSharp } from "react-icons/io5";

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
  const [saving, setSaving] = useState(false);

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
      console.log("changes receiving");

      const editor = quillRef.current?.getEditor();
      editor?.updateContents(changes);
    };
    const ChangesSavedHandler = () => setSaving(false);
    const SavingChangesHandler = () => setSaving(true);

    socket.on("receive-changes", ReceiveChangesHandler);
    socket.on("changes-saved", ChangesSavedHandler);
    socket.on("saving-changes", SavingChangesHandler);

    return () => {
      socket.off("receive-changes", ReceiveChangesHandler);
      socket.off("changes-saved", ChangesSavedHandler);
      socket.off("saving-changes", SavingChangesHandler);
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
    setSaving(true);

    if (socket) {
      socket.emit("saving-changes");
      socket.emit("send-changes", delta);
    }
  };

  return (
    <div>
      <TopBar
        isSaving={saving}
        collaborators={collaborators}
        title={document?.title || ""}
        documentId={documentId}
        sharedCount={document?.collaborators.length!}
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
  title: string;
  documentId: string;
  collaborators: Array<Partial<User>>;
  isSaving: boolean;
  sharedCount: number;
};

var isFirstRender = true;

const TopBar = ({
  title: value,
  collaborators,
  documentId,
  isSaving,
  sharedCount,
}: TopBarProps) => {
  const [title, setTitle] = useState<string>(value || DEFUALT_DOCUMENT_TITLE);
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);

  useEffect(() => {
    setTitle(value);
  }, [value]);

  const { execute: renameDocument, loading } = useAxiosFn(
    `${DOCUMENT_URI}?title=${title}&documentId=${documentId}`,
    {
      method: "PUT",
      withCredentials: true,
    },
    [title]
  );
  const debouncedValue = useDebounce(title, 500);
  useEffect(() => {
    if (
      title.trim().length < 1 ||
      title.trim() === DEFUALT_DOCUMENT_TITLE ||
      isFirstRender
    ) {
      setTimeout(() => {
        isFirstRender = false;
      }, 1000);
      return;
    }
    renameDocument();
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
        <div className="flex items-center text-gray-500 gap-2">
          {!loading && !isSaving ? (
            <Tooltip title="Document saved to cloud">
              <span className="flex items-center gap-2">
                <BsCloudCheck className="text-xl" />
                <span className="select-none">saved</span>
              </span>
            </Tooltip>
          ) : (
            <>
              <LuRefreshCcw className="text-xl" />
              <span className="select-none">saving....</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-10">
        <ShareButton sharedCount={sharedCount} />
        <AvatarGroup max={4}>
          {collaborators.map((user) => (
            <Tooltip
              key={user._id}
              title={
                <span className="flex flex-col items-center">
                  <span>{user.name}</span>
                  <span>{user.email}</span>
                </span>
              }
            >
              <Avatar
                sx={{ width: "35px", height: "35px" }}
                className="!border-[3px] !border-green-500"
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

type ShareButtonProps = {
  sharedCount: number;
};

const ShareButton = ({ sharedCount }: ShareButtonProps) => {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => {
        setOpen(!open);
      }}
      tabIndex={1}
      onBlur={() => {
        setOpen(false);
      }}
      className="relative flex items-center hover:!bg-[#b2d7ef] bg-[#c2e7ff] px-3 pl-4 rounded-[45px]"
    >
      {open && (
        <div className="min-w-56 top-[50px] right-[10px] absolute shadow-lg py-1 roudned-md bg-white border-t border-gray-200">
          <div className="px-3 gap-2 flex items-center py-2 hover:bg-gray-100">
            <span>
              <IoLinkSharp />
            </span>
            <span className="text-sm">Copy link</span>
          </div>
          <hr />
          <div className="!cursor-auto text-left py-4 px-2 text-xs text-gray-600">
            Shared with {sharedCount} peoples
          </div>
        </div>
      )}
      <span className="flex gap-1 items-center">
        <IoShareSocialSharp className="text-gray-800 mr-1" />
        <span className="text-slate-800 text-sm tracking-wide">Share</span>
      </span>
      <span className="w-[1px] bg-white h-full mx-2" />
      <span className="pl-0">
        <BiCaretDown className="text-sm" />
      </span>
    </button>
  );
};

export default TextEditor;
