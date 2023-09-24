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

const generateSummaryOverview = async (summaries) => {

  const chatCompletion = await openAI.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `${summaries} Detailed Synopsis: Craft a 10-12 sentence summary that encapsulates the main theme, major discussion points, and the general tone of the episode.`,
      },
    ],
  });

  const summary = chatCompletion.choices[0].message.content

  return summary
};

module.exports = mapReduceSummary