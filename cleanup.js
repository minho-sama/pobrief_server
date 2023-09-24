const fileSystem = require('fs').promises;
const pathConfiguration = require('./pathConfig.js');

async function cleanupItems() {
  try {
    const itemsToDelete = [
      pathConfiguration.outputSummaryChunksJSONFile,
      pathConfiguration.outputSummaryTextFile,
      pathConfiguration.outputFinalSummaryFile,
      pathConfiguration.downloadedMP4,
      pathConfiguration.transcriptionTXT,
      pathConfiguration.transcriptionDirectory,
      pathConfiguration.slicedAudioDirectory
    ];

    for (const itemPath of itemsToDelete) {
      try {
        await fileSystem.access(itemPath); // Check if item exists

        const stats = await fileSystem.stat(itemPath);
        if (stats.isDirectory()) {
            const filesInDir = await fileSystem.readdir(itemPath);
            for (const file of filesInDir) {
              const filePath = pathConfiguration.path.join(itemPath, file);
              await fileSystem.unlink(filePath);
              console.log(`Deleted file: ${filePath}`);
            }
        } else {
          await fileSystem.unlink(itemPath);
          console.log(`Deleted file: ${itemPath}`);
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`Item does not exist: ${itemPath}`);
        } else {
          throw error;
        }
      }
    }

    console.log('Cleanup completed successfully.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

module.exports = cleanupItems