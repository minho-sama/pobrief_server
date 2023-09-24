const MP3Cutter = require('mp3-cutter');
const fileSys = require('fs');
const PATH = require('path');
const ffprobe = require("ffprobe-static")

const audioFilePath = './files/downloaded.mp3';
const chunkSizeInMB = 20; //20MB default
const targetDirectory = './files/slicedAudio';


// Get file size in bytes
const fileSizeInBytes = fileSys.statSync(audioFilePath).size;

// Calculate the number of chunks
const totalChunks = Math.ceil(fileSizeInBytes / (chunkSizeInMB * 1024 * 1024));

// Calculate duration based on average bit rate (in kbps)
const averageBitRate = 128; // Example average bit rate in kbps
const durationInSeconds = (fileSizeInBytes * 8) / (averageBitRate * 1000);

console.log('Duration (seconds):', durationInSeconds);
console.log('File size (MB):', fileSizeInBytes / (1024 * 1024));

// Function to delete all files in the target directory
function deleteFilesInDirectory(directory) {
    fileSys.readdirSync(directory).forEach(file => {
        const filePath = PATH.join(directory, file);
        if (fileSys.statSync(filePath).isFile()) {
            fileSys.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        }
    });
}

// Delete existing files in the target directory
deleteFilesInDirectory(targetDirectory);

// Split the audio into chunks
for (let index = 0; index < totalChunks; index++) {
    const start = index * chunkSizeInMB * 1024 * 1024;
    const end = Math.min((index + 1) * chunkSizeInMB * 1024 * 1024, fileSizeInBytes);
    const outputPath = `./files/slicedAudio/audio-chunk-${index}.mp3`

    MP3Cutter.cut({
        src: audioFilePath,
        target: outputPath,
        start: start / fileSizeInBytes * durationInSeconds,
        end: end / fileSizeInBytes * durationInSeconds
    });

    console.log(`Chunk ${index} sliced and saved as ${outputPath}`);
}
