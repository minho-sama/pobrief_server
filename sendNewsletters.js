const supabaseClient = require("./supabaseConfig.js");
const sendTempEmail = require("./lib/awsSes/sendTemplatedEmail.js");
const uniqid = require("uniqid")

async function sendNewsletters() {
  try {
    // Fetch all users

    const users = await getUsers("user_id, email, latest_send_date");

    // Loop through users and fetch their subscriptions
    for (const user of users) {
      const podcastSummariesOfUser = [];
      let finalEmailJson = null

      //subscriptions: array of objects
      const subscriptionsOfUser = await getSubsriptionsOfUser(user.user_id);

      for (const subscription of subscriptionsOfUser) {
        const podcastsOfChannel = await getPodcastsOfChannel(
          subscription.channel_id,
          user.latest_send_date
        );

        podcastSummariesOfUser.push(...podcastsOfChannel);
      }

      if (podcastSummariesOfUser.length < 1) continue; //skip users that don't have new episodes

      try {
        //try-catch: If an error occurs because of missing summary, it will be caught, logged, BUT the loop will CONTINUE with the next user.
        finalEmailJson = createFinalJsonAndSanitize(user, podcastSummariesOfUser);
        //try-catch: If an error occurs with sending the email, it will be caught, logged, BUT the loop will CONTINUE with the next user.
        await sendTempEmail(finalEmailJson);

        await saveSentEmailTextToDB(user.user_id, finalEmailJson, true, "No Error")

        //priginally it was in finally block
        //edge case: podcast is being processed, and there is no summary yet. When sending newsletters, user won't get the email because of missing summary error. 
        //calling updateUserLatestSendDate here will make sure that in the next iteration os newsletters sending, user will get previous week's summaries
        await updateUserLatestSendDate(user.user_id)

      } catch (error) {
        console.error(
          `Error occurred while sending email for user ${user.email}:`,
          error
        );
        await saveSentEmailTextToDB(user.user_id, finalEmailJson, false, error)
      } finally{
          //NE FELEJTSD EL a fallback Text Partot is maintainelni meg a sanitize podcastot ha kell új property vagy már nem kell régi!
      }
    }

    console.log("Newsletters sent successfully");
  } catch (error) {
    console.error(
      "Error occurred while retrieving podcasts/sending newsletters:",
      error
    );
  }
}

const getUsers = async (columns) => {
  const { data: users, error: userError } = await supabaseClient
    .from("users")
    .select(columns);

  if (userError) {
    throw userError;
  }

  return users;
};

const getSubsriptionsOfUser = async (userID) => {
  const { data: subscriptions, error: subscriptionError } = await supabaseClient
    .from("subscriptions")
    .select("channel_id, podcast_channels(name)") //podcast_channels(name, popularity, lastEpisodeDate, stc)
    .eq("user_id", userID);

  if (subscriptionError) {
    throw subscriptionError;
  }

  return subscriptions;
};

const getPodcastsOfChannel = async (channelID, userLatestSendDate) => {
  const { data: podcastsOfChannel, error: podcastError } = await supabaseClient
    .from("podcasts")
    .select(
      "name, podcast_created_at, summary, image_url, date_published, audio_url"
    )
    .eq("channel_id", channelID)
    .gte("podcast_created_at", userLatestSendDate); //we're using podcast_created_at, not date_published!

  if (podcastError) {
    throw podcastError;
  }

  return podcastsOfChannel;
};

const createFinalJsonAndSanitize = (user, podcastSummaries) => {
  const sanitizedPodcastSummaries = podcastSummaries.map((podcast) => {
    if (!podcast.summary) {
      throw new Error(`Summary is missing for podcast ${podcast.name}`);
    }

    let summary;
    //supabase should validate json when saving to db, but just to be sure
    try {
      summary = JSON.parse(podcast.summary);
    } catch (error) {
      console.error(
        `Error parsing summary for podcast ${podcast.name} for user ${user.user_id}:`,
        error
      );
      return null;
    }

    const sanitizedPodcast = {
      title: podcast.name || "No Title Provided",
      podcast_created_at: podcast.podcast_created_at || "No Date Provided",
      audio_url: podcast?.audio_url || "No Audio URL Provided",
      image_url: podcast?.image_url || "No Image URL Provided",
      date_published: podcast?.date_published || "No Publish Date Provided",
      summaryOverview:
        summary?.summaryOverview || "No Summary Overview Provided",
      actionableInsights:
        summary?.actionableInsights || "No Actionable Insights Provided",
      keyTakeaways: summary?.keyTakeaways || "No Key Takeaways Provided",
      memorableQuotes:
        summary?.memorableQuotes || "No Memorable Quotes Provided",
    };

    return sanitizedPodcast;
  });

  const finalEmailJson = {
    userEmail: user.email,
    userID: user.user_id,
    podcasts: sanitizedPodcastSummaries,
  };

  return finalEmailJson;
};

const saveSentEmailTextToDB = async (userID, finalEmailJson, success, errorMessage) => {

  const {error } = await supabaseClient
    .from("newsletters")
    .insert([
      {
        email_id: uniqid(),
        content: JSON.stringify(finalEmailJson),
        user_id: userID,
        success: success,
        error_message: errorMessage
      },
    ])
    .select();

  if (error) {
    console.error(error);
  }
};

const updateUserLatestSendDate = async (userID) => {
  try {
      
    const { data, error } = await supabaseClient
      .from("users")
      .update({ latest_send_date: new Date() })
      .eq("user_id", userID)
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`An error occurred while updat: updating latest_send_date for user: ${userID}`, error);
  }
}

sendNewsletters();

