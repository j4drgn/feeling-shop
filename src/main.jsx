import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import "./index.css";

// React Router v7 미리 설정
const router = createBrowserRouter(
  [
    {
      path: "/*",
      element: <App />,
    },
  ],
  {
    // v7 future flags 설정
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
    },
  }
);

// 실제 앱 렌더링 - RouterProvider 사용
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
