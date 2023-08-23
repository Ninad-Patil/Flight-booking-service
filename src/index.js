const { serverConfig, logger } = require("./config");
const apiRoutes = require("./routes");
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes);

app.listen(serverConfig.PORT, () => {
  console.log(`server running on port ${serverConfig.PORT}`);
  logger.info("Successfully started the server", "root", {});
});
