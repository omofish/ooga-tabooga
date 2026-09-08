import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/base-path";

/** Short commit hash baked into the build, shown on the setup screen so a
 *  deployed build can be checked against the commit that produced it. Falls
 *  back gracefully if `.git` isn't available (e.g. a git-less build image). */
function commitHash(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  // Static export for GitHub Pages, served at /ooga-tabooga/.
  output: "export",
  basePath: BASE_PATH,
  env: {
    NEXT_PUBLIC_COMMIT_HASH: commitHash(),
  },
};

export default nextConfig;
