const Mongoose = require("mongoose");

const db = Mongoose.connection;

db.once("open", () => {
  console.log("Connected to database.");
});
let connectDB;
if (process.env.DB_HOST) {
  connectDB = async () => {
    await Mongoose.connect(
      `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  };
} else {
  connectDB = async () => {
    await Mongoose.connect(
      `mongodb+srv://Mohamed_Ash:23633144Aa1@cluster0.kx7k6h2.mongodb.net/?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  };
}
module.exports = {
  connectDB,
};
