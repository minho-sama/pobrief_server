const { SESClient} = require("@aws-sdk/client-ses");
require("dotenv").config({ path: require("find-config")(".env") });

const SES_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    region: process.env.AWS_REGION
}

const client = new SESClient(SES_CONFIG );

module.exports = client;
