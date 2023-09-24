const { CreateTemplateCommand } = require("@aws-sdk/client-ses");
const aws_ses_client = require("./awsSesConfig.js");
const filesystem = require("fs");

//quoted text: https://stackoverflow.com/questions/5594980/is-there-a-trick-to-prevent-gmails-quoted-text-from-hiding-my-email-footer/41191561

async function createSESTemplate() {

  const hbsTemplate = filesystem.readFileSync('../../files/staticFiles/emailTemplate.hbs', 'utf8');
  
  const templateObject = {
    Template: {
      TemplateName: "fallback16",
      SubjectPart:
        "Your weekly podcasts, {{#if userEmail}}{{userEmail}}{{else}}Podcaster@gmail.com{{/if}}!",
      HtmlPart: hbsTemplate,
      TextPart: "{{TextPart}}",
    },
  };

  const command = new CreateTemplateCommand(templateObject);

  try {
    const response = await aws_ses_client.send(command);
    return response;
  } catch (error) {
    console.error("Error creating SES template:", error);
    throw error;
  }
}

async function runCreateTemplate() {
  try {
    const response = await createSESTemplate();
    console.log("Template created:", response);
  } catch (error) {
    console.error("Error:", error);
  }
}

runCreateTemplate();
