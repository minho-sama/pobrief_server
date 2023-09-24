const axios = require("axios");
const supabaseApi = require("../../supabaseConfig.ts");
require("dotenv").config({ path: require("find-config")(".env") });

async function fetchYouTubeVideoData() {
  const apiKey = process.env.YT_DATA_API_KEY;
  const videoId = "dQw4w9WgXcQ" ; // _9b7BOJyE9A "dQw4w9WgXcQ" "Ks-_Mh1QhMc"
  const apiUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);

    if (response.status !== 200) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching YouTube video data:", error);
    return null;
  }
}

async function saveVideoInfoToDB(
  postDate,
  videoTitle,
  videoDescription,
  channelTitle,
  url
) {
  try {
    //checking for existing video
    const { data: existingData, error: existingError } = await supabaseApi
      .from("podcasts")
      .select("*")
      .eq("url", url); //replace with video_id

    if (existingError) {
      console.error("Supabase API error:", existingError);
      return;
    }

    if (existingData && existingData.length > 0) {
      console.log(
        "Row with the same video_id already exists. Skipping insertion."
      );
      return;
    }

    //inserting new video to podcasts table
    const { data, error } = await supabaseApi
      .from("podcasts")
      .insert([
        {
          post_date: postDate,
          video_title: videoTitle,
          video_description: videoDescription,
          channel_title: channelTitle,
          url: url,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase API error:", error);
    } else {
      console.log("Data inserted");
    }
  } catch (exception) {
    console.error("An error occurred:", exception);
  }
}

(async () => {
  const videoData = await fetchYouTubeVideoData();
  console.log(videoData?.items);
  // You can access the different parts of the data like:
  // const snippet = videoData.items[0].snippet;
  // const contentDetails = videoData.items[0].contentDetails;
  // const statistics = videoData.items[0].statistics;

  const snippet = videoData.items[0].snippet;
  saveVideoInfoToDB(
    snippet.publishedAt,
    snippet.title,
    snippet.description.trim().replace(/\s+/g, " "),
    snippet.channelTitle,
    `https://www.youtube.com/watch?v=${videoData.items[0].id}`
  );
})();
