import styles from "./layout.module.css";
import { getBackgroundHex } from "@sun/utils";
import { useEffect, useState } from "react";
import { BreadcrumbProvider } from "@sun/components";

type LayoutProps = React.PropsWithChildren;

const Layout = (props: LayoutProps) => {
  const { children } = props;
  const [backgroundColour, setBackgroundColour] = useState(getBackgroundHex());

  const updateBackgroundColour = () => {
    setBackgroundColour(getBackgroundHex());
  };

  useEffect(() => {
    const interval = setInterval(() => updateBackgroundColour(), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ backgroundColor: backgroundColour }} className={styles.main}>
      <BreadcrumbProvider>{children}</BreadcrumbProvider>
    </main>
  );
};

export default Layout;