const supabase = require("../../supabaseConfig.js");
const getPodcastSeriesInfo = require("../podcastAPI/getPodcastChannelInfo.js");

const insertChannelToPodcastChannelsTable = async (channelID) => {
  try {
    const { data, error } = await supabase
      .from("podcast_channels")
      .select()
      .eq("channel_id", channelID);

    if (error) {
      throw new Error(error);
    }

    if (data.length > 0) {
      console.log(
        "channel " +
          channelID +
          " is already present in 'podcast_channels'. Proceed to subscribeToChannel"
      );
      return;
    }

    //fetch podcast channel data from taddy
    const { name, description, imageUrl, itunesInfo } =
      await getPodcastSeriesInfo(channelID);

    //insert podcast channel data to db
    const { data: insertedData, error: insertError } = await supabase
      .from("podcast_channels")
      .insert([
        {
          channel_id: channelID,
          name: name,
          description: description,
          image_url: imageUrl,
          publisher_name: itunesInfo.publisherName,
        },
      ]);

    if (insertError) {
      throw insertError;
    }

    return insertedData;
  } catch (error) {
    console.error(error);
  }
};

const updateSubscribersCount = async (channelID, operation) => {
  try {
    const { data, error: queryError } = await supabase
      .from("podcast_channels")
      .select("subscribers_count")
      .eq("channel_id", channelID);

    let subCount = data[0].subscribers_count;

    if (operation === "add") {
      subCount++;
    }

    if (operation === "remove") {
      if (subCount === 0) {
        return; //prevents subCount going below 0 (more info on this below at unSubscribeFromChannel() )
      }
      subCount--;
    }

    if (queryError) {
      throw queryError;
    }

    const { error: updateError } = await supabase
      .from("podcast_channels")
      .update({ subscribers_count: subCount })
      .eq("channel_id", channelID);

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    console.error("Error updating subscribers count:", error);
  }
};

const subscribeToChannel = async (userID, channelID) => {
  try {
    //add channel to podcasts_channels table IF NOT ALREADY PRESENT
    await insertChannelToPodcastChannelsTable(channelID);

    // Check if the subscription already exists
    const { data, error } = await supabase
      .from("subscriptions")
      .select()
      .eq("channel_id", channelID)
      .eq("user_id", userID);

    if (error) {
      throw new Error(error);
    }

    if (data.length > 0) {
      throw new Error("user " + userID + " already subscribed");
    }

    //add +1 to subscribers_count
    await updateSubscribersCount(channelID, "add");

    // If subscription doesn't exist, proceed with insertion
    const { data: insertedData, error: insertError } = await supabase
      .from("subscriptions")
      .insert([{ channel_id: channelID, user_id: userID }]);

    if (insertError) {
      throw insertError;
    }

    return insertedData;
  } catch (error) {
    console.error(error);
  }
};

const unSubscribeFromChannel = async (userID, channelID) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("user_id", userID)
      .eq("channel_id", channelID);

    if (error) {
      throw error;
    } else {
      //if there was no subscription to be deleted, supabase will not return an error (or anything) so the subscribers_count can go below 0
      //todo: something like this: if data.length > 0 ... de mivel supabase nem ad vissza nem is lehet checkelni ekkora szart
      await updateSubscribersCount(channelID, "remove");
    }

    return data; //null, supabase doesn't return by default
  } catch (error) {
    console.error(error);
  }
};

// subscribeToChannel(
//   "638243b9-9c77-4bc0-9094-b32a441d3143",
//   "49cc55e1-4258-43a0-adf3-a0a71aa62c49"
// );

// unSubscribeFromChannel(
//  "638243b9-9c77-4bc0-9094-b32a441d3143",
//  "49cc55e1-4258-43a0-adf3-a0a71aa62c49"
// )
