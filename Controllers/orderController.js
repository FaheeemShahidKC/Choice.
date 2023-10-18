const choicecart = require('../Models/cartModel')
const choiceUser = require('../Models/userModel')
const choiceorder = require('../Models/orderModel');
const choiceProduct = require('../Models/productModel');
const choiceAddress = require('../Models/addressModel')

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
                        }
                  }
            }

      } catch (error) {
            console.log(error.message);
      }
}

//=========================== Order Success =========================
exports.thankyou = (req, res) => {
      try {
            res.render('thankyouu', { name: req.session.userName })
      } catch (error) {
            console.log(error.message);
      }
}

//========================= view orders ==============================
exports.orders = async(req,res)=>{
      try {
            const order = await choiceorder.find({userId:req.session.user_id})
            res.render('orders',{orders : order})
      } catch (error) {
            console.log(error.message);
      }
}

//========================= view orders ==============================
exports.viewOrderDetails = async(req,res)=>{
      try {
            const id = req.query.id;
            const orderedProduct = await choiceorder.findOne({ _id: id }).populate(
            "products.productId"
            );
            const user = orderedProduct.userId
            const address = orderedProduct.deliveryDetails
            const deliveryAddress = await choiceAddress.findOne({
                  users: user,
                  "address._id": address},
                  { "address.$": 1 }
            );
            res.render("orderDetails", { orders: orderedProduct , address : deliveryAddress});
      } catch (error) {
            console.log(error.message);
      }
}

//=========================================================================== Admin Side ==================================================================================

//========================= load Order =============================
exports.loadOrderManagment = async (req,res)=>{
      try {
            const order = await choiceorder.find()
            res.render('orderManagment',{orderData : order})
      } catch (error) {
            console.log(error.message);
      }
}

exports.orderDetails = async(req,res)=>{
      try {
            const id = req.query.id;
            const orderedProduct = await choiceorder.findOne({ _id: id }).populate(
            "products.productId"
            );
            const user = orderedProduct.userId
            const address = orderedProduct.deliveryDetails
            const deliveryAddress = await choiceAddress.findOne({
                  users: user,
                  "address._id": address},
                  { "address.$": 1 }
            );
            res.render("orderDetails", { orders: orderedProduct , address : deliveryAddress});
      } catch (error) {
            console.log(error);
      }
}

exports.delivered = async(req,res)=>{
      try {
            const orderId = req.query.id
            const updatedOrder = await choiceorder.updateOne(
                  { _id: orderId },
                  { $set: { status: 'Delivered' } }
            );
            res.redirect('/orderDetails')
      } catch (error) {
            console.log(error.message);
      }
}

exports.cancelled = async(req,res)=>{
      try {
            const orderId = req.query.id
            const updatedOrder = await choiceorder.updateOne(
                  { _id: orderId },
                  { $set: { status: 'Cancelled' } }
            );
            res.redirect('/orderDetails')
      } catch (error) {
            console.log(error.message);
      }
}