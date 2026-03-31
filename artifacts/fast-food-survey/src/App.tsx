import { BrowserRouter, Routes, Route } from "react-router-dom";
import SurveyForm from "@/pages/SurveyForm";
import Results from "@/pages/Results";

function NotFound() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Page not found</h1>
      <a href="/" style={{ color: "#8A3BDB" }}>Go to survey</a>
    </div>
  );
}

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <BrowserRouter basename={base}>
      <Routes>
        <Route path="/" element={<SurveyForm />} />
        <Route path="/results" element={<Results />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
