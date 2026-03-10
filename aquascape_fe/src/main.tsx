import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import "./core/config/i18n";
import "./core/config/axios";
import router from "./router";
import "./index.css";
import "antd/dist/reset.css";
import store from "./core/redux/store";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <Provider store={store}>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#fe7743",
          fontFamily: "Nunito, sans-serif",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConfigProvider>
  </Provider>,
  // </React.StrictMode>,
);
