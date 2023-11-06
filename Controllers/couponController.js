const choiceCoupon = require('../Models/coopenModel')

exports.addCoupon = async (req, res) => {
      try {
            let couponAlready = req.session.couponAlready
            let couponName = req.session.couponName
            let criteriaAmount = req.session.criteriaAmount
            let activationDate = req.session.activationDate
            let expiryDate = req.session.expiryDate
            let discountAmount = req.session.discountAmount
            let usersLimit = req.session.usersLimit
            let couponCode = req.session.couponCode
            res.render('addCoupon', { couponAlready,couponCode,activationDate,couponName,criteriaAmount,expiryDate,discountAmount,usersLimit })
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

exports.couponManagment = async (req, res) => {
      try {
            const coupons = await choiceCoupon.find()
            req.session.couponAlready = false
            req.session.couponCode = false
            req.session.couponName = false
            req.session.criteriaAmount = false
            req.session.activationDate = false
            req.session.expiryDate = false
            req.session.discountAmount = false
            req.session.usersLimit = false
            res.render('couponManagment', { coupons: coupons })
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

exports.addedCoupon = async (req, res) => {
      try {
            const already = await choiceCoupon.findOne({ couponCode: req.body.couponCode });
            const TodayDate = new Date()
            const Today = TodayDate.toISOString().split('T')[0];

            if (req.body.couponName.trim() === "") {
                  req.session.couponName = true;
                  res.redirect('/admin/addCoupon')
            }else if (req.body.couponCode.trim() === "") {
                  req.session.couponCode = true;
                  res.redirect('/admin/addCoupon')
            }else if (already) {
                  req.session.couponAlready = true;
                  res.redirect('/admin/addCoupon')
            }else if (req.body.discountAmount <= 0) {
                  req.session.discountAmount = true;
                  res.redirect('/admin/addCoupon')
            } else if (req.body.activationDate < Today) {
                  req.session.activationDate = true;
                  res.redirect('/admin/addCoupon')
            }else if (req.body.expiryDate < req.body.activationDate) {
                  req.session.expiryDate = true;
                  res.redirect('/admin/addCoupon')
            }else if (req.body.criteriaAmount <= 0) {
                  req.session.criteriaAmount = true;
                  res.redirect('/admin/addCoupon')
            }else if (req.body.usersLimit <= 0) {
                  req.session.usersLimit = true;
                  res.redirect('/admin/addCoupon')
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
            res.render('404')
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
            res.render('404')
      }
};

exports.editCoupon = async (req, res) => {
      try {
            const coupons = await choiceCoupon.findOne({ _id: req.query.id })
            res.render('editCoupon', { coupons: coupons })
      } catch (error) {
            console.log(error.message);
            res.render('404')
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
            res.render('404')
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
            res.render('404')
      }
};