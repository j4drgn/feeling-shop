import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import { MainScreen } from "./screens/MainScreen";
import { ContentScreen } from "./screens/ContentScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { SignupScreen } from "./screens/SignupScreen";
import "./index.css";

// React Router v7 미리 설정
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: <MainScreen />,
        },
        {
          path: "content",
          element: <ContentScreen />,
        },
        {
          path: "history",
          element: <HistoryScreen />,
        },
        {
          path: "login",
          element: <LoginScreen />,
        },
        {
          path: "signup",
          element: <SignupScreen />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

// 실제 앱 렌더링 - RouterProvider 사용
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);