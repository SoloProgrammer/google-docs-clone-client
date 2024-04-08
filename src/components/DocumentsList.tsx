import { Document } from "../types/types";
import { Link } from "react-router-dom";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaUserGroup } from "react-icons/fa6";
import { useAuth } from "../context/AuthProvider";

type DocumentsListProps = {
  documents: Array<Document>;
};

const DocumentsList = ({ documents }: DocumentsListProps) => {
  const { user } = useAuth();
  return (
    <div className="mt-10">
      {documents.map((doc) => (
        <Link to={`/document/${doc._id}`} key={doc._id}>
          <div className="cursor-pointer flex w-full items-center py-2 px-5 transitio hover:bg-[#e8f0fe] ">
            <div className=" flex flex-[3]">
              <div>
                <img width={20} src="file.png" alt="logo" />
              </div>
              <p className="pl-7 text-sm tracking-wider">
                {doc.title || "Untitled document"}
              </p>
              {doc.collaborators.length > 0 && (
                <FaUserGroup className="ml-4 text-gray-400 text-xl" />
              )}
            </div>
            <div className="flex flex-[2] justify-between items-center">
              <p className="text-gray-500">
                {doc.author.name === user?.name ? "me" : doc.author.name}
              </p>
              <p className="mr-20 text-sm text-gray-500 tracking-wider">
                {new Date(doc.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex-[1] flex justify-end text-[22px] text-slate-600">
              <span className="p-2 rounded-full hover:bg-gray-300">
                <HiOutlineDotsVertical />
              </span>
            </div>
          </div>
          <hr className="border-[1px] border-b border-[#e3e3e3]" />
        </Link>
      ))}
    </div>
  );
};

export default DocumentsList;
