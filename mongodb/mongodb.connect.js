const mongoose = require("mongoose");

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbCluster = process.env.DB_CLUSTER;

const mongoURI = `mongodb+srv://${dbUser}:${dbPass}${dbCluster}`;

async function connect() {
  try {
    await mongoose.connect(mongoURI);
  } catch (err) {
    console.error("Error connecting to mongodb");
    console.error(err);
  }
}

module.exports = { connect };
