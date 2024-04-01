import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Document from "./pages/Document";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/document/:id" element={<Document />} />
        <Route
          path="/"
          element={<Navigate to={`/document/${crypto.randomUUID()}`} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
