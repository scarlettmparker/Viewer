import { useState } from "react";
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
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { mutateLogin } from "~/utils/api";
import styles from "./login.module.css";

/** Login page. */
const Login = () => {
  const { t } = useTranslation("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const result = await mutateLogin(username, password);
    if (result.__typename !== "Redirect") {
      setError(result.message || t("error-default"));
    }
    setLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
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
                  placeholder={t("password-placeholder")}
                  autoComplete="current-password"
                  required
                />
              </FormItem>
            </FormField>
            {error && <p className={styles.error}>{error}</p>}
            <FormFooter>
              <Button
                type="submit"
                title={loading ? t("signing-in-title") : t("sign-in-title")}
                disabled={loading}
              >
                {loading ? t("signing-in-label") : t("sign-in-label")}
              </Button>
            </FormFooter>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
