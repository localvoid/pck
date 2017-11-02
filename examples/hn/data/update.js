const fs = require("fs");
const https = require("https");
const TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";

function itemUrl(id) {
  return `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
}

function get(url) {
  return new Promise((resolve) => {
    https.get(url, (resp) => {
      let data = "";

      resp.on("data", (chunk) => { data += chunk; });
      resp.on("end", () => { resolve(data); });
    });
  });
}

async function loadData() {
  const topStories = JSON.parse(await get(TOP_STORIES_URL));
  const stories = [];
  let i = 1;
  for (const id of topStories) {
    console.log(`[${i++}/${topStories.length}]: ${id}`);
    stories.push(JSON.parse(await get(itemUrl(id))));
  }

  return stories;
}

loadData()
  .then((topStories) => {
    fs.writeFileSync("./top_stories.json", JSON.stringify(topStories));
  });
