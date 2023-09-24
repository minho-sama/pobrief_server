//For TESTING purposes!
//actual episode data comes from TADDY WEBHOOK

//get episode info and save to db
require("dotenv").config({ path: require("find-config")(".env") });
const axi = require('axios');
const saveEpisodeToDatabse = require("../dbHelpers/saveEpisodeDataDB.js")

const taddyEndpoint = 'https://api.taddy.org';

const headerz = {
  'Content-Type': 'application/json',
  'X-USER-ID': process.env.TADDY_USER_ID,
  'X-API-KEY': process.env.TADDY_API_KEY
};

async function fetchDataAndInsert(episodeName) {
    try {

      //episodeUUID instead of episode name
      const data = {
        query: `{ getPodcastEpisode(name:"${episodeName}") { uuid name imageUrl datePublished audioUrl duration episodeType podcastSeries {uuid name} } }`
      }

      const response = await axi.post(taddyEndpoint, data, { headerz });
      const podcastData = response.data.data.getPodcastEpisode

      saveEpisodeToDatabse(podcastData)

      return podcastData

    } catch (error) {
      console.error('Error fetching data from Taddy:', error);
    }

  }

module.exports = fetchDataAndInsert