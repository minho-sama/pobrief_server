const fs = require("fs");
const path = require("path");
const whisper = require("./openaiConfig.js");

const audioChunksFolder = path.join(__dirname, "../../files/slicedAudio");
const outputFilePath = path.join(__dirname, "../../files/transcription.txt");

async function getTranscriptionsForAudioChunks() {
  console.log("running whisper js");

  try {
    const audioFiles = fs.readdirSync(audioChunksFolder).filter((file) => file.endsWith(".mp4"));

    const concatenatedTranscriptions = await transcribeInBatches(audioFiles, 3)

    await writeTranscriptionToFile(concatenatedTranscriptions);
  } catch (error) {
    console.error("Error transcribing audioFiles:", error);
  }
}

async function transcribeAudio(audioFilePath) {
  const transcription = await whisper.audio.transcriptions.create({
    file: fs.createReadStream(audioFilePath),
    model: "whisper-1",
    language: "en",
  });

  return transcription.text;
}

function writeTranscriptionToFile(transcription) {
  fs.writeFile(outputFilePath, transcription, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Transcriptions written to transcription.txt");
    }
  });
}

const transcribeInBatches = async (audioFiles, batchSize) => {

  const transcriptionStringBatches = []


  for (let i = 0; i < audioFiles.length; i += batchSize ){
    const audioBatch = audioFiles.slice(i, i + batchSize)
    const transcriptions = await Promise.all(
      audioBatch.map(async (audioFile) => {
        const audioFilePath = path.join(audioChunksFolder, audioFile);
        const transcription = await transcribeAudio(audioFilePath);
        console.log(audioFilePath + " transcribed");
        return transcription;
      })
    )
      transcriptionStringBatches.push(transcriptions.join("\n"))
  }

  const concatenatedTranscriptions = transcriptionStringBatches.join("\n");
  return concatenatedTranscriptions
}

module.exports = getTranscriptionsForAudioChunks;
