import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormFooter,
  Input,
  Button,
} from "@sun/components";
import { CsrfField } from "@sun/ssr/react";
import styles from "./login.module.css";

/** Login page. Native form POST to /__login (PRG) so the auth cookie sticks. */
const Login = () => {
  const { t } = useTranslation("login");
  const [searchParams] = useSearchParams();
  const failed = searchParams.get("error") === "1";

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardBody>
          <Form action="/__login" method="post">
            <CsrfField />
            <FormField name="username">
              <FormLabel>{t("username")}</FormLabel>
              <FormItem>
                <Input
                  type="text"
                  placeholder={t("username-placeholder")}
                  autoComplete="username"
                  required
                  autoFocus
                />
              </FormItem>
            </FormField>
            <FormField name="password">
              <FormLabel>{t("password")}</FormLabel>
              <FormItem>
                <Input
                  type="password"
                  placeholder={t("password-placeholder")}
                  autoComplete="current-password"
                  required
                />
              </FormItem>
            </FormField>
            {failed && <p className={styles.error}>{t("error-default")}</p>}
            <FormFooter>
              <Button type="submit" title={t("sign-in-title")}>
                {t("sign-in-label")}
              </Button>
            </FormFooter>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
