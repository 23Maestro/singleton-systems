import { Clipboard, getSelectedFinderItems } from "@raycast/api";
import { basename, extname, join } from "path";
import { tmpdir } from "os";
import { existsSync, mkdirSync, statSync } from "fs";
import http from "http";
import { promisify } from "util";
import { execFile } from "child_process";

import { EAGLE_HOST, EAGLE_LIBRARY_PATH_FRAGMENT, EAGLE_PORT } from "./config";

type EagleResponse<T> = {
  status: "success" | "error";
  data: T;
  code?: number;
  message?: string;
};

type AppInfo = {
  library?: {
    path?: string;
    name?: string;
  };
};

type AddedItem = {
  id?: string;
  name?: string;
};

const execFileAsync = promisify(execFile);

function callEagle<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: Record<string, unknown> } = {},
) {
  const body = options.body ? JSON.stringify(options.body) : undefined;
  return new Promise<EagleResponse<T>>((resolve, reject) => {
    const req = http.request(
      {
        hostname: EAGLE_HOST,
        port: EAGLE_PORT,
        path,
        method: options.method || (body ? "POST" : "GET"),
        headers: {
          ...(body
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
              }
            : {}),
        },
        timeout: 30000,
      },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          if (
            !res.statusCode ||
            res.statusCode < 200 ||
            res.statusCode >= 300
          ) {
            reject(
              new Error(`Eagle API HTTP ${res.statusCode}: ${responseBody}`),
            );
            return;
          }

          try {
            resolve(JSON.parse(responseBody) as EagleResponse<T>);
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.on("error", (error) =>
      reject(new Error(`Eagle unavailable: ${error.message}`)),
    );
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Eagle API timed out"));
    });
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

export async function assertCareerProofLibrary() {
  const response = await callEagle<AppInfo>("/api/library/info");
  if (response.status !== "success") {
    throw new Error(response.message || "Could not read Eagle app info");
  }

  const libraryPath = response.data.library?.path || "";
  if (!libraryPath.includes(EAGLE_LIBRARY_PATH_FRAGMENT)) {
    throw new Error(
      `Open Workflow Docs.library in Eagle first. Current: ${libraryPath || "unknown"}`,
    );
  }
}

export async function importProofAsset(
  filePath: string,
  folderId: string,
  tags: string[],
  name?: string,
) {
  await assertCareerProofLibrary();

  const response = await callEagle<AddedItem>("/api/item/addFromPath", {
    method: "POST",
    body: {
      path: filePath,
      name: name || basename(filePath, extname(filePath)),
      tags,
      folderId,
    },
  });

  if (response.status !== "success") {
    throw new Error(response.message || "Failed to import proof asset");
  }

  return response.data;
}

export async function getCaptureSourcePath() {
  const clipboardPath = await getClipboardFilePath();
  if (clipboardPath) {
    return clipboardPath;
  }

  const clipboardImagePath = await saveClipboardImage();
  if (clipboardImagePath) {
    return clipboardImagePath;
  }

  try {
    const selectedItems = await getSelectedFinderItems();
    const selectedFile = selectedItems.find((item) => {
      try {
        return statSync(item.path).isFile();
      } catch {
        return false;
      }
    });

    if (selectedFile) {
      return selectedFile.path;
    }
  } catch {
    // Finder is not always frontmost. Fall through to screenshot lookup.
  }

  return "";
}

async function getClipboardFilePath() {
  try {
    const content = await Clipboard.read();
    if (
      content.file &&
      existsSync(content.file) &&
      statSync(content.file).isFile()
    ) {
      return content.file;
    }
  } catch {
    // Clipboard may not contain a file.
  }

  return "";
}

async function saveClipboardImage() {
  const outputDir = join(tmpdir(), "career-hq-captures");
  mkdirSync(outputDir, { recursive: true });

  const outputPath = join(outputDir, `clipboard-${Date.now()}.png`);
  const script = `
ObjC.import('AppKit');
ObjC.import('Foundation');

const outputPath = '${escapeJxaString(outputPath)}';
const pasteboard = $.NSPasteboard.generalPasteboard;
const pngData = pasteboard.dataForType('public.png');
const tiffData = pasteboard.dataForType('public.tiff');

if (pngData) {
  pngData.writeToFileAtomically(outputPath, true);
  outputPath;
} else if (tiffData) {
  const image = $.NSImage.alloc.initWithData(tiffData);
  const representations = image.TIFFRepresentation;
  const bitmap = $.NSBitmapImageRep.imageRepWithData(representations);
  const converted = bitmap.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $());
  converted.writeToFileAtomically(outputPath, true);
  outputPath;
} else {
  '';
}
`;

  try {
    const { stdout } = await execFileAsync("/usr/bin/osascript", [
      "-l",
      "JavaScript",
      "-e",
      script,
    ]);
    const savedPath = stdout.trim();
    if (savedPath && existsSync(savedPath) && statSync(savedPath).isFile()) {
      return savedPath;
    }
  } catch {
    // Clipboard may not contain image data or macOS may deny clipboard conversion.
  }

  return "";
}

function escapeJxaString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
