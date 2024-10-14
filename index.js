const express = require('express');
const app = express();
const  bodyParser = require('body-parser');
const dotenv = require('dotenv').config();  
const dbConnect = require('./config/dbConnect');
const PORT = process.env.PORT || 4000;
const {notFound, errorHandler} = require('./middlewares/errorHandler.js');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes'); 
// Connect to database
dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);

app.use(notFound);
app.use(errorHandler);