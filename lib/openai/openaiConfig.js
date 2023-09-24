// const axios = require('axios');

// axios.get('https://dummyjson.com/products/1')
//   .then(res => console.log(res.data))
//   .catch(error => console.error('Error:', error.message));

const { OpenAI } = require("openai");
require("dotenv").config({ path: require("find-config")(".env") });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  configuration: process.env.OPENAI_ORGANIZATION_ID
});

module.exports = openai;
