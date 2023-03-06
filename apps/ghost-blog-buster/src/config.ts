import Configstore from "configstore";
import * as fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const _dirname = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));
export const packageJson = JSON.parse(fs.readFileSync(path.join(_dirname, "..", "package.json"), "utf8"));

export const getConfig = () => {
  return new Configstore(packageJson.name, { ghostUrl: "", ghostContentApiKey: "" });
};
