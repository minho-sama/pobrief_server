const mainPodcastSummaryProcess = require("./mainPodcastProcess.js");

const createPodcastQueue = () => {
  const queue = [];
  let isProcessing = false;

  async function enqueue(podcastData) {
    queue.push(podcastData);
    console.log(`ENQUEUED Podcast ${podcastData.name}`)
    if (!isProcessing) {
      await processQueue();
    }
  }

  async function processQueue() {
    isProcessing = true;
    while (queue.length > 0) {
      const podcast = queue.shift();
      try {
        //start the creating of the podcast summary and save everything to DB
        console.log(`START PROCESSING ${podcast.name}`)
        await mainPodcastSummaryProcess(podcast);

      } catch (error) {
        console.error(`ERROR while processing podcast ${podcast.name /*.uuid */} in queue`, error);
      }
    }

    isProcessing = false;
  }

  return { enqueue };
};

module.exports = createPodcastQueue
