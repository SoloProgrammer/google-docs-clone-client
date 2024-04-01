import { useParams } from "react-router-dom";
import TextEditor from "../components/TextEditor";

const Document = () => {
  const { id } = useParams();
  return <TextEditor documentId={id!} />;
};

export default Document;
