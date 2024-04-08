import { useParams } from "react-router-dom";
import TextEditor from "../../components/TextEditor";
import { useAuth } from "../../context/AuthProvider";

const Document = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isAuthenticated && !isLoading) {

    window.location.href = "/";
    return <></>;
  }
  const { id } = useParams();
  return <TextEditor documentId={id!} />;
};

export default Document;
