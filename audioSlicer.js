const cutter = require('mp3-cutter');
const fs = require('fs');
const path = require('path');
const ffprobe = require('ffprobe-static');

const audioFilePath = './files/downloaded.mp4'; // Update to your MP3 file
const chunkSizeInMB = 20; // 20MB default
const targetDirectory = './files/slicedAudio'; // Update the target directory

function audioSlicer(){

  return new Promise((resolve, reject) =>{
    try{

    // Get the duration of the audio file
    const durationInSeconds = getMP3Duration(audioFilePath);

    console.log('Duration (seconds):', durationInSeconds);

    // Get file size in bytes
    const fileSizeInBytes = fs.statSync(audioFilePath).size;

    console.log('File size (MB):', fileSizeInBytes / (1024 * 1024));

    // Calculate the number of chunks
    const totalChunks = Math.ceil(fileSizeInBytes / (chunkSizeInMB * 1024 * 1024));


    // Delete existing files in the target directory
    deleteFilesInDirectory(targetDirectory);

    // Split the audio into chunks
    for (let index = 0; index < totalChunks; index++) {
        const start = index * chunkSizeInMB * 1024 * 1024;
        const end = Math.min((index + 1) * chunkSizeInMB * 1024 * 1024, fileSizeInBytes);
        const outputPath = `./files/slicedAudio/audio-chunk-${index}.mp4` // Update the file extension

        cutter.cut({
            src: audioFilePath,
            target: outputPath,
            start: start / fileSizeInBytes * durationInSeconds,
            end: end / fileSizeInBytes * durationInSeconds
        });

        console.log(`Chunk ${index} sliced and saved as ${outputPath}`);
    }

    resolve('Slicing completed')
  }catch(error){
    reject(error)
  }

  })
}

// Function to get the duration of an MP3 file using ffprobe
function getMP3Duration(filePath) {
    const ffprobePath = ffprobe.path;
    const { spawnSync } = require('child_process');
    const result = spawnSync(ffprobePath, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath]);
    return parseFloat(result.stdout);
}

// Function to delete all files in the target directory
function deleteFilesInDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        }
    });
}

module.exports = audioSlicer
