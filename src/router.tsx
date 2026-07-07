import { RouteObject, useRoutes } from "react-router-dom";
import { lazy } from "react";

const Viewer = lazy(() => import("~/routes/viewer"));
const Login = lazy(() => import("~/routes/login"));
const NotFound = lazy(() => import("~/routes/not-found"));

/**
 * List of routes.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Viewer />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export const Router = () => {
  return useRoutes(routes);
};