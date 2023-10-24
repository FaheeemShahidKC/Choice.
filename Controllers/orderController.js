const choicecart = require('../Models/cartModel')
const choiceUser = require('../Models/userModel')
const choiceorder = require('../Models/orderModel');
const choiceProduct = require('../Models/productModel');
const choiceAddress = require('../Models/addressModel')
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
                  const address = req.body.addressId;
                  const cartData = await choicecart.findOne({ userId: req.session.user_id });
                  const products = cartData.products;
                  const total = parseInt(req.body.Total);
                  const paymentMethods = req.body.payment;
                  const userData = await choiceUser.findOne({ _id: id });
                  const name = userData.name;
                  const uniNum = Math.floor(Math.random() * 900000) + 100000;
                  const status = paymentMethods === "cash" ? "placed" : "pending";

                  const order = new choiceorder({
                        deliveryDetails: address,
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
                                          console.log(order);
                                    });
                              }
                        }
                  } else {
                        console.log('order data storing issue');
                  }
            }

      } catch (error) {
            console.log(error.message);
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
      }
};

//=========================== Order Success =========================
exports.thankyou = (req, res) => {
      try {
            res.render('thankyouu', { name: req.session.userName })
      } catch (error) {
            console.log(error.message);
      }
}

//========================= view orders ==============================
exports.orders = async (req, res) => {
      try {
            const order = await choiceorder.find({ userId: req.session.user_id })
            res.render('orders', { orders: order })
      } catch (error) {
            console.log(error.message);
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
            const deliveryAddress = await choiceAddress.findOne({
                  users: user,
                  "address._id": address
            },
                  { "address.$": 1 }
            );
            const currentDate = new Date();
            const deliveryDate = orderedProduct.date;
            const timeDiff = currentDate - deliveryDate;
            const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
            res.render("orderDetails", { orders: orderedProduct, address: deliveryAddress, daysDiff: daysDiff });
      } catch (error) {
            console.log(error.message);
      }
}

//=========================================================================== Admin Side ==================================================================================

//========================= load Order =============================
exports.loadOrderManagment = async (req, res) => {
      try {
            const order = await choiceorder.find()
            res.render('orderManagment', { orderData: order })
      } catch (error) {
            console.log(error.message);
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
            const deliveryAddress = await choiceAddress.findOne({
                  users: user,
                  "address._id": address
            },
                  { "address.$": 1 }
            );
            res.render("orderDetails", { orders: orderedProduct, address: deliveryAddress });
      } catch (error) {
            console.log(error);
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
      }
}

exports.cancelled = async (req, res) => {
      try {
            const orderId = req.query.id
            const updatedOrder = await choiceorder.updateOne(
                  { _id: orderId },
                  { $set: { status: 'Cancelled' } }
            );
            res.redirect('/admin/orderManagment')
      } catch (error) {
            console.log(error.message);
      }
}

exports.cancelOrder = async (req, res) => {
      try {
            const orderId = req.query.id;
            // Find the order by orderId
            const order = await choiceorder.findOne({ _id: orderId });


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
                  reason: req.body.cancelReason
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
            // Handle errors, e.g., by sending an error response or logging the error.
            console.error(error);
            res.status(500).send('Internal Server Error');
      }
};

exports.returnOrder = async (req, res) => {
      try {
            const orderId = req.query.id;
            // Find the order by orderId
            const order = await choiceorder.findOne({ _id: orderId });


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
                  reason: req.body.returnReason
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
            // Handle errors, e.g., by sending an error response or logging the error.
            console.error(error);
            res.status(500).send('Internal Server Error');
      }
}