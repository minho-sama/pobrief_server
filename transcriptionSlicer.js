const fs = require('fs');
const path = require('path');

const inputTrancription = "./files/transcription.txt";
const outputDirectory = "./files/slicedTranscription";
const maxChunkSize = 10500; //~4 chars equal to 1 token. TODO: refactor it, so it splits the text based on token count

function sliceTranscription() {
    return new Promise((resolve, reject) => {
      // Delete existing files in the target directory
      deleteFilesInDirectory(outputDirectory);
  
      // Read the input text file
      fs.readFile(inputTrancription, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
  
        // Split the data into chunks of maxChunkSize characters
        const chunks = [];
        for (let i = 0; i < data.length; i += maxChunkSize) {
          chunks.push(data.slice(i, i + maxChunkSize));
        }
  
        // Create the output directory if it doesn't exist
        if (!fs.existsSync(outputDirectory)) {
          fs.mkdirSync(outputDirectory, { recursive: true });
        }
  
        // Use a promise-based approach to handle writing chunks
        const promises = chunks.map((chunk, index) => {
          return new Promise((resolveWrite, rejectWrite) => {
            const fileName = `chunk-${index + 1}.txt`;
            const filePath = path.join(outputDirectory, fileName);
  
            fs.writeFile(filePath, chunk, (writeErr) => {
              if (writeErr) {
                console.error(`Error writing chunk ${index + 1}:`, writeErr);
                rejectWrite(writeErr);
              } else {
                console.log(`Chunk ${index + 1} written to ${filePath}`);
                resolveWrite(filePath); // Resolve with the file path
              }
            });
          });
        });
  
        // Wait for all write promises to complete
        Promise.all(promises)
          .then((filePaths) => {
            resolve(filePaths); // Resolve with an array of file paths
          })
          .catch((writeError) => {
            reject(writeError);
          });
      });
    });
  }

// Function to delete all files in the target directory
function deleteFilesInDirectory(directory) {
    if (fs.existsSync(directory)) {
      fs.readdirSync(directory).forEach((file) => {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      });
    }
  }

  module.exports = sliceTranscription