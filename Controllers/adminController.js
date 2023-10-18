const choiceAdmin = require('../Models/adminModel')
const bcrypt = require('bcrypt');
const choiceUser = require('../Models/userModel');
const choiceProduct = require('../Models/productModel')

//=========================== admin login =================================
const loadLogin = async (req,res)=>{
      try {
            res.render('login')
      } catch (error) {
            res.status(500).send("Internal Server Error"); 
      }
}

//================================ user managment page ================================
const loadUserManagment = async (req,res)=>{
      try {
            const users = await choiceUser.find();
            if(users){
                  res.render('userManagment',{userData : users});
            }else{
                  res.status(500).send("Internal Server Error"); 
            }
      } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error"); 
      }
}

//================================= loading the admin page by loging in by admin ============================
const loadAdmin = async (req, res) => {
      try {
            const thisData = await choiceAdmin.findOne({ email: req.body.adminEmail });
            if (thisData && await bcrypt.compare(req.body.adminPassword, thisData.password)) {
                  const users = await choiceUser.find();
                  req.session.admin_id = thisData._id;
                  res.render('userManagment',{userData : users});
            } else {
                  res.render('login', { error: "Invalid email or password!!" });
            }
      } catch (error) {
            res.status(500).send("Internal Server Error"); 
      }
    }
    
//======================= to block the user by the admin =============================
const blockingUser = async (req, res) => {
      try {
            const userId = req.query.id;
            const user = await choiceUser.findById(userId);
            if(user){
                  user.is_block = !user.is_block;
                  await user.save(); 
                  res.redirect('/admin/userManagment')
            }else{
                  res.status(500).send("Internal Server Error"); 
            }
      } catch (error) {
            res.status(500).send("Internal Server Error"); 
      }
};


const load404 = async(req,res)=>{
      try {
            res.render('404')
      } catch (error) {
            res.status(500).send("Internal Server Error"); 
      }
}

//=========================== logout ======================================
const logout = async(req,res)=>{
      try {
            req.session.destroy()
            res.redirect('/admin')
      } catch (error) {
            console.log(error.message);
      }
}

module.exports = {
      loadAdmin,
      loadLogin,
      blockingUser,
      loadUserManagment,
      loadUserManagment,
      load404,
      logout
}