import { configurePageData } from "@sun/ssr";

configurePageData({
  perPatternTtl: {
    // VNC tokens are single-use; never serve a cached iframe src.
    "/viewer": 0,
  },
});
