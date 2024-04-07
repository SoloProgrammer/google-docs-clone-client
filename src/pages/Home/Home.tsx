import styles from "./Home.module.css";
import { LuMenu } from "react-icons/lu";
import { GrGrid } from "react-icons/gr";
import { LiaThListSolid } from "react-icons/lia";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LOGIN_URI, SERVER_URL } from "../../constants/urls";
import { useAuth } from "../../context/AuthProvider";
import PageLoader, { Loader } from "../../components/PageLoader";
import { useAxios } from "use-axios-http-requests-ts";
import { Document } from "../../types/types";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaUserGroup } from "react-icons/fa6";

const Home = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const NEW_DOCUMENT_URI = `/document/${crypto.randomUUID()}`;
  const handleNewDocument = () => {
    setLoading(true);
    if (!isAuthenticated) {
      window.open(LOGIN_URI, "_self");
    } else {
      setTimeout(() => {
        setLoading(false);
        navigate(NEW_DOCUMENT_URI);
      }, 1000);
    }
  };

  type ApiResponse = {
    documents: Array<Document>;
  };
  const DOCUMENTS_URI = `${SERVER_URL}/api/documents`;
  const { data, loading: loadingDocuments } = useAxios<ApiResponse>(
    DOCUMENTS_URI,
    [],
    {
      withCredentials: true,
    }
  );

  return (
    <div className={styles.container}>
      {loading && <PageLoader />}
      <nav className={styles.nav}>
        <div className={styles.left}>
          <span className={styles.IconBtn}>
            <LuMenu />
          </span>
          <div className={styles.logo}>
            <img
              width={35}
              src="https://cdn.iconscout.com/icon/free/png-256/free-google-docs-7662284-6297220.png"
              alt="logo"
            />
            <span>Docs</span>
          </div>
        </div>
        <div className={styles.search}>
          <input type="text" placeholder="Search" />
        </div>
        <div className={styles.profile}>
          {!isLoading ? (
            !isAuthenticated ? (
              <>
                <a
                  href={LOGIN_URI}
                  className="shadow-md px-6 py-2 rounded-sm hover:border-transparent text-gray-700 hover:bg-gray-100  flex items-center gap-2"
                >
                  <span>Login</span>
                  <img
                    width={18}
                    src="https://cdn.iconscout.com/icon/free/png-256/free-google-1772223-1507807.png"
                    alt=""
                  />
                </a>
              </>
            ) : (
              <>
                <img src={user?.avatar} alt="profile" />
              </>
            )
          ) : (
            <></>
          )}
        </div>
      </nav>
      <div className={styles.start}>
        <h1>Start a new document</h1>
        <img
          onClick={handleNewDocument}
          src="https://ssl.gstatic.com/docs/templates/thumbnails/docs-blank-googlecolors.png"
          alt="blank_page"
        />
      </div>
      <div className={styles.documents}>
        <div className={styles.top}>
          <h1 className="font-medium">Recent Documents</h1>
          <div className={styles.actions}>
            <span className={styles.listIcon}>
              <LiaThListSolid />
            </span>
            <span className={styles.gridIcon}>
              <GrGrid />
            </span>
          </div>
        </div>
        {loadingDocuments ? (
          <Loader />
        ) : !data ? (
          <div className="py-10 shadow-md mt-10 text-center">
            <p className="text-xl">No text documents yet</p>
            <p className="text-gray-600 pt-2">
              Select a blank document or choose another template above to get
              started
            </p>
          </div>
        ) : (
          <div className="mt-10">
            {data?.documents.map((doc) => (
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
                  <div className="flex flex-[2] justify-between">
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
        )}
      </div>
    </div>
  );
};

export default Home;
