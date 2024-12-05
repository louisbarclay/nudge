import AdmZip from "adm-zip";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Create releases directory if it doesn't exist
const releasesDir = join(__dirname, "releases");
if (!existsSync(releasesDir)) {
	mkdirSync(releasesDir);
}

// Read manifest.json to get version
const manifest = JSON.parse(
	readFileSync(join(__dirname, "dist", "manifest.json"), "utf8"),
);
const version = manifest.version;

// Initialize zip
const zip = new AdmZip();

// Add dist directory to zip
zip.addLocalFolder(join(__dirname, "dist"));

// Generate zip file name with version
const zipFileName = `extension-v${version}.zip`;
const zipFilePath = join(releasesDir, zipFileName);

// Write zip file
zip.writeZip(zipFilePath);

console.log(`Created ${zipFilePath}`);
