const sbpsAPI = require("../../supabaseConfig.js")

const isEpisodeInTable = async (episodeID) => {
    try{
        const {data, error} = await sbpsAPI
            .from('podcasts')
            .select('uuid')
            .eq("uuid", episodeID)

        if(error){
            console.error("Error querying database", error)
            return false //this way to podcast will go on to be processed, if it's already in present, supabase will reject it anyway
        }

        const isEpisodeAlreadyPresent = data.length > 0

        if(isEpisodeAlreadyPresent){
            console.log(`Episode ${episodeID} is already present in podcasts table, terminating enqueuing`)
        } else {
            console.log(`Episode ${episodeID} is NOT present in podcasts table, starting enqueuing`)
        }

        return isEpisodeAlreadyPresent

    } catch(error){
        console.error("Error while checking if episode is already in table: ", error)
        return false
    }
}

module.exports = isEpisodeInTable