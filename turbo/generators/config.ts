import fs from "fs";
import path from "path";
import { PlopTypes } from "@turbo/gen";

import { siteConfig } from "../../docs/src/app/site-config";

const NEXTJS_DOCS_PATH = "docs/src/app";

export default function generator(plop: PlopTypes.NodePlopAPI, config: PlopTypes.PlopCfg): void {
  plop.setGenerator("packages-readme", {
    description: "Generate Packages README.md from the docs - consolidate the files into one",
    prompts: [
      {
        type: "list",
        name: "package",
        pageSize: 20,
        message: "Which package?",
        choices: () => {
          return siteConfig.docs.map((d) => d.package);
        },
      },
    ],
    actions: [
      async function concatDocsToReadme(answers: { package?: string; content?: string; path?: string }) {
        if (!answers.package) {
          return "no package provided, skipping fixture directory creation";
        }
        const packageInfo = siteConfig.docs.find((d) => d.package === answers.package);
        if (!packageInfo) {
          return "no package info found, skipping";
        }
        let output = "";
        for (const nav of packageInfo.navigation) {
          for (const navItem of nav.items) {
            const page = fs.readFileSync(path.join(NEXTJS_DOCS_PATH, `${navItem.href}/page.mdx`), "utf8");
            output += page;
          }
        }
        answers.content = output
          .replace("<Steps>", "")
          .replace("</Steps>", "")
          .replace("](/docs", "](https://ts-ghost.dev/docs");
        answers.path = packageInfo.fsPath;
        return `Generated Readme for ${answers.package}`;
      },
      {
        type: "add",
        force: true,
        path: "{{ turbo.paths.root }}/{{ path }}/README.md",
        templateFile: "templates/{{ package }}.hbs",
      },
    ],
  });
}
