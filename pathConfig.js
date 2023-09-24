const path = require('path');


module.exports = {

  //gpt
  summaryPromptFile: path.join(__dirname, './files/staticFiles/summaryPrompt.txt'),
  outputSummaryChunksJSONFile: path.join(__dirname, './files/summaryChunks.json'), //cleanup
  transcriptionDirectory: path.join(__dirname, './files/slicedTranscription/'), //cleanup

  //mapreduce
  outputSummaryTextFile: path.join(__dirname, './files/combinedSummary.txt'), //cleanup
  outputFinalSummaryFile: path.join(__dirname, './files/finalSummary.json'), //cleanup

  //for cleanup after saving final summary json to db (excluding the above files)
  slicedAudioDirectory: path.join(__dirname, './files/slicedAudio'), //cleanup
  downloadedMP4: path.join(__dirname, './files/downloaded.mp4' ), //cleanup
  transcriptionTXT: path.join(__dirname, './files/transcription.txt' ), //cleanup
  path: path //for the cleanup function
};
