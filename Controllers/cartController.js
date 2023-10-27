const choiceUser = require('../Models/userModel')
const choiceProduct = require('../Models/productModel')
const choicecart = require('../Models/cartModel');
const choiceAddress = require('../Models/addressModel')

// =================== Add to cart ==========================//
exports.addToCart = async (req, res) => {
      try {
            const userId = req.session.user_id;
            const productId = req.body.id
            const user = await choiceUser.findOne({ _id: userId })
            const product = await choiceProduct.findOne({ _id: productId })
            console.log(product);
            if (product.quantity < 1) {
                  res.json({ quantity: true })
            } else {
                  const cart = await choicecart.findOne({ userId: userId })
                  console.log(cart);
                  const price = product.price
                  if (userId === undefined) {
                        res.json({ login: true })
                  } else {
                        if (!cart) {
                              const cart = new choicecart({
                                    userId: userId,
                                    userName: user.name,
                                    products: [{
                                          productId: productId,
                                          count: 1,
                                          productPrice: price,
                                          totalPrice: price
                                    }]

                              })
                              const cartAdded = await cart.save()
                        } else {

                              const existingProduct = await cart.products.find(
                                    (product) => product.productId.toString() === productId.toString()
                              );

                              if (existingProduct) {
                                    res.json({ exist: true })
                              } else {
                                    const newProduct = {
                                          productId: productId,
                                          count: 1,
                                          productPrice: price,
                                          totalPrice: price
                                    }

                                    const updatedCart = await choicecart.findOneAndUpdate(
                                          { userId: userId },
                                          { $push: { products: newProduct } },
                                          { new: true }
                                    );

                                    res.json({ success: true })

                              }
                        }
                  }
            }

      } catch (error) {
            console.log(error.message);
      }
}

// =================== Load cart ==========================//
exports.loadCart = async (req, res) => {
      try {
            const userId = req.session.user_id
            if (userId) {
                  const cart = await choicecart.findOne({ userId: userId }).populate('products.productId')
                  const total = await choicecart.aggregate([
                        { $match: { userId: req.session.user_id } },
                        { $unwind: "$products" },
                        {
                              $group: {
                                    _id: null,
                                    total: {
                                          $sum: {
                                                $multiply: ["$products.productPrice", "$products.count"],
                                          },
                                    },
                              },
                        },
                  ]);
                  if (cart) {
                        res.render('cart', { name: req.session.userName, cartProducts: cart.products, total: total })
                  } else {
                        res.render('cart', { name: req.session.userName, total: total })
                  }
            } else {
                  res.redirect('/login')
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//============================ Remove From Cart =============================
exports.removeFromCart = async (req, res) => {
      try {
            const userId = req.session.user_id;
            const productIdToRemove = req.body.product;

            console.log(productIdToRemove);

            const result = await choicecart.updateOne(
                  { userId: userId }, // Assuming you have a user document with the _id
                  { $pull: { products: { productId: productIdToRemove } } }
            );

            res.json({ exist: true })

      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

//=============================== Quantity updation ============================
exports.cartQuantityUpdation = async (req, res) => {
      try {
            const user = req.session.user_id;
            const proId = req.body.product;
            let count = req.body.count;
            count = parseInt(count);
            const productDetails = await choiceProduct.find(
                  { _id: proId }
            )
            const cart = await choicecart.findOne(
                  { userId: user, "products.productId": proId },
                  { "products.$": 1 }
            );
            const stock = productDetails[0].quantity
            const countOfItem = cart.products[0].count + count

            if (countOfItem <= 0 || countOfItem > stock) {
                  if (countOfItem <= 0) {
                        res.json({ success: true });
                  } else {
                        res.json({ check: true });
                  }

            } else {
                  await choicecart.updateOne(
                        { userId: user, "products.productId": proId },
                        {
                              $inc: { "products.$.count": count }
                        }
                  );
                  const userCart = await choicecart.findOne(
                        { userId: user, "products.productId": proId },
                        { "products.$": 1 }
                  );

                  const totalPrice = (userCart.products[0].count) * (userCart.products[0].productPrice)

                  await choicecart.updateOne(
                        { userId: user, "products.productId": proId },
                        {
                              $set: { "products.$.totalPrice": totalPrice }
                        }
                  );


                  res.json({ success: true });
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

//=================================== load checkout ================================
exports.loadcheckout = async (req, res) => {
      try {
            const userId = req.session.user_id
            if (userId) {
                  const cart = await choicecart.findOne({ userId: userId }).populate('products.productId')
                  // console.log(cart.products);
                  // cart.products.forEach((ele)=>{
                  //       if(ele.productId.quantity < 1){
                  //             flag = 1
                  //       }
                  // })
                  const total = await choicecart.aggregate([
                        { $match: { userId: req.session.user_id } },
                        { $unwind: "$products" },
                        {
                              $group: {
                                    _id: null,
                                    total: {
                                          $sum: {
                                                $multiply: ["$products.productPrice", "$products.count"],
                                          },
                                    },
                              },
                        },
                  ]);
                  const address = await choiceAddress.find({ users: userId })
                  if (address.length > 0) {
                        const addressData = address[0].address
                        res.render('checkout', { name: req.session.userName, cartProducts: cart.products, total: total, address: addressData })
                  } else {
                        res.render('checkout', { name: req.session.userName, cartProducts: cart.products, total: total, address: null })
                  }

            } else {
                  res.redirect('/login')
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}
