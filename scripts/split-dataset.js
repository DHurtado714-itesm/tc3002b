const fs = require("fs-extra");
const path = require("path");

const SRC_DIR = path.join(__dirname, "dataset");
const DEST_DIR = path.join(__dirname, "Proyecto", "dataset-cartas");
const SPLITS = { train: 0.6, valid: 0.2, test: 0.2 };

function getNextIndex(existingFiles) {
  const indices = existingFiles
    .map((file) => parseInt(file.match(/^(\d+)/)?.[1]))
    .filter((n) => !isNaN(n));
  return indices.length ? Math.max(...indices) + 1 : 1;
}

(async () => {
  const entries = await fs.readdir(SRC_DIR);
  const categories = entries.filter((entry) => {
    const fullPath = path.join(SRC_DIR, entry);
    return fs.statSync(fullPath).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = path.join(SRC_DIR, category);
    const files = (await fs.readdir(categoryPath)).filter((f) =>
      f.match(/\.(jpg|jpeg|png)$/i)
    );

    const total = files.length;
    const shuffled = files.sort(() => 0.5 - Math.random());

    const trainEnd = Math.floor(total * SPLITS.train);
    const validEnd = trainEnd + Math.floor(total * SPLITS.valid);

    const splitFiles = {
      train: shuffled.slice(0, trainEnd),
      valid: shuffled.slice(trainEnd, validEnd),
      test: shuffled.slice(validEnd),
    };

    for (const split of Object.keys(splitFiles)) {
      const cleanCategory = category.replace(/_/g, " ");
      const splitFolder = path.join(DEST_DIR, split, cleanCategory);
      await fs.ensureDir(splitFolder);

      const existingFiles = await fs.readdir(splitFolder);
      let index = getNextIndex(existingFiles);

      for (const file of splitFiles[split]) {
        const ext = path.extname(file);
        const destFile = path.join(splitFolder, `${index}${ext}`);
        await fs.copy(path.join(categoryPath, file), destFile);
        index++;
      }

      console.log(
        `✅ ${split.toUpperCase()} – ${cleanCategory}: ${
          splitFiles[split].length
        } archivos`
      );
    }
  }

  console.log(
    "🎯 Proceso completo: archivos copiados a Proyecto/dataset-cartas/"
  );
})();
