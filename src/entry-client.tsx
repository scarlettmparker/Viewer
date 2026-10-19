import { BrowserRouter } from "react-router-dom";
import { Router } from "./router";
import ReactDOM from "react-dom/client";
import i18n from "i18next";
import { Suspense } from "react";

import Layout from "./components/layout";
import ErrorBoundary from "~/components/error-boundary";
import { setI18n } from "@sun/i18n";
import { initClientBootstrap } from "@sun/ssr";
import "./utils/configure-framework";

import "@sun/components/style.css";

setI18n(i18n);

initClientBootstrap({ i18n })
  .then(() => {
    ReactDOM.hydrateRoot(
      document.getElementById("app") as HTMLElement,
      <BrowserRouter>
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Router />
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </BrowserRouter>,
    );
  })
  .catch((error) => {
    console.error("Client bootstrap failed", error);
  });
