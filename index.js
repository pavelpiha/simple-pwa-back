const express = require("express");
const nedb = require("nedb");
const rest = require("express-nedb-rest");
const cors = require("cors");
const webPush = require("web-push");

const app = express();
const datastore = new nedb({
  filename: "coffeelog.db",
  autoload: true,
});

const restAPI = rest();
restAPI.addDatastore("coffees", datastore);

app.use(cors());
app.use(express.json());


const vapidKeys = {
  publicKey:
    "BEsdZ6O7IZqQW_xITUgxKi-5k8-tWUH78Z8OMJhML85mr2YMArbP02VZ0C-lUE9_iZ-vn7kpCiT1dc2Ph3-qknQ",
  privateKey: "L00wjVp3ukV0XCieufaetl-VqwfEfEdtrLnu0i4rgVA",
};

webPush.setVapidDetails(
  "mailto:test@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Endpoint to save subscription object
app.post("/subscribe", (req, res) => {
  console.log("req", req);
  const subscription = req.body;
  datastore.insert(subscription, (err, newDoc) => {
    if (err) {
      res.status(500).json({ error: "Failed to save subscription" });
    } else {
      res.status(201).json({ message: "Subscription saved" });
    }
  });
});

// Endpoint to trigger push notifications
app.post("/sendNotification", (req, res) => {
  const notificationPayload = {
    notification: {
      title: "New Coffee Log",
      body: "A new coffee log has been added!",
      icon: "assets/icons/icon.png",
    },
  };

  datastore.find({}, (err, subscriptions) => {
    if (err) {
      res.status(500).json({ error: "Failed to retrieve subscriptions" });
    } else {
      const promises = subscriptions.map((subscription) =>
        webPush.sendNotification(
          subscription,
          JSON.stringify(notificationPayload)
        )
      );

      Promise.all(promises)
        .then(() => res.status(200).json({ message: "Notifications sent" }))
        .catch((error) => {
          console.error("Error sending notification, reason: ", error);
          res.sendStatus(500);
        });
    }
  });
});

app.use("/", restAPI);

app.listen(3000, "0.0.0.0", () => {
  // '0.0.0.0', to make it available on the network (not only on localhost)
  console.log("API ready at http://localhost:3000");
});
