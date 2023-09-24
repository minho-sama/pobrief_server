require("dotenv").config({ path: require("find-config")(".env") });
const ax = require('axios');

const taddyURL = 'https://api.taddy.org';

const headers = {
  'Content-Type': 'application/json',
  'X-USER-ID': process.env.TADDY_USER_ID,
  'X-API-KEY': process.env.TADDY_API_KEY
};

async function getPodcastChannelInfo(channelID) {
    try {

      const data = {
        query: `{
          getPodcastSeries(uuid:"${channelID}"){
            uuid
            name
            description
            imageUrl
            itunesInfo{
              uuid,
              publisherName
            }
          }
        }`
      }

      const response = await ax.post(taddyURL, data, { headers });
      const podcastChannelData = response.data.data.getPodcastSeries

      return podcastChannelData

    } catch (error) {
      console.error('Error fetching podcastChannelData from Taddy:', error);
    }

  }

module.exports = getPodcastChannelInfo