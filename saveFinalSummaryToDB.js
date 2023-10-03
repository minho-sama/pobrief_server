const supabase = require("./supabaseConfig.js");

//export to separate files
async function saveSummaryToDB(finalJson, podcastID) {
    try {
      
      const { data, error } = await supabase
        .from("podcasts")
        .update({ summary: finalJson }) // JSONB UTÁNANÉZNI
        .eq("uuid", podcastID)
        .select();
  
      if (error) {
        console.error("Error updating the database:", error);
        throw error;
      }
  
      console.log("Database update successful");
      return data;
    } catch (error) {
      console.error("An error occurred:", error);
      throw error;
    }
  }

  module.exports = saveSummaryToDB