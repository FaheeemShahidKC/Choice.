const choiceAddress = require('../Models/addressModel');
const choiceUser = require('../Models/userModel');

const bcrypt = require('bcrypt')
async function securePassword(password) {
      let spassword = await bcrypt.hash(password, 10);
      if (spassword) {
            return spassword
      } else {
            console.log("bcrypt");
      }
}

// =========================== mobile validation ================================
function validateMobileNumber(mobileNumber) {
      const cleanNumber = mobileNumber.replace(/\D/g, '');

      if (cleanNumber.length === 10) {
            return true;
      } else {
            return false;
      }
}

//=========================== email validation ============================
function validateEmail(email) {
      try {
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            return emailRegex.test(email);
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//======================= Adding multiple address =========================
const addedAddress = async (req, res) => {
      try {
            const address = await choiceAddress.find({ users: req.session.user_id })
            const name = req.body.addName.toString(); 
            if (name.length > 2) {
                  if (validateEmail(req.body.addEmail)) {
                        if (validateMobileNumber(req.body.addMobile)) {
                              if (/^\d{6}$/.test(req.body.addPincode)) {
                                    if (req.body.addHouseName.trim() !== "" && req.body.addCity.trim() !== "" && req.body.addState.trim() !== "") {
                                          if (address.length > 0) {
                                                const updated = await choiceAddress.updateOne(
                                                      { users: req.session.user_id },
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
                                          } else {
                                                const data = new choiceAddress({
                                                      users: req.session.user_id,
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
                                          }
                                          res.redirect('/profile')
                                    } else {
                                          res.render('addAddress', { error: "House Name, City, and State cannot be blank!"});
                                    }
                              } else {
                                    res.render('addAddress', { error: "Enter a valid Pincode (6 digits)!"});
                              }
                        } else {
                              res.render('addAddress', { error: "Enter a valid Mobile number!"});
                        }
                  } else {
                        res.render('addAddress', { error: "Enter a valid Email!!"});
                  }
            } else {
                  res.render('addAddress', { error: "Enter a valid Name!!"});
            }
      } catch (error) {
            res.render('404')
            console.log(error.message);
      }

}

// ============================= editing ===========================
const editAddress = async (req, res) => {
      try {
            const addressId = req.query.id;

            const address = await choiceAddress.findOne({
                  users: req.session.user_id,
                  "address._id": addressId
            },
                  { "address.$": 1 }
            );

            res.render('editAddress', { address: address });
      } catch (error) {
            res.render('404')
            console.log(error.message);
      }
};

const updateAddress = async (req, res) => {
      try {
            const addressId = req.query.id;
            const name = req.body.addName.toString(); 
            const address = await choiceAddress.findOne({
                  users: req.session.user_id,
                  "address._id": addressId
            },
                  { "address.$": 1 }
            );
            if (name.length > 2) {
                  if (validateEmail(req.body.addEmail)) {
                        if (validateMobileNumber(req.body.addMobile)) {
                              if (/^\d{6}$/.test(req.body.addPincode)) {
                                    if (req.body.addHouseName.trim() !== "" && req.body.addCity.trim() !== "" && req.body.addState.trim() !== "") {
                                          // All fields are valid
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
                                    } else {
                                          res.render('editAddress', { error: "House Name, City, and State cannot be blank!", address: address });
                                    }
                              } else {
                                    res.render('editAddress', { error: "Enter a valid Pincode (6 digits)!", address: address });
                              }
                        } else {
                              res.render('editAddress', { error: "Enter a valid Mobile number!", address: address });
                        }
                  } else {
                        res.render('editAddress', { error: "Enter a valid Email!!", address: address });
                  }
            } else {
                  res.render('editAddress', { error: "Enter a valid Name!!", address: address });
            }
      } catch (error) {
            res.render('404');
            console.log(error.message);
      }
};


async (req, res) => {
      try {
            const id = req.body.id;
            await Address.updateOne(
                  { user: req.session.user_id },
                  { $pull: { address: { _id: id } } }
            );
            res.json({ remove: true });
      } catch (error) {
            console.log(error.message);
            res.status(404).render("404");
      }
}
//============================= Remove address ==================================
const removeAddress = async (req, res) => {
      try {
            const addressId = req.query.id;

            if (!addressId) {
                  return res.status(400).send('Address ID is missing');
            }

            const result = await choiceAddress.updateOne(
                  { users: req.session.user_id },
                  { $pull: { address: { _id: addressId } } }
            );
            res.redirect('/profile');
      } catch (error) {
            res.render('404')
            console.log(error.message);
      }
}


//================================ editing profile ========================================
const editProfile = async (req, res) => {
      try {
            const userProfile = await choiceUser.find({ _id: req.session.user_id })
            res.render('editProfile', { userProfile: userProfile })
      } catch (error) {
            res.render('404')
            console.log(error.message);
      }
}

const editedUser = async (req, res) => {
      try {
            const userr = req.query.id;
            const findUser = await choiceUser.findOne({ _id: userr });

            const mobile = parseInt(req.body.addMobile);
            const curr = req.body.currentPassword;
            const neww = req.body.newPassword;
            const userProfile = await choiceUser.find({ _id: req.session.user_id });
            const name = req.body.addName
            toString(name)

            if (name.length > 2) {
                  if (validateEmail(req.body.addEmail)) {
                        if (validateMobileNumber(req.body.addMobile)) {
                              if (curr && neww) {
                                    if (curr.trim() == "" && neww.trim() == "") {
                                          res.render('editProfile', { error: "Please check the password!", userProfile: userProfile });
                                    } else {
                                          const isPasswordCorrect = await bcrypt.compare(curr, findUser.password);

                                          if (isPasswordCorrect) {
                                                const newpass = await securePassword(neww);
                                                const updatedUser = await choiceUser.updateOne(
                                                      { _id: userr },
                                                      {
                                                            $set: {
                                                                  name: req.body.addName,
                                                                  email: req.body.addEmail,
                                                                  mobile: mobile,
                                                                  password: newpass,
                                                            },
                                                      }
                                                );
                                                res.redirect('/profile');
                                          } else {
                                                res.render('editProfile', { error: "Your current password is wrong!", userProfile: userProfile });
                                          }
                                    }
                              } else {
                                    const updatedUser = await choiceUser.updateOne(
                                          { _id: userr },
                                          {
                                                $set: {
                                                      name: req.body.addName,
                                                      email: req.body.addEmail,
                                                      mobile: mobile,
                                                },
                                          }
                                    );
                                    res.redirect('/profile');
                              }
                        } else {
                              res.render('editProfile', { error: "Enter a valid Mobile number!", userProfile: userProfile });
                        }

                  } else {
                        res.render('editProfile', { error: "Enter a valid Email!!", userProfile: userProfile });
                  }
            } else {
                  res.render('editProfile', { error: "Enter a valid Name!!", userProfile: userProfile });
            }
      } catch (error) {
            res.render('404');
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