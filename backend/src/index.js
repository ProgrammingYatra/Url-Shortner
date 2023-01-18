require("dotenv").config()
const app=require("./app");
const { connectDB } = require("./config/db");

process.on("unhandledRejection",(err)=>{
    console.log(`Unhandle Rejection ${err.message}`);
    process.exit(1);
})
//db connection
connectDB()

app.listen(process.env.PORT, function () {
    console.log('Express app running on port ' + (process.env.PORT))
});