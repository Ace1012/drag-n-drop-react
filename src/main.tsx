import ReactDOM from "react-dom/client";
import { store } from "./store/useStore";
import { Provider } from "react-redux/es/exports";
import App from "./App";
import React from "react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
