#!/usr/bin/env node

import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import select from "@inquirer/select";
import { oraPromise } from "ora";
import { marked } from "marked";
import chalk from "chalk";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { VertexAI } from '@google-cloud/vertexai';
import cheerio from 'cheerio';
import cliMd from "cli-markdown";
import fs from 'fs';
import path from 'path';

const vertex_ai = new VertexAI({ project: 'polichatbe', location: 'us-central1' });
const model = 'gemini-1.5-pro-preview-0409';
process.env['GOOGLE_APPLICATION_CREDENTIALS'] = 'service-account-key.json';

function renderScore(score) {
  /*
  Apply color formatting to a score based on its value.

  :param score: The numerical score to format.
  :type score: int
  :returns: A string representing the colored score.
  :rtype: str
  */
  if (score < 50) {
    return chalk.bold.red(score);
  }
  if (score < 90) {
    return chalk.bold.yellow(score);
  }
  return chalk.bold.green(score);
}

function extractTextAndLinks(markdown) {
  /*
  Extract plain text content and links from a Markdown string.

  :param markdown: The Markdown formatted string to process.
  :type markdown: str
  :returns: A dictionary with two keys 'textContent' containing the plain text,
            and 'links' containing a list of links as dictionaries with 'href', 'title', and 'text' keys.
  :rtype: dict
  */
  let textContent = "";
  const links = [];
  const renderer = new marked.Renderer();

  // Override link renderer to capture links
  const originalLinkRenderer = renderer.link;
  renderer.link = function (href, title, text) {
    links.push({ href, title: title || "", text });
    return originalLinkRenderer.call(this, href, title, text);
  };

  // Override paragraph renderer to capture plain text
  const originalParagraphRenderer = renderer.paragraph;
  renderer.paragraph = function (text) {
    textContent += text + "\n"; // Collect text and separate paragraphs with a newline
    return originalParagraphRenderer.call(this, text);
  };

  // Process the Markdown
  marked(markdown, { renderer });
  return { textContent, links };
}

function isValidURL(str) {
  /*
    Validates whether a given string is a well-formed URL.
   
    This function uses a regular expression to check if the input string
    is a valid URL. The pattern checks for the protocol, domain name or IP address,
    optional port, optional path, optional query string, and optional fragment locator.
   
    :param str: The string to be tested for being a valid URL.
    :type str: string
    :returns: True if the string is a valid URL, false otherwise.
    :rtype: boolean
   */
  const pattern = new RegExp(
    "^https?:\\/\\/" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator

  return !!pattern.test(str);
}

const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 2048,
    'temperature': 1,
    'topP': 1,
  }
});

async function generateContent(context = "", input = "", codebase = "") {
  const req = {
    contents: [
      {
        role: 'user', parts: [{ text: "Using the Lighthouse report section provided below, generate actionable recommendations for a web developer to improve the website's performance. Utilize the context and the entire codebase provided as knowledge bases to derive these solutions. Provide three distinct solutions based on the specific issues highlighted in the Lighthouse report, formatted in simple Markdown. Include specific code recommendations when applicable.\n" + "\nLighthouse Problem Description: \n" + input + "\nContext: " + context + "\nCodebase: " + codebase }]
      },
    ],
  };

  const streamingResp = await generativeModel.generateContentStream(req);
  let result = '';

  for await (const item of streamingResp.stream) {
    result += item.candidates?.[0]?.content?.parts?.[0]?.text;
  }

  return result;
}

function formatMarkdownHeaders(markdown) {
  // Regular expressions for different header levels
  const headers = [
    { regex: /^(# )(.*)$/gm, style: chalk.bold },   // H1
    { regex: /^(## )(.*)$/gm, style: chalk.bold },            // H2
    { regex: /^(### )(.*)$/gm, style: chalk.bold },       // H3
    { regex: /^(#### )(.*)$/gm, style: chalk.dim },           // H4
    { regex: /^(##### )(.*)$/gm, style: chalk.italic },       // H5
    { regex: /^(###### )(.*)$/gm, style: chalk.italic.dim }   // H6
  ];

  // Apply styles to headers
  headers.forEach(header => {
    markdown = markdown.replace(header.regex, (_, marker, text) => {
      return `${marker.trim()} ${header.style(text)}`;
    });
  });

  return markdown;
}

function readFilesFromDirectory(directory) {
  let content = '';
  const files = fs.readdirSync(directory);

  // List of library folders to ignore
  const ignoreFolders = ['node_modules', 'bower_components', 'dist', 'build', '.git', '.vscode'];

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      content += file + ': ' + fs.readFileSync(filePath, 'utf-8') + '\n';
    } else if (stats.isDirectory()) {
      // Ignore certain directories
      if (ignoreFolders.includes(file)) {
        continue;
      }

      content += readFilesFromDirectory(filePath); // Recursively read subdirectories
    }
  }

  return content;
}

async function main() {
  /*
  * The main function that orchestrates the URL validation and Lighthouse audit.
  *
  * This asynchronous function takes a URL from the command line arguments,
  * validates it, and then runs a Lighthouse audit on the URL if it is valid.
  * It prints out the Lighthouse scores for performance, accessibility, best practices,
  * and SEO. It then identifies the most important issues from the Lighthouse report,
  * allows the user to select an issue to investigate, and loads the relevant documentation
  * for that issue using CheerioWebBaseLoader. Finally, it initializes a ChatOllama instance
  * for further operations (not shown in the snippet).
  *
  * :raises: If no user input is provided or the input is not a valid URL, an error message
  *          is logged to the console and the function returns early.
  */
  const userInput = process.argv[2];
  const codeBasePath = process.argv[3];
  let codeBase = '';
  if (!userInput) {
    console.error("Please enter a valid link");
    return;
  }
  if (!isValidURL(userInput)) {
    console.error("Please enter a valid link");
    return;
  }

  const toCheck = userInput;
  process.stdout.write("\x1Bc");
  const chrome = await launch({ chromeFlags: ["--headless"] });

  const { lhr } = await oraPromise(
    lighthouse(toCheck, {
      port: chrome.port,
      output: "json",
      formFactor: "desktop",
      screenEmulation: {
        disabled: true,
      },
      locale: "en-US",
    }),
    {
      text: "Running Lighthouse Scan on " + toCheck + " 🚀",
      successText: "LightHouse scan completed successfully 🎉",
    }
  );

  console.log("");

  const printScore = (title, score) =>
    console.log(title, renderScore(score));

  printScore(
    "Lighthouse performance score:",
    lhr.categories.performance.score * 100
  );

  printScore(
    "Lighthouse accessibility score:",
    lhr.categories.accessibility.score * 100
  );

  printScore(
    "Lighthouse best-practice score:",
    lhr.categories["best-practices"].score * 100
  );

  printScore("Lighthouse seo score:", lhr.categories.seo.score * 100);

  console.log("");

  // Most important issues in the Lighthouse report
  const audits = lhr.audits;
  const importantAudits = Object.keys(audits)
    .filter((audit) => audits[audit].score < 1 && audits[audit].score !== null)
    .sort((a, b) => audits[a].score - audits[b].score)
    .slice(0, 5);

  // Select the option you want to investigate
  const answer = await select({
    message: "Select a part of the report to investigate:",
    choices: importantAudits.map((a) => ({
      name: a + " - " + renderScore(Math.round(audits[a].score * 100)),
      value: a,
      description: audits[a].description,
    })),
  });

  console.log("");

  const selectedAnswer = audits[answer];
  //parse markdown
  const link = extractTextAndLinks(selectedAnswer.description).links[0].href;

  // do the llm part
  const processingLocalFiles = await oraPromise(
    (async () => {
      if (!codeBase) {
        codeBase = readFilesFromDirectory(codeBasePath);
      }
    })(),
    {
      text: "Processing local files 📂",
      successText: "Local files processed successfully 📂",
    }
  );

  const docs = await oraPromise(
    (async () => {
      const loader = new CheerioWebBaseLoader(link);
      const docs = await loader.load();

      // Assuming you have an array of Document objects named `docs`
      for (const doc of docs) {
        // Load the page content into Cheerio
        const $ = cheerio.load(doc.pageContent);

        const cleanedContent = $('body').html().replace(/\n\s*\n/g, '\n').trim();
        const cleanedContentWithoutSpaces = cleanedContent.replace(/>\s+</g, '><').trim();

        return cleanedContentWithoutSpaces;
      }
    })(),
    {
      text: "Processing online documentation 🌎",
      successText: "Processing online documentation successfully 🌎",
    }
  );

  const out = await oraPromise(
    (async () => {
      let result = await generateContent(docs, selectedAnswer.description, codeBase);
      return result;
    })(),
    {
      text: "Crafting your report 🛠️",
      successText: "Report crafted successfully 🎉",
    }
  );

  const formattedMarkdown = formatMarkdownHeaders(out);
  console.log(cliMd(formattedMarkdown));

  chrome.kill();
}

main().catch(console.error);
