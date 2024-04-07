import { useNavigate, useParams } from "react-router-dom";
import TextEditor from "../../components/TextEditor";
import { useAuth } from "../../context/AuthProvider";

const Document = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const navigate = useNavigate();
  if (!isAuthenticated && !isLoading) {
    navigate("/");
    return <></>;
  }
  const { id } = useParams();
  return <TextEditor documentId={id!} />;
};

export default Document;
