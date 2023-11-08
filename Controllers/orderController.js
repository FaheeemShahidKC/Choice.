const choicecart = require('../Models/cartModel')
const choiceUser = require('../Models/userModel')
const choiceorder = require('../Models/orderModel');
const choiceProduct = require('../Models/productModel');
const choiceAddress = require('../Models/addressModel')
const choiceCoupon = require('../Models/coopenModel')
const Razorpay = require("razorpay");
const crypto = require("crypto");

//==========================RAZORPAY INSTANCE================================
var instance = new Razorpay({
      key_id: process.env.RazorId,
      key_secret: process.env.RazorKey,
});

//=================================== Thankyou / Place order ===========================
exports.placeOrder = async (req, res) => {
      try {
            const id = req.session.user_id;
            if (id) {
                  const code = req.body.applyedCouponCode
                  await choiceCoupon.updateOne({ couponCode: code }, { $inc: { usersLimit: -1 } })
                  await choiceCoupon.updateOne({ couponCode: code }, { $push: { usedUsers: req.session.user_id } })
                  const address = req.body.addressId;
                  const CheckcartData = await choicecart.findOne({ userId: req.session.user_id }).populate('products.productId')
                  const cartData = await choicecart.findOne({ userId: req.session.user_id })
                  const products = cartData.products;
                  let flag = false
                  CheckcartData.products.forEach((ele) => {
                        if (ele.productId.quantity < 1) {
                              flag = true
                        }
                  })
                  if (flag) {
                        res.json({ inventry: true })
                  } else {
                        const total = parseInt(req.body.Total);
                        const paymentMethods = req.body.payment;
                        const userData = await choiceUser.findOne({ _id: id });
                        const name = userData.name;
                        const uniNum = Math.floor(Math.random() * 900000) + 100000;
                        const status = paymentMethods === "cash" ? "placed" : "pending";
                        const walletBalance = userData.wallet;
                        const order = new choiceorder({
                              deliveryDetails: req.body.orderAddressDetails,
                              uniqueId: uniNum,
                              userId: id,
                              userName: name,
                              paymentMethod: paymentMethods,
                              products: products,
                              totalAmount: total,
                              date: new Date(),
                              status: status,
                        });
                        const orderData = await order.save();
                        const orderid = order._id;
                        if (orderData) {

                              if (order.status === "placed") {
                                    await choicecart.deleteOne({ userId: req.session.user_id });
                                    for (let i = 0; i < products.length; i++) {
                                          const pro = products[i].productId;
                                          const count = products[i].count;
                                          await choiceProduct.findOneAndUpdate(
                                                { _id: pro },
                                                { $inc: { quantity: -count } }
                                          );
                                    }

                                    res.json({ codsuccess: true });
                              } else {
                                    const orderId = orderData._id;
                                    const totalAmount = orderData.totalAmount;
                                    if (order.paymentMethod == "Rayzor pay") {
                                          var options = {
                                                amount: totalAmount * 100,
                                                currency: "INR",
                                                receipt: "" + orderId,
                                          };

                                          instance.orders.create(options, function (err, order) {
                                                res.json({ order });
                                          });
                                    } else if (order.paymentMethod == "wallet") {
                                          if (walletBalance >= total) {
                                                const result = await choiceUser.findOneAndUpdate(
                                                      { _id: id },
                                                      {
                                                            $inc: { wallet: -total },
                                                            $push: {
                                                                  walletHistory: {
                                                                        date: new Date(),
                                                                        amount: total,
                                                                        reason: "Purchaced Amount Debited.",
                                                                  },
                                                            },
                                                      },
                                                      { new: true }
                                                );
                                                await choiceorder.findByIdAndUpdate(
                                                      { _id: orderid },
                                                      { $set: { status: "placed" } }
                                                )
                                                await choicecart.deleteOne({ userId: req.session.user_id });
                                                for (let i = 0; i < products.length; i++) {
                                                      const pro = products[i].productId;
                                                      const count = products[i].count;
                                                      await choiceProduct.findOneAndUpdate(
                                                            { _id: pro },
                                                            { $inc: { quantity: -count } }
                                                      );
                                                }
                                                res.json({ codsuccess: true, orderid });
                                          } else {
                                                res.json({ walletFailed: true });
                                          }

                                    }
                              }
                        } else {
                              console.log('order data storing issue');
                        }
                  }

            }

      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

exports.verifyPayment = async (req, res) => {
      try {
            const cartData = await choicecart.findOne({ userId: req.session.user_id });
            const products = cartData.products;
            const details = req.body;
            const hmac = crypto.createHmac("sha256", process.env.RazorKey);

            hmac.update(
                  details.payment.razorpay_order_id +
                  "|" +
                  details.payment.razorpay_payment_id
            );
            const hmacValue = hmac.digest("hex");

            if (hmacValue === details.payment.razorpay_signature) {
                  for (let i = 0; i < products.length; i++) {
                        const pro = products[i].productId;
                        const count = products[i].count;
                        await choiceProduct.findByIdAndUpdate(
                              { _id: pro },
                              { $inc: { quantity: -count } }
                        );
                  }
                  await choiceorder.findByIdAndUpdate(
                        { _id: details.order.receipt },
                        { $set: { status: "placed" } }
                  );

                  await choiceorder.findByIdAndUpdate(
                        { _id: details.order.receipt },
                        { $set: { paymentId: details.payment.razorpay_payment_id } }
                  );
                  await choicecart.deleteOne({ userId: req.session.user_id });
                  const orderid = details.order.receipt;

                  //----discount adding orderDB------//
                  //     if(req.session.code){
                  //       const coupon = await choi.findOne({couponCode:req.session.code});
                  //       const disAmount = coupon.discountAmount;
                  //       await Order.updateOne({_id:orderid},{$set:{discount:disAmount}});
                  //       res.json({ codsuccess: true, orderid });
                  //     }
                  res.json({ codsuccess: true, orderid });

            } else {
                  await choiceorder.findByIdAndRemove({ _id: details.order.receipt });
                  res.json({ success: false });
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

//=========================== Order Success =========================
exports.thankyou = (req, res) => {
      try {
            res.render('thankyouu', { name: req.session.userName })
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//========================= view orders ==============================
exports.orders = async (req, res) => {
      try {
            const order = await choiceorder.find({ userId: req.session.user_id }).sort({ date: -1 });
            res.render('orders', { orders: order })
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//========================= view order details ==============================
exports.viewOrderDetails = async (req, res) => {
      try {
            const id = req.query.id;
            const orderedProduct = await choiceorder.findOne({ _id: id }).populate(
                  "products.productId"
            );
            const user = orderedProduct.userId
            const address = orderedProduct.deliveryDetails
            // const deliveryAddress = await choiceAddress.findOne({
            //       users: user,
            //       "address._id": address
            // },
            //       { "address.$": 1 }
            // );
            const currentDate = new Date();
            const deliveryDate = orderedProduct.date;
            const timeDiff = currentDate - deliveryDate;
            const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
            res.render("orderDetails", { orders: orderedProduct, address: address, daysDiff: daysDiff });
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

exports.cancelOrder = async (req, res) => {
      try {
            const orderId = req.query.id;
            // Find the order by orderId
            const order = await choiceorder.findOne({ _id: orderId });
            const cancelledProducts = order.products
            for (i = 0; i < cancelledProducts.length; i++) {
                  const pro = cancelledProducts[i].productId;
                  const count = cancelledProducts[i].count;
                  await choiceProduct.findOneAndUpdate(
                        { _id: pro },
                        { $inc: { quantity: count } }
                  );
            }

            if (!order) {
                  return res.status(404).send('Order not found');
            }

            const amount = order.totalAmount;
            // Create a history object
            const walletuser = await choiceUser.find({ _id: req.session.user_id })
            const totalWallet = walletuser[0].wallet + amount
            const history = {
                  date: new Date(),
                  amount: amount,
                  reason: "Cancelled the order"
            };

            if (order.status == "Delivered" && req.body.refundMethod == "wallet") {
                  // Update the user's wallet and wallet history
                  const user = await choiceUser.updateOne(
                        { _id: req.session.user_id },
                        {
                              $set: { wallet: totalWallet },
                              $push: { walletHistory: history }
                        }
                  );
            }
            // Update the order's status to 'Cancelled'
            const updatedOrder = await choiceorder.updateOne(
                  { _id: orderId },
                  { $set: { status: 'Cancelled' } }
            )
            // Redirect to the '/orders' route
            res.redirect('/orders');
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

exports.returnOrder = async (req, res) => {
      try {
            const orderId = req.query.id;
            // Find the order by orderId
            const order = await choiceorder.findOne({ _id: orderId });
            const cancelledProducts = order.products
            for (i = 0; i < cancelledProducts.length; i++) {
                  const pro = cancelledProducts[i].productId;
                  const count = cancelledProducts[i].count;
                  await choiceProduct.findOneAndUpdate(
                        { _id: pro },
                        { $inc: { quantity: count } }
                  );
            }

            if (!order) {
                  return res.status(404).send('Order not found');
            }

            const amount = order.totalAmount;
            // Create a history object
            const walletuser = await choiceUser.find({ _id: req.session.user_id })
            const totalWallet = walletuser[0].wallet + amount
            const history = {
                  date: new Date(),
                  amount: amount,
                  reason: "returned product"
            };
            if (order.status == "Delivered" && req.body.refundMethod == "wallet") {
                  // Update the user's wallet and wallet history
                  const user = await choiceUser.updateOne(
                        { _id: req.session.user_id },
                        {
                              $set: { wallet: totalWallet },
                              $push: { walletHistory: history }
                        }
                  );
            }
            // Update the order's status to 'Cancelled'
            const updatedOrder = await choiceorder.updateOne(
                  { _id: orderId },
                  { $set: { status: 'Returned' } }
            )
            // Redirect to the '/orders' route
            res.redirect('/orders');
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//=========================================================================== Admin Side ==================================================================================

//========================= load Order =============================
exports.loadOrderManagment = async (req, res) => {
      try {
            const order = await choiceorder.find().sort({ date: -1 });
            res.render('orderManagment', { orderData: order })
      } catch (error) {
            console.log(error.message);
            res.render('404');
      }
}

exports.orderDetails = async (req, res) => {
      try {
            const id = req.query.id;
            const orderedProduct = await choiceorder.findOne({ _id: id }).populate(
                  "products.productId"
            );
            const user = orderedProduct.userId
            const address = orderedProduct.deliveryDetails
            // const deliveryAddress = await choiceAddress.findOne({
            //       users: user,
            //       "address._id": address
            // },
            //       { "address.$": 1 }
            // );
            // console.log(orderedProduct);
            res.render("orderDetails", { orders: orderedProduct, address: address });
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

exports.delivered = async (req, res) => {
      try {
            const orderId = req.query.id
            const updatedOrder = await choiceorder.updateOne(
                  { _id: orderId },
                  { $set: { status: 'Delivered', deliveryDate: new Date() } }
            );
            res.redirect('/admin/orderManagment')
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

exports.cancelled = async (req, res) => {
      try {
            const orderId = req.query.id
            const order = await choiceorder.findOne({ _id: orderId });
            const cancelledProducts = order.products
            for (i = 0; i < cancelledProducts.length; i++) {
                  const pro = cancelledProducts[i].productId;
                  const count = cancelledProducts[i].count;
                  await choiceProduct.findOneAndUpdate(
                        { _id: pro },
                        { $inc: { quantity: count } }
                  );
            }
            if (!order) {
                  return res.status(404).send('Order not found');
            }

            const amount = order.totalAmount;
            // Create a history object
            const walletuser = await choiceUser.find({ _id: req.session.user_id })
            const totalWallet = walletuser[0].wallet + amount
            const history = {
                  date: new Date(),
                  amount: amount,
                  reason: "Cancelled the order"
            };

            if (order.status == "Delivered" && req.body.refundMethod == "wallet") {
                  // Update the user's wallet and wallet history
                  const user = await choiceUser.updateOne(
                        { _id: req.session.user_id },
                        {
                              $set: { wallet: totalWallet },
                              $push: { walletHistory: history }
                        }
                  );
            }
            const updatedOrder = await choiceorder.updateOne(
                  { _id: orderId },
                  { $set: { status: 'Cancelled' } }
            );
            res.redirect('/admin/orderManagment')
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}



//====================================DELIVER THE PRODUCT ADMIN SIDE===================================
exports.statusUpdate = async (req, res) => {
      try {
            const orderId = req.query.id;
            const orderData = await choiceorder.findOne({ _id: orderId })
            const userId = orderData.userId
            const statusLevel = req.query.status;
            const amount = orderData.totalAmount;
            const products = orderData.products;


            if (statusLevel === '1') {
                  await choiceorder.updateOne(
                        { _id: orderId },
                        { $set: { status: "cancelled", statusLevel: 1 } });

                  for (let i = 0; i < products.length; i++) {
                        let pro = products[i].productId;
                        let count = products[i].count;
                        await choiceProduct.findOneAndUpdate(
                              { _id: pro },
                              { $inc: { quantity: count } }
                        );
                  }
                  if (orderData.paymentMethod == 'Rayzor pay' || orderData.paymentMethod == 'wallet') {
                        await choiceUser.findOneAndUpdate(
                              { _id: userId },
                              {
                                    $inc: { wallet: amount },
                                    $push: {
                                          walletHistory: {
                                                date: new Date(),
                                                amount: amount,
                                                reason: "Cancelled Product Amount Credited",
                                          },
                                    },
                              },
                              { new: true }
                        );
                  }
            } else if (statusLevel === '2') {
                  await choiceorder.updateOne(
                        { _id: orderId },
                        { $set: { status: "shipped", statusLevel: 2 } }
                  )
            } else if (statusLevel === '3') {
                  await choiceorder.updateOne(
                        { _id: orderId },
                        { $set: { status: "Delivered", deliveryDate: new Date(), statusLevel: 3 } }
                  );
            }
            res.redirect("/admin/orderManagment");

      } catch (error) {
            console.log(error.message);
      }
};