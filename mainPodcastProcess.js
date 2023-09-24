const pathConfig = require("./pathConfig.js")
//const fetchEpisodeDataAndInsertToDB = require("../lib/podcastAPI/getEpisodeInfo.ts"); //testing purposes
const saveEpisodeDataToDB = require("./lib/dbHelpers/saveEpisodeDataDB.js")
const downloadPodcastAudio = require("./downloadMP3.js");
const audioSlicer = require("./audioSlicer.js");
const getTranscriptionWhisper = require("./lib/openai/whisper.js");
const sliceTranscription = require("./transcriptionSlicer.js");
const summarizeWithGpt = require ("./lib/openai/gpt.js")
const mapReduceSummary = require("./lib/openai/mapReduceSummary.js")
const saveFinalSummaryToDB = require("./saveFinalSummaryToDB.js")
const cleanup = require("./cleanup.js")

async function mainPodcastSummarizer(podcastData) {
  try {
    //for TESTING purposes: fetch episode data after new episode notification from podcast api
    //data comes from taddy webhhok in production
    //const result = await fetchEpisodeDataAndInsertToDB();

    //save episode after taddy webhook notification
    await saveEpisodeDataToDB(podcastData)

    if (podcastData.audioUrl) {

      await downloadPodcastAudio(podcastData.audioUrl);

    console.log(podcastData.audioUrl)
    } else {
      console.error("audioUrl is undefined in the result.");
    }

    // might have bugs because of promise?
    // slice audio
    await audioSlicer();

    // //transcript with whisper
    const resolveTranscription = await getTranscriptionWhisper();

    // //slice transcription
    await sliceTranscription(resolveTranscription);

    //gpt summarizes transcription chunks
    await summarizeWithGpt(pathConfig.summaryPromptFile, pathConfig.outputSummaryChunksJSONFile, pathConfig.transcriptionDirectory)

    // //create final summary
    const finalSummary = await mapReduceSummary(pathConfig.outputSummaryTextFile, pathConfig.outputFinalSummaryFile, pathConfig.outputSummaryChunksJSONFile)

    // //save json to db
    const resolveSummarySave = await saveFinalSummaryToDB(finalSummary, podcastData.uuid);

    console.log(`Podcast processed:`, podcastData.name);

    return resolveSummarySave //return promise so queue moves on
    
  } catch (error) {
    console.error("Main function error:", error);
    throw new Error("Error processing podcast. Move on to next podcast")
 
  } finally{
    //delete created files
    await cleanup()
  }
}

module.exports = mainPodcastSummarizer

//mainPodcastSummary(data of podcast);
