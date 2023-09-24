const spbsClient = require("../../supabaseConfig.js");

const isChannelSubscribedTo = async (channel_id) => {
  try {
    const { data, error } = await spbsClient
      .from("subscriptions")
      .select("channel_id")
      .eq("channel_id", channel_id);

    if (error) {
      console.error("Error querying Supabase:", error.message);
      return false; // Return false in case of an error
    }

    const isSubscribedTo = data.length > 0;

    if (!isSubscribedTo) {
      console.log(`Channel ${channel_id} has no Subscribers`);
    } else {
      console.log(`Channel ${channel_id} HAS Subscriber(s), checking if Episode is already in table`);
    }

    return isSubscribedTo; // Return true if at least one occurrence is found
  } catch (error) {
    console.error("Error:", error);
    return false; // Return false in case of an error
  }
};

module.exports = isChannelSubscribedTo;
