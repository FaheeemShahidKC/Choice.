//======================== Mongodb connection ===================
const mongoDb = require('./config/mongoAuth')
mongoDb.mongoDB()

//======================= Setting express js =========================
const express = require('express')
const app = express()

//========================== port number ============================
const port = 8080
const path = require('path') // requiring path module

//====================== requiring userRoutes ===========================
const userRoutes = require('./Routes/userRoutes')
const adminRoutes = require('./Routes/adminRoutes')
const noCache = require("nocache");

//================ Making public folder as atatic ======================
app.use(express.static(path.join(__dirname, "public")))

app.use(noCache());
//====================== Route setup ==================================
app.use('/admin', adminRoutes)
app.use('/', userRoutes)
app.use((req, res) => {
      res.status(404).render(__dirname + '/Views/userView/404.ejs');
});
//===================== Listening the port ===========================
app.listen(port, () => {
      console.log('Server is running on the port 8080');
})