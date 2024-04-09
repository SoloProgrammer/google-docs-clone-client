import styles from "./Home.module.css";
import { GrGrid } from "react-icons/gr";
import { LiaThListSolid } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LOGIN_URI, SERVER_URL } from "../../constants/urls";
import { useAuth } from "../../context/AuthProvider";
import PageLoader, { Loader } from "../../components/PageLoader";
import { useAxios } from "use-axios-http-requests-ts";
import { Document } from "../../types/types";
import DocumentsList from "../../components/DocumentsList";
import { TbCaretDownFilled } from "react-icons/tb";
import { MdOutlineCheck } from "react-icons/md";
import Navbar from "../../components/HomeNavbar/Navbar";

const Home = () => {
  const { isAuthenticated } = useAuth();
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

  const FILTER_OPTIONS = ["Owned by anyone", "Owned by me", "Not owned by me"];
  const [selectedOption, setSelectedOption] = useState<string>(
    FILTER_OPTIONS[0]
  );
  const [open, setOpen] = useState(false);

  const handleCloseFilterOptions = () => setOpen(false);

  const DOCUMENTS_URI = `${SERVER_URL}/api/documents?filterby=${selectedOption}`;
  const { data, loading: loadingDocuments } = useAxios<ApiResponse>(
    DOCUMENTS_URI,
    [selectedOption],
    {
      withCredentials: true,
    }
  );

  function isDocumentsEmpty() {
    return !data || data.documents.length < 1;
  }

  return (
    <div className={styles.container}>
      {loading && <PageLoader />}
      <Navbar />
      <div className={styles.start}>
        <h1>Start a new document</h1>
        <div className="min-h-52 min-w-10">
          <img
            onClick={handleNewDocument}
            src="https://ssl.gstatic.com/docs/templates/thumbnails/docs-blank-googlecolors.png"
            alt="blank_page"
          />
        </div>
      </div>
      <div className={styles.documents}>
        <div className="flex">
          <h1 className="flex-1 text-gray-700 font-[500] ml-4">
            Recent Documents
          </h1>
          <div
            tabIndex={1}
            onBlur={handleCloseFilterOptions}
            className="flex text-slate-700 tracking-wider text-[14px] ml-0 flex-[1]"
          >
            <div
              onClick={() => {
                setOpen((prev) => !prev);
              }}
              className={`relative px-3 cursor-pointer flex gap-2 items-center rounded-sm ${
                open ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <span>{selectedOption}</span>
              <span>
                <TbCaretDownFilled className="text-gray-500" />
              </span>
              {open && (
                <FilterOptions
                  selectedOption={selectedOption}
                  options={FILTER_OPTIONS}
                  setSelectedOption={setSelectedOption}
                />
              )}
            </div>
            <div className="ml-[3rem]">Created At</div>
          </div>
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
          <div className="flex justify-center mt-20">
            <Loader />
          </div>
        ) : !data || isDocumentsEmpty() ? (
          <div className="py-10 shadow-md mt-10 text-center">
            <p className="text-xl">No text documents yet</p>
            <p className="text-gray-600 pt-2">
              Select a blank document or choose another template above to get
              started
            </p>
          </div>
        ) : (
          <DocumentsList documents={data.documents} />
        )}
      </div>
    </div>
  );
};

type FilterOptionsProps = {
  options: Array<string>;
  selectedOption: string;
  setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
};

const FilterOptions = ({
  options,
  selectedOption,
  setSelectedOption,
}: FilterOptionsProps) => {
  return (
    <div className="whitespace-nowrap bg-white absolute shadow-md border-t border-gray-200 flex flex-col py-2 top-[-135px] left-[-20px]">
      {options.map((op) => (
        <span
          onClick={() => setSelectedOption(op)}
          key={op}
          className="px-10 py-2 hover:bg-gray-100 relative"
        >
          <span
            className={`select-none ${selectedOption === op ? "text-black font-bold" : ""}`}
          >
            {op}
          </span>
          {selectedOption === op && (
            <span className="absolute left-2 top-2 text-xl">
              <MdOutlineCheck />
            </span>
          )}{" "}
        </span>
      ))}
    </div>
  );
};

export default Home;
