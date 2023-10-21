const choiceCoupon = require('../Models/coopenModel')

exports.addCoupon = async (req, res) => {
      try {
            res.render('addCoupon')
      } catch (error) {
            console.log(error.message);
      }
}

exports.couponManagment = async (req, res) => {
      try {
            const coupons = await choiceCoupon.find()
            res.render('couponManagment', { coupons: coupons })
      } catch (error) {
            console.log(error.message);
      }
}

exports.addedCoupon = async (req, res) => {
      try {
            const already = await choiceCoupon.findOne({ couponCode: req.body.couponCode });

            if (already) {
                  res.render("addCoupon", { message: "Given Coupon Already Exist !" });
            } else {
                  const data = new choiceCoupon({
                        couponName: req.body.couponName,
                        couponCode: req.body.couponCode,
                        discountAmount: req.body.discountAmount,
                        activationDate: req.body.activationDate,
                        expiryDate: req.body.expiryDate,
                        criteriaAmount: req.body.criteriaAmount,
                        usersLimit: req.body.usersLimit,
                  });
                  const saved = await data.save();
                  res.redirect('/admin/couponManagment')
            }
      } catch (error) {
            console.log(error.message);
      }
}

exports.blockingCoupon = async (req, res) => {
      try {
            const coupon = await choiceCoupon.findOne({ _id: req.query.id });
            if (coupon) {
                  coupon.status = !coupon.status;
                  await coupon.save();
            }
            res.redirect("/admin/couponManagment");
      } catch (error) {
            console.log(error.message);
      }
};

exports.editCoupon = async (req, res) => {
      try {
            const coupons = await choiceCoupon.findOne({ _id: req.query.id })
            res.render('editCoupon', { coupons: coupons })
      } catch (error) {
            console.log(error.message);
      }
}

exports.editedCoupon = async (req, res) => {
      try {
            const updatedCoupon = await choiceCoupon.findOne({ _id: req.query.id });

            if (updatedCoupon) {
                  updatedCoupon.couponName = req.body.couponName;
                  updatedCoupon.couponCode = req.body.couponCode;
                  updatedCoupon.discountAmount = req.body.discountAmount;
                  updatedCoupon.activationDate = req.body.activationDate;
                  updatedCoupon.expiryDate = req.body.expiryDate;
                  updatedCoupon.criteriaAmount = req.body.criteriaAmount;
                  updatedCoupon.usersLimit = req.body.usersLimit;

                  const saved = await updatedCoupon.save();
                  res.redirect('/admin/couponManagment');
            } else {
                  res.status(404).send('Coupon not found');
            }
      } catch (error) {
            console.log(error.message);
      }
};

//================================APPLY COUPON====================================

exports.applyCoupon = async (req, res) => {
      try {
            const code = req.body.code;
            req.session.code = code;
            const amount = parseInt(req.body.amount);
            const userExist = await choiceCoupon.findOne({
                  couponCode: code,
                  usedUsers: { $in: [req.session.user_id] },
            });

            if (userExist) {
                  res.json({ user: true });
            } else {
                  const couponData = await choiceCoupon.findOne({ couponCode: code });

                  if (couponData) {
                        if (couponData.usersLimit <= 0) {
                              res.json({ limit: true });
                        } else {
                              if (couponData.status == false) {
                                    res.json({ status: true });
                              } else {
                                    if (couponData.expiryDate <= new Date()) {
                                          res.json({ date: true });
                                    } else if (couponData.activationDate >= new Date()) {
                                          res.json({ active: true })
                                    } else {
                                          if (couponData.criteriaAmount >= amount) {
                                                res.json({ cartAmount: true });
                                          } else {
                                                //user limit decreasing
                                                await choiceCoupon.updateOne({ couponCode: code }, { $inc: { usersLimit: -1 } })
                                                //user name adding
                                                await choiceCoupon.updateOne({ couponCode: code }, { $push: { usedUsers: req.session.user_id } })

                                                const disAmount = couponData.discountAmount;
                                                const disTotal = Math.round(amount - disAmount);
                                                return res.json({ amountOkey: true, disAmount, disTotal });
                                                

                                          }
                                    }
                              }
                        }
                  } else {
                        res.json({ invalid: true });
                  }
            }
      } catch (error) {
            console.log(error.message);
      }
};