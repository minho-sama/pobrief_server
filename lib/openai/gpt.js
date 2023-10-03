//Calls GPT api 

const openAI = require("./openaiConfig.js");
const fileSystem = require("fs");
const path = require("path");
const uniqid = require("uniqid")

function summarizeWithGpt(
  summaryPromptFilePath,
  outputSummaryChunksJSONFilePath,
  transcriptionDirectoryPath,
  retryCount = 0
) {
  return new Promise((resolve, reject) => {
    // Read the summary prompt file
    fileSystem.readFile(summaryPromptFilePath, "utf8", (err, summaryPrompt) => {
      if (err) {
        console.error(err);
        return;
      }

      // Read the list of transcription files in the directory
      fileSystem.readdir(transcriptionDirectoryPath, async (err, files) => {
        if (err) {
          console.error(err);
          return;
        }

        // Create an array to store promises for generating responses
        const responsePromises = [];

        // Create an array to store responses for JSON output
        const jsonResponseData = [];

        // Iterate over each file in the directory
        files.forEach((file) => {
          const filePath = path.join(transcriptionDirectoryPath, file);

          // Read the transcription file
          const transcription = fileSystem.readFileSync(filePath, "utf8");

          // Generate a chat response for each transcription
          const responsePromise = generateChatResponse(
            summaryPrompt,
            transcription
          );
          responsePromises.push(responsePromise);
        });

        try {
          // Wait for all responses to be generated
          const responses = await Promise.all(responsePromises);

          // Prepare data for JSON output
          responses.forEach((response, index) => {
            // console.log(response);

            response = JSON.parse(
              JSON.stringify(response).replace(/(\r\n|\n|\r)/gm, "")
            ); //removes whitespace,  maybe prevents unexpected token

            jsonResponseData.push({
              index: index + 1,
              response: JSON.parse(response), //json parse response néha dob egy error: unexpected tokent
            });
          });

          const podcastJSON = {
            id: uniqid(),
            name: "",
            date: "",
            //stb
            data: jsonResponseData,
          };

          // Write the responses to the summary JSON file
          fileSystem.writeFile(
            outputSummaryChunksJSONFilePath,
            JSON.stringify(podcastJSON, null, 2),
            "utf8",
            (err) => {
              if (err) {
                console.error(
                  `Error writing summary to ${outputSummaryChunksJSONFilePath}:`,
                  err
                );
                reject(err);
              } else {
                console.log(
                  `Summary written to ${outputSummaryChunksJSONFilePath}`
                );
                resolve(podcastJSON);
              }
            }
          );
        } catch (error) {
          console.error("Error generating chat responses:", error);

          if (retryCount < 3) {
            console.log(`Retrying GPT summarization (Attempt ${retryCount + 1})`);
            summarizeWithGpt(summaryPromptFilePath, outputSummaryChunksJSONFilePath, transcriptionDirectoryPath, retryCount + 1)
              .then(resolve)
              .catch(reject);
          } else {
            console.error("Max retries reached. Terminating GPT summarization.");
            reject(error);
          }
    
        }
      });
    });
  });
}

const generateChatResponse = async (summaryPrompt, transcription) => {

  const schema = {
    "type": "object",
    "properties": {
      "summaryOverview": {
        "type": "string",
        "description": "The detailed synopsys",
      },
      "keyTakeaways": {
        "type": "array",
        "description": "The key takeaways",
        "items": {"type": "string"}
      },
      "actionableInsights": {
        "type": "array",
        "description": "The actionable insights",
        "items": {"type": "string"}
      },
      "memorableQuotes":{
        "type" : "array", 
        "description": "the memorable quotes",
        "items": {"type" : "string"}
      }
    }
  }

  const chatCompletion = await openAI.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `${summaryPrompt} ${transcription}`,
      },
    ],
    functions: [{ name: "podcast_contents", parameters: schema}],
    function_call: {name: "podcast_contents"}
  });

  const summary = chatCompletion.choices[0].message.function_call.arguments

  return summary
};

//for testing
//summarizeWithGpt("../../server/files/staticFiles/summaryPrompt.txt", "../../server/files/summaryChunks.json", "../../server/files/slicedTranscription/")

module.exports = summarizeWithGpt

// https://github.com/openai/openai-node
// https://github.com/openai/openai-node/discussions/217