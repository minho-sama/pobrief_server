const FS = require("fs");
const { YoutubeTranscript } = require("youtube-transcript");
const supabaseDB = require("../../supabaseConfig.ts");
//https://github.com/Kakulukian/youtube-transcript

//for testing
// const url1 = `https://www.youtube.com/watch?v=P8LC5EhqoPw&list=PLWDQtIyZRZu2w8oFtWGz9UZ8Af8FcMt5j&index=1`; //short manual cc
// const url2 = `https://www.youtube.com/watch?v=EWWXs3H1iZA&list=PLWDQtIyZRZu2w8oFtWGz9UZ8Af8FcMt5j&index=3&pp=iAQB`; //lengthy manual cc
// const url3 = `https://www.youtube.com/watch?v=ovDuX-qRn8M`; //short automatic cc

//subscribe to podcast table inserts
const podcasts = supabaseDB
  .channel("custom-insert-channel")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "podcasts" },
    (payload) => {
      YoutubeTranscript.fetchTranscript(payload.new.url, {lang: "en"}).then(
        //Todo: english transcript only
        (transcriptArray) => {
          let transcript = concatenateTranscript(transcriptArray);
          transcript = transcript.trim().replace(/\s+/g, " "); //removes unneccessary whitespaces and breaks

          writeTxt(transcript);

          saveTranscriptToDB(transcript, payload.new.url); //temporary solution, while video_id is null in db. replace with payload.new.video_id
        }
      );
    }
  )
  .subscribe();

//HELPER FUNCTIONS
const concatenateTranscript = (transcriptArray) => {
  let concatenatedText = "";

  for (const textBlob of transcriptArray) {
    concatenatedText += textBlob.text + " ";
  }

  return concatenatedText;
};

const writeTxt = (transcript) => {
  FS.writeFile("transcript.txt", transcript, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

async function saveTranscriptToDB(transcript, videoID) {
  try {
    const { data, error } = await supabaseDB
      .from("podcasts")
      .update([{ transcript: transcript }])
      .eq("url", videoID); //temporary solution, while video_id is null in db. replace "url" with video_id

    if (error) {
      console.error("Supabase API error:", error);
    } else {
      console.log("Data inserted");
    }
  } catch (exception) {
    console.error("An error occurred:", exception);
  }
}

//tesztelni mivan ha egyszerre sok megjelenik a db-ben!

//----YT TRANSCRIPTION ----
//tesztelni ytdl+whisper megoldást, gyorsabb vagy lassabb, mennyire lehet skálázni ha egyszerre sokat kell majd,
// mennyire erőforrás-igényes, mennyivel pontosabb és ez megéri e. mp3-at úgyis tárolja a supabase so emiatt nem kell aggódni
//(az viszont fix jobb mint a sima api h bármelyik videóhoz tud generálni)
//pár ytdl-core funkciót MINDENKÉPP HASZNÁLNI pl yt videó description, yt videó cím, dátum, stb
//https://github.com/fent/node-ytdl-core
//https://github.com/fent/node-ytdl-core/issues/712
//kombinálni whisperrel
