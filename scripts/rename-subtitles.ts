import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';

/**
 * To run this script use `tsx` package.
 * To install it if not already installed:
 * npm i tsx -g
 *
 * tsx rename-subtitles.ts
 */

// -------Options---------

/**
 * All folders inside 'root' that have sub folders named 'subtitle-lan', where 'lan'
 * indicates the language suffix, will be processed to match the corresponding video file
 * name, and will be moved next to it, that if the number of video files match
 * the number of subtitle files.
 */

/** The folder that contains all the movies and shows */
const root = 'D:\\zero-down\\Shows';

const videoExtension = '.mkv';
const subtitleExtension = '.srt';

// ------------------------------------------------

async function renameSubtitles(
  folder: string,
  videoFiles: string[],
  subtitleFolder: string,
  subtitleFiles: string[]
): Promise<void> {
  const [, langSuffix] = subtitleFolder.split('-');

  let index = 0;

  for (const subtitleFile of subtitleFiles) {
    const rawFileName = path.parse(videoFiles[index]!).name;
    const subtitleOldPath = path.resolve(folder, subtitleFolder, subtitleFile);
    const subtitleNewPath = path.resolve(folder, `${rawFileName}.${langSuffix}.srt`);

    console.log(`Old path: ${subtitleOldPath}`);
    console.log(`New path: ${subtitleNewPath}\n`);
    await fsp.rename(subtitleOldPath, subtitleNewPath);

    index += 1;
  }

  // Remove the subtitle folder if empty
  await fsp.rmdir(path.resolve(folder, subtitleFolder));
}

async function detectSubtitleFiles(
  folder: string,
  subtitleFolders: string[],
  videoFiles: string[]
): Promise<void> {
  for (const subtitleFolder of subtitleFolders) {
    const subtitleFiles = await listFiles({
      folderPath: path.resolve(folder, subtitleFolder),
      extList: [subtitleExtension],
      short: true,
    });

    if (subtitleFiles.length === videoFiles.length) {
      await renameSubtitles(folder, videoFiles, subtitleFolder, subtitleFiles);
    }
  }
}

async function main(folder: string): Promise<void> {
  if (!fs.existsSync(folder)) {
    throw new Error('Folder does not exists');
  }

  const items = await fsp.readdir(folder, {
    withFileTypes: true,
  });

  const subtitleFolders: string[] = [];
  const videoFiles: string[] = [];

  for (const item of items) {
    const isFolder = item.isDirectory();
    const isSubtitleFolder = isFolder && /^subtitles-\w/i.test(item.name);

    if (isSubtitleFolder) {
      subtitleFolders.push(item.name);
    } else if (isFolder) {
      await main(path.resolve(folder, item.name));
    } else if (path.extname(item.name).toLowerCase() === videoExtension) {
      videoFiles.push(item.name);
    }
  }

  if (subtitleFolders.length > 0 && videoFiles.length > 0) {
    await detectSubtitleFiles(folder, subtitleFolders, videoFiles);
  }
}

main(root).catch((exception) => console.error(exception));

interface ListFilesOptions {
  folderPath: string;
  extList?: string[];
  short?: boolean;
}

async function listFiles({ folderPath, extList, short }: ListFilesOptions): Promise<string[]> {
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const items = await fsp.readdir(folderPath, {
    withFileTypes: true,
  });

  const files = items
    .filter((item) => !item.isDirectory())
    .map((file) => {
      if (short === true) {
        return file.name;
      }

      return path.resolve(folderPath, file.name);
    });

  if (extList !== undefined) {
    return files.filter((file) => {
      for (const ext of extList) {
        if (file.toLowerCase().endsWith(ext)) {
          return true;
        }
      }

      return false;
    });
  }

  return files;
}
