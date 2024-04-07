import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import { useAuth } from "./context/AuthProvider";
import PageLoader from "./components/PageLoader";
import { Suspense, lazy } from "react";

const Document = lazy(() => import("./pages/Document/Document"));

const App = () => {
  const { isLoading } = useAuth();

  return isLoading ? (
    <PageLoader />
  ) : (
    <BrowserRouter>
      <Routes>
        <Route
          path="/document/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <Document />
            </Suspense>
          }
        />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
