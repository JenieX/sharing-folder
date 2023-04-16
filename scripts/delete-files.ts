import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';

// tsx delete-files.ts

const root = 'D:\\zero-down';

const condition = (fileName: string): boolean => {
  return fileName.endsWith('.ext');
};

async function deleteFiles(folder: string): Promise<void> {
  if (!fs.existsSync(folder)) {
    throw new Error('Folder does not exists');
  }

  const items = await fsp.readdir(folder, {
    withFileTypes: true,
  });

  for (const item of items) {
    const isFolder = item.isDirectory();

    if (isFolder) {
      await deleteFiles(path.resolve(folder, item.name));

      return;
    }

    if (condition(item.name)) {
      const filePath = path.resolve(folder, item.name);
      console.log(filePath);
      // Uncomment the next line to have each matched file deleted
      // await fsp.unlink(filePath);
    }
  }
}

deleteFiles(root).catch((exception) => console.error(exception));
