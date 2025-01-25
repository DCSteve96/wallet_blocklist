import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchAllowlists() {
  const url = process.env.ALLOWLISTS_URL;
  const token = 'token ' + process.env.READ_ACCESS_TOKEN;

  const fileNames = ["coin-list.json", "domain-list.json", "object-list.json", "package-list.json"];
  const allowlistData = {};

  for (const fileName of fileNames) {
    const fileUrl = url + fileName;
    const response = await fetch(fileUrl, { method: "GET", headers: { "Authorization": token } });
    const jsonData = await response.json();
    allowlistData[fileName.replace("-list.json", "")] = jsonData;
  }

  return allowlistData;
}

function updateFile(allowlistData) {
  const types =  ["coin", "domain", "object", "package"]
  console.log(types);
  let fail = false;
  types.forEach((type) => {
    const filePath = path.resolve(
      __dirname,
      `../allowlists/${type.toLowerCase()}-list.json`
    );

    try {
      fs.writeFileSync(filePath, JSON.stringify(allowlistData[type], null, 2), "utf8");
      console.log(`${type}-list.json updated successfully.`);
    } catch (error) {
      console.error(`Error writing file for ${type}:`, error);
    }
  });

  return fail;
}

async function run() {
  const allowlistData = await fetchAllowlists();
  const errors = updateFile(allowlistData);
  process.exitCode = errors ? 1 : 0;
  // console.log(sheetData)
}

run().catch(console.error);