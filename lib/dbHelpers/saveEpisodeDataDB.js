const supabaseAPI = require("../../supabaseConfig.js");

const saveEpisodeDataDB = async (podcastData) => {
  
  // Insert podcast data into Supabase
  const { data: insertData, error } = await supabaseAPI
    .from("podcasts")
    .insert([
      {
        uuid: podcastData.uuid,
        name: podcastData.name,
        image_url: podcastData.imageUrl,
        date_published: new Date(podcastData.datePublished * 1000), //new Date(podcastData.datePublished*1000).toLocaleDateString('en-GB', { timeZone: 'Europe/London' }),
        audio_url: podcastData.audioUrl,
        duration: podcastData.duration,
        channel_id: podcastData.podcastSeries.uuid,
      },
    ])
    .select();

  if (error) {
    console.error("Error inserting data into 'podcasts':", error);
    throw error;
  } else {
    console.log(`New episode inserted into 'podcasts': ${insertData}`);
  }
};

module.exports = saveEpisodeDataDB
