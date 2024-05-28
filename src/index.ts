import express from "express";
import { configDotenv } from "dotenv";
import router from "./router";
configDotenv();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
