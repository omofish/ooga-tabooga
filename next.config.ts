import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/base-path";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages, served at /ooga-tabooga/.
  output: "export",
  basePath: BASE_PATH,
};

export default nextConfig;
