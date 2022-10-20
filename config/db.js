const mongoose = require('mongoose');

const connectDB = async () => {
  const URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.s21tj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

  try {
    const conn = await mongoose.connect(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (ConnError) {
    console.error(`Error: ${ConnError.message}`.red.underline.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
