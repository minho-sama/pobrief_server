//monitoring yt channels subscribes by our users
//initiating api calls when new podcast drops

//problems: 
//run cronjob?
//not all videos are podcasts, eg Adam Ragusea

const axio = require("axios");
const spbs = require("../../supabaseConfig.ts");
require("dotenv").config({ path: require("find-config")(".env") });

//https://www.googleapis.com/youtube/v3/search?key={your_key_here}&channelId={channel_id_here}&part=snippet,id&order=date&maxResults=10

