import ReactDOM from "react-dom/client";
import { store } from "./store/useStore";
import { Provider } from "react-redux/es/exports";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);
