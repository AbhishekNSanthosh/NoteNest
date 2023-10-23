const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userRoute = require('./Routes/user.js')
const cors = require('cors');
const { json } = require('body-parser');
const rateLimit = require('express-rate-limit');
dotenv.config();

const limiter = rateLimit({
    windowMs: 60000, // 1 second
    max: 1, // 1 request per second
    message: 'Rate limit exceeded. Please try again later.',
  });

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/user", userRoute,limiter);

const connectDb = () => {
    mongoose
        .connect(
            process.env.MONGO_URL)
        .then(() => {
            console.log("MONGODB CONNECTED");
        })
        .catch((err) => {
            console.log("Mongodb error : ", err);
        });
};

app.listen(process.env.PORT, async () => {
    connectDb();
    console.log(`Server started listening at port ${process.env.PORT}`)
})