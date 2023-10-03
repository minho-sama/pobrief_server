//mapReduce summary

const fs = require("fs");
const openAI = require("./openaiConfig.js");

function mapReduceSummary(
  outputSummaryTextFile,
  outputFinalSummaryFile,
  summaryChunksFile
) {
  return new Promise((resolve, reject) => {
    fs.readFile(summaryChunksFile, "utf8", async (err, json) => {
      if (err) {
        console.error("Error reading the JSON file:", err);
        reject(err);
        return;
      }

      // Parse the JSON data into a JavaScript object
      const podcastData = JSON.parse(json);

      // Create arrays to store all the summaries
      const allSummaries = [];
      const allActionableInsights = [];
      const allKeyTakeaways = [];
      const allQuotes = [];

      // Iterate through the data array
      podcastData.data.forEach((item) => {
        const response = item.response;

        allSummaries.push(response.summaryOverview);

        response.actionableInsights.forEach((insight) => {
          allActionableInsights.push(`- ${insight}`);
        });

        response.keyTakeaways.forEach((takeaway) => {
          allKeyTakeaways.push(`- ${takeaway}`);
        });

        response.memorableQuotes.forEach((quote) => {
          allQuotes.push(`- ${quote}`);
        });
      });

      // Shuffle the arrays randomly
      shuffleArray(allActionableInsights);
      shuffleArray(allKeyTakeaways);
      shuffleArray(allQuotes);

      // Select the first 7 items from each array
      const selectedActionableInsights = allActionableInsights.slice(0, 7);
      const selectedKeyTakeaways = allKeyTakeaways.slice(0, 7);
      const selectedQuotes = allQuotes.slice(0, 3);

      const summaryOverview = await generateSummaryOverview(
        allSummaries.join("")
      );

      // Create an object to store the selected summaries
      const selectedSummariesObject = {
        summaryOverview: summaryOverview,
        keyTakeaways: selectedKeyTakeaways,
        actionableInsights: selectedActionableInsights,
        memorableQuotes: selectedQuotes,
      };

      // Write the selected summaries to the txt file
      const summaryText =
        allSummaries.join("\n\n") +
        allActionableInsights.join("\n\n") +
        allKeyTakeaways.join("\n\n") +
        allQuotes.join("\n\n");
      fs.writeFile(outputSummaryTextFile, summaryText, "utf8", (err) => {
        if (err) {
          console.error(
            `Error writing summary to ${outputSummaryTextFile}:`,
            err
          );
          reject(err);
        } else {
          console.log(`Summary written to ${outputSummaryTextFile}`);
        }
      });

      // Write the selected summaries to a new JSON file
      const selectedSummariesJSON = JSON.stringify(
        selectedSummariesObject,
        null,
        2
      );

      fs.writeFile(
        outputFinalSummaryFile,
        selectedSummariesJSON,
        "utf8",
        (err) => {
          if (err) {
            console.error(
              `Error writing selected summaries to ${outputFinalSummaryFile}:`,
              err
            );
            reject(err);
          } else {
            console.log(
              `Selected summaries written to ${outputFinalSummaryFile}`
            );

            resolve(selectedSummariesJSON);
          }
        }
      );
    });
  });
}

// Function to shuffle an array in-place (Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

let prompt = `About us: At our core, we address the pressing needs of ambitious individuals who are eager to learn and develop themselves but grapple with the constraints of time. In a world filled with valuable insights tucked away in podcasts, we recognize the challenge of finding time to engage fully. We're driven by the belief that personal and professional growth should not be hindered by time limitations.
Our purpose is clear: to empower these driven learners with curated, condensed, and insightful content from the top podcasts in the industry. We understand that their time is a precious resource, and we're committed to delivering essential takeaways that align with their growth aspirations. Our vision is to create a seamless bridge between the desire for knowledge and the constraints of a busy schedule, fostering continuous learning and development.
In a world where efficiency and personal advancement are paramount, we are dedicated to providing a solution that not only saves time but elevates our readers' understanding, enabling them to stay informed, up-to-date, and inspired. Our commitment to quality, innovation, and the pursuit of knowledge propels us forward as we revolutionize the way ambitious individuals access and benefit from podcast wisdom.
Now, based on the introduction above I'm providing you with a podcast transcript and I require your expertise in extracting the most essential details from it as part of the newsletter. It's important that the transcript below is only a fragment of the whole as I am unable to post the whole transcript in one go due to length capacity. You must remember this as after the summarization has been perfected for this batch as well as the others as there will surely be overlapping stories and points between the batches that will need to be linked together for the whole picture to make sense.
Craft a 7-10 sentence summary that encapsulates the main theme, major discussion points, and the general tone of the episode. Emphasize the unique insights and perspectives shared by the hosts and attendees.
`

const generateSummaryOverview = async (summaries) => {

  const chatCompletion = await openAI.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `${summaries} ${prompt}`,
      },
    ],
  });

  const summary = chatCompletion.choices[0].message.content

  return summary
};

module.exports = mapReduceSummary