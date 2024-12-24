const express = require("express");
const { createWorker } = require("tesseract.js");

const app = express();
const port = 3001;

app.post("/", async (req, res) => {
  const worker = await createWorker("eng");
  const ret = await worker.recognize("./images/image.jpg");
  console.log(ret.data.text);
  res.send(ret.data.text);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});