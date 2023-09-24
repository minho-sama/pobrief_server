//https://taddy.org/developers/podcast-api/webhooks
//https://github.com/taddyorg/example-project

//ngrok api endpoint for testing purposes from live taddy ha lokálban teszteltem

//tesztelni majd még h mivan ha elhasal a newsletter mert pl rossz email v mert bouncolt (verifyolni egy emailt aztán törölni az emailt és úgy küldeni rá, miközben a többi usernek a rendes emailre)
//nem newsletter hanem úgy az egész app: UNSUBSCRIBE FROM PODBRIEF: törölni db-ből mindenhol, tokenjét invalidatelni!

const express = require("express");
require("dotenv").config({ path: require("find-config")(".env") });
const podcastProcessQueue = require("./podcastQueue.js");
const processNewPodcastNotification = require("./processNotification.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON request body

// Middleware to verify TADDY Webhook Secret
const verifyTaddySecret = (req, res, next) => {
  const taddySecret = req.headers["x-taddy-webhook-secret"];

  if (taddySecret !== process.env.TADDY_WEBHOOK_SECRET) {
    return res.status(403).send("Forbidden: Invalid TADDY Webhook Secret");
  }

  next();
};

//init process QUEUE
const podcastQueue = podcastProcessQueue();

app.post("/podbrief/processEpisode", verifyTaddySecret, async (req, res) => {
  const podcastData = req.body.data;

  if (podcastData) {
    try {
      //console.log(podcastData);
      
      res
        .status(200)
        .send(`Notification processed successfully for ${podcastData.uuid}`);

      await processNewPodcastNotification(podcastData, podcastQueue);

    } catch (error) {
      console.error(
        `Error processing Podcast (Webhook) for ${podcastData.uuid}:`,
        error
      );
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(400).send("Bad Request: Invalid notification format");
  }
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
