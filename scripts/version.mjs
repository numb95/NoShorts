import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "manifest.json");
const outDir = path.join(root, "dist");
const outManifestPath = path.join(outDir, "manifest.json");

const readManifest = () => JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const normalizeTag = (tag) => tag.replace(/^v/, "");

const getTagVersion = () => {
  const ref = process.env.GITHUB_REF || "";
  if (ref.startsWith("refs/tags/")) {
    return normalizeTag(ref.replace("refs/tags/", ""));
  }
  try {
    const tag = execSync("git describe --tags --abbrev=0", {
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString()
      .trim();
    return normalizeTag(tag);
  } catch {
    return null;
  }
};

const getShortSha = () => {
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
};

const isRelease = process.argv.includes("--release");
const isLint = process.argv.includes("--lint");

const tagVersion = getTagVersion();
const shortSha = getShortSha();

let version = `0.0.0-dev+${shortSha}`;
if (isRelease && tagVersion) {
  version = tagVersion;
} else if (isLint) {
  version = "0.0.0";
}

const manifest = readManifest();
manifest.version = version;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outManifestPath, JSON.stringify(manifest, null, 2) + "\n");

process.stdout.write(version + "\n");
