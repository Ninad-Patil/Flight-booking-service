const { serverConfig, logger, Queue } = require("./config");
const Crons = require("./utils/common/cron-jobs");
const apiRoutes = require("./routes");
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes);
app.use("/bookingService/api", apiRoutes);

app.listen(serverConfig.PORT, async () => {
  console.log(`server running on port ${serverConfig.PORT}`);
  logger.info("Successfully started the server", "root", {});
  Crons();
  await Queue.connectQueue();
});
