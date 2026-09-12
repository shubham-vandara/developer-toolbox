import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import { LoadingSpinner } from "./components/common/LoadingSpinner.jsx";
import { Home } from "./pages/Home.jsx";
import { Tools } from "./pages/Tools.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import { tools } from "./data/tools.js";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tools" element={<Tools />} />
        {tools.map((tool) => {
          const ToolComponent = tool.component;
          return (
            <Route
              key={tool.id}
              path={tool.path}
              element={
                <Suspense fallback={<LoadingSpinner label="Loading tool" />}>
                  <ToolComponent />
                </Suspense>
              }
            />
          );
        })}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
