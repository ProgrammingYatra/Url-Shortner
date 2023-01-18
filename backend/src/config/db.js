const mongoose = require("mongoose");
exports.connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
    })
    .then((data) =>
      console.log(`MongoDB is Connected to ${data.connection.host}`)
    );
};
