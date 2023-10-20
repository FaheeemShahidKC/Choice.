const choiceAddress = require('../Models/addressModel');
const choiceUser = require('../Models/userModel');

//======================= Adding multiple address =========================
const addedAddress = async(req,res)=>{
      try {
            const address  = await choiceAddress.find({ users : req.session.user_id})
            console.log(address);
            if (address.length > 0) {
                  const updated = await choiceAddress.updateOne(
                    { users : req.session.user_id },
                    {
                      $push: {
                        address: {
                              fullname: req.body.addName,
                              mobile: req.body.addMobile,
                              email: req.body.addEmail,
                              houseName: req.body.addHouseName,
                              city: req.body.addCity,
                              state: req.body.addState,
                              pin: req.body.addPincode
                        },
                      },
                    }
                  );
            }else{
                  const data = new choiceAddress({
                        users : req.session.user_id,
                        address: [
                          {
                            fullname: req.body.addName,
                            mobile: req.body.addMobile,
                            email: req.body.addEmail,
                            houseName: req.body.addHouseName,
                            city: req.body.addCity,
                            state: req.body.addState,
                            pin: req.body.addPincode,
                          },
                        ],
                  });
                  await data.save();
                  console.log(data);
            }
            res.redirect('/profile')
      } catch (error) {
            console.log(error.message);
      }
      
}

// ============================= editing ===========================
const editAddress = async (req, res) => {
      try {
            const addressId = req.query.id;
      
            const address = await choiceAddress.findOne({
                  users: req.session.user_id,
                  "address._id": addressId},
                  { "address.$": 1 }
            );

          res.render('editAddress', { address : address });
      } catch (error) {
          console.log(error.message);
          res.status(500).send('Internal Server Error');
      }
};

const updateAddress = async (req, res) => {
      try {
            const addressId = req.query.id;
            
            await choiceAddress.updateOne(
            { users: req.session.user_id, "address._id": addressId }, 
            {
                  $set: {
                        "address.$.fullname": req.body.addName,       
                        "address.$.mobile": req.body.addMobile,       
                        "address.$.email": req.body.addEmail,         
                        "address.$.houseName": req.body.addHouseName, 
                        "address.$.city": req.body.addCity,           
                        "address.$.state": req.body.addState,         
                        "address.$.pin": req.body.addPincode,         
                  },
            }
            );
    
            res.redirect("/profile");
      } catch (error) {
            console.log(error.message);
      }
};

//============================= Remove address ==================================
const removeAddress = async (req, res) => {
      try {
        const addressId = req.query.id;
    
        if (!addressId) {
          return res.status(400).send('Address ID is missing');
        }
    
        const result = await choiceAddress.deleteOne(
          { users: req.session.user_id, "address._id": addressId }
        );
        if (result.deletedCount === 1) {
          // Address was successfully deleted
          res.redirect('/profile');
        } else {
          res.status(404).send('Address not found'); // Address not found
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
}
    

//================================ editing profile ========================================
const editProfile = async(req,res)=>{
      try {
            const userProfile = await choiceUser.find({_id : req.session.user_id})
            res.render('editProfile' ,{userProfile : userProfile})
      } catch (error) {
            console.log(error.message);
      }
}

const editedUser = async (req, res) => {
      try {
            const userr = req.query.id;
            console.log(userr);
            const findUser = await choiceUser.find({ _id: userr });
            console.log(findUser);
      
            // Convert req.body.addMobile to a number
            const mobile = parseInt(req.body.addMobile);
      
            const updatedUser = await choiceUser.updateOne(
                  { _id: userr },
                  {
                        $set: {
                        name: req.body.addName,
                        email: req.body.addEmail,
                        mobile: mobile, // Converted to a number
                        }
                  }
            );
            console.log(updatedUser);
            res.redirect('/profile');
      } catch (error) {
        console.log(error.message);
      }
};

module.exports = {
      addedAddress,
      editAddress,
      updateAddress,
      editProfile,
      editedUser,
      removeAddress
}