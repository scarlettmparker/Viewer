import React, { Suspense } from "react";
import { StaticRouter } from "react-router-dom/server";
import { matchRoutes } from "react-router-dom";
import { Router, routes } from "./router";
import Layout from "./components/layout";
import NotFound from "./routes/not-found";
import { createRenderer } from "@sun/ssr/renderer";
import { createI18nInstance } from "./utils/i18n";
import { setI18n } from "@sun/i18n";
import "./utils/register-loaders";

const renderer = createRenderer({
  title: "Viewer | Scarlet Sun",
  initI18n(locale, translations) {
    const instance = createI18nInstance();
    setI18n(instance);
    return instance.init({
      lng: locale,
      fallbackLng: "en",
      resources: { [locale]: translations } as never,
      interpolation: { escapeValue: false },
      react: { useSuspense: true },
    });
  },
});

export async function render(options: {
  url: string;
  locale: string;
  pageName: string;
  clientJs: string;
  clientCss: string[];
  isProduction: boolean;
  nonce?: string;
  frontendMode?: string;
}) {
  const matches = matchRoutes(routes, options.url);
  const didMatch = Boolean(matches);
  const App = (
    <React.StrictMode>
      <StaticRouter location={options.url}>
        <Layout>
          <Suspense fallback={null}>
            <Router />
          </Suspense>
        </Layout>
      </StaticRouter>
    </React.StrictMode>
  );

  return renderer.render({
    app: didMatch ? App : <NotFound />,
    didMatch,
    url: options.url,
    locale: options.locale,
    pageName: options.pageName,
    clientJs: options.clientJs,
    clientCss: options.clientCss,
    isProduction: options.isProduction,
    nonce: options.nonce,
    frontendMode: options.frontendMode,
  });
}
