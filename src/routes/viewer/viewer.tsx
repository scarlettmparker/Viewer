import { getPageData, pageDataRegistry } from "@sun/ssr";
import { useTranslation } from "@sun/i18n";
import { Button, Form } from "@sun/components";
import { CsrfField } from "@sun/ssr/react";
import { ComputerDesktopOutline, ArrowLeftStartOnRectangleOutline } from "preact-heroicons";
import { fetchGraphQLData } from "~/utils/api";
import styles from "./viewer.module.css";

type VncCredentials = {
  iframeSrc: string;
};

/** The desktop viewer. */
const Viewer = () => {
  const { t } = useTranslation("viewer");
  const { data } = getPageData<VncCredentials>("vncCredentials", "viewer");
  const iframeSrc = data?.iframeSrc;

  const ICON_SIZE = 18;

  return (
    <div className={styles.viewer_layout}>
      <header className={styles.toolbar}>
        <div className={styles.title}>
          <ComputerDesktopOutline width={ICON_SIZE} height={ICON_SIZE} />
          <h1>{t("title")}</h1>
        </div>
        <Form action="/__logout" method="post">
          <CsrfField />
          <Button type="submit" variant="secondary" title={t("sign-out-title")}>
            <ArrowLeftStartOnRectangleOutline
              className={styles.icon}
              width={ICON_SIZE}
              height={ICON_SIZE}
            />
            {t("sign-out-label")}
          </Button>
        </Form>
      </header>
      <div className={styles.stage}>
        {iframeSrc ? (
          <iframe
            className={styles.frame}
            src={iframeSrc}
            title={t("title")}
            allow="clipboard-read; clipboard-write"
          />
        ) : (
          <p className={styles.error}>{t("error-default")}</p>
        )}
      </div>
    </div>
  );
};

/** Loads the noVNC iframe src for the viewer page. */
async function getViewerData(): Promise<Record<string, unknown> | null> {
  const result = await fetchGraphQLData<{
    viewerQueries: { vncCredentials: VncCredentials };
  }>("viewerQueries.vncCredentials");
  if (result?.success && result.data) {
    return { vncCredentials: result.data.viewerQueries.vncCredentials };
  }
  return null;
}

/** Registers the page-data loader for the viewer page. */
export function registerViewerDataLoader(): void {
  pageDataRegistry.registerPageDataLoader("viewer", getViewerData);
}

export default Viewer;
