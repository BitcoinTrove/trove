import { DepVersions } from "../src/trove/types/document_data";

var fs = require("fs");

export const depsFromPackageLock = () => {
  const contents = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
  const allDependencies: DepVersions = {};

  const handlePackage = (packageNode) => {
    const dependencies = packageNode["dependencies"]
      ? Object.keys(packageNode["dependencies"])
      : [];

    dependencies.forEach((name) => {
      allDependencies[name] = packageNode["dependencies"][name]["version"];
      handlePackage(packageNode["dependencies"][name]);
    });
  };

  handlePackage(contents);

  return allDependencies;
};
