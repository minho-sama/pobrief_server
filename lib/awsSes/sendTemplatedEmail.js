const { SendTemplatedEmailCommand } = require("@aws-sdk/client-ses");
const awsClient = require("./awsSesConfig.js");

const sendTemplatedEmail = (finalEmailJson) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sendTemplatedEmailCommand = createSendEmailTemplateCommand(
        "fallback16",
        finalEmailJson
      );
      const awsResponse = await awsClient.send(sendTemplatedEmailCommand);
      console.log(`templated email sent for user ${finalEmailJson.userEmail} `);
      resolve(awsResponse);
    } catch (err) {
      console.error(
        `Failed to send template email for user ${finalEmailJson.userEmail}`,
        err
      );
      reject(err) //The loop continues even if an error occurs! (eg email is not verified)
    }
  });
};

const mockdata = {
  userEmail: "testuser@gmail.com",
  podcasts: [
    {
      name: "random name",
      podcast_created_at: "2023-09-10T20:34:18.622706+00:00",
    },
    {
      name: "A portrait of the best worst programmer",
      podcast_created_at: "random date",
    },
    {
      name: "Doomed to discuss AI",
      podcast_created_at: "2023-09-12T11:44:03.837919+00:00",
    },
  ],
};

const createSendEmailTemplateCommand = (templateName, finalEmailJson) => {
  //INTENTIONAL ERROR TEST: Delete or Comment out for production
  // if (finalEmailJson.userEmail === "jimmymcgill@gmail.com") {
  //   return new SendTemplatedEmailCommand({
  //     Destination: { ToAddresses: ["nonExisting@gmail.com"] },
  //     TemplateData: JSON.stringify(finalEmailJson),
  //     Source: "nguyen.anh.minh.stud@gmail.com",
  //     Template: templateName,
  //   });
  // }

  //for the fallback Text Part
  const concatenatedInfo = createPodcastsText(finalEmailJson.podcasts)
  const finalEmailJsonWithTextPart = {...finalEmailJson, TextPart: concatenatedInfo}

  return new SendTemplatedEmailCommand({
    Destination: { ToAddresses: ["timurcsillik@gmail.com"] },
    TemplateData: JSON.stringify(finalEmailJsonWithTextPart),
    Source: "nguyen.anh.minh.stud@gmail.com",
    Template: templateName
  });
};

//for the fallback TextPart
function extractPodcastText(podcast) {
  const {
    title,
    podcast_created_at,
    audio_url,
    image_url,
    date_published,
    summaryOverview,
    actionableInsights,
    keyTakeaways,
    memorableQuotes
  } = podcast;

  const actionableInsightsString = actionableInsights.map(item => `- ${item}`).join('\n');
  const keyTakeawaysString = keyTakeaways.map(item => `- ${item}`).join('\n');
  const memorableQuotesString = memorableQuotes.map(item => `- ${item}`).join('\n');

  return `
    Title: ${title}
    Podcast Created At: ${podcast_created_at}
    Audio URL: ${audio_url}
    Image URL: ${image_url}
    Date Published: ${date_published}
    Summary Overview: ${summaryOverview}

    Actionable Insights:
    ${actionableInsightsString}

    Key Takeaways:
    ${keyTakeawaysString}

    Memorable Quotes:
    ${memorableQuotesString}
  `;
}

function createPodcastsText(podcasts) {
  const result = podcasts.reduce((accumulator, podcast) => {
    const podcastInfo = extractPodcastText(podcast);
    return accumulator + podcastInfo;
  }, '');

  return result;
}


// const send = async () => {
//   await sendTemplatedEmail(mockdata);
// };

// send();

module.exports = sendTemplatedEmail;
