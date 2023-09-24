const { SendEmailCommand } = require("@aws-sdk/client-ses");
const sesClient = require("./awsSesConfig.js")

const createSendEmailCommand = (toAddress: string, fromAddress: string) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: [
        /* more items */
      ],
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: "<h1>Hello thereee</h1>",
        },
        //fallback
        Text: {
          Charset: "UTF-8",
          Data: "Hello there",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "podbrief",
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

const run = async () => {
  const sendEmailCommand = createSendEmailCommand(
    "n.a.minh1106@gmail.com",
    "n.a.minh1106@gmail.com"
  );

  try {
    console.log("Email successfully sent")
    return sesClient.send(sendEmailCommand);
  } catch (e) {
    console.error("Failed to send email.", e);
    return e;
  }
};

run()

//handle errors
//email address encoding (á ő é stb)
//avoid spam: https://repost.aws/knowledge-center/ses-email-flagged-as-spam
//MONITOR HARD BOUNCES
//majd frankfurtra állítani v vmi közelebbire
//increase throughput : https://docs.aws.amazon.com/ses/latest/dg/troubleshoot-throughput-problems.html
//send bulk: https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/ses/src/ses_sendbulktemplatedemail.js