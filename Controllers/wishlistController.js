const choiceWishlist = require('../Models/wishlist')

exports.loadWishlist = async (req, res) => {
      try {
            if (req.session.user_id) {
                  const wish = await choiceWishlist.findOne({ user: req.session.user_id })
                  if (wish) {
                        wishCount = wish.products.length
                        const wishlist = await choiceWishlist.findOne({ user: req.session.user_id }).populate("products.productId")
                        const products = wishlist.products;
                        res.render('wishlist', { name: req.session.userName, products: products })
                  } else {
                        res.render('wishlist', { name: req.session.userName, products: null })
                  }
            } else {
                  res.redirect('/login')
            }
      } catch (error) {
            console.log(error.message);
      }
}

exports.addToWishlist = async (req, res) => {
      try {
            const proId = req.body.id
            if (req.session.user_id) {
                  const already = await choiceWishlist.findOne({ user: req.session.user_id })
                  if (already) {
                        const proExist = already.products.some(product => product.productId.toString() === proId)
                        if (!proExist) {
                              await choiceWishlist.updateOne(
                                    { user: req.session.user_id },
                                    {
                                          $push:
                                          {
                                                products:
                                                {
                                                      productId: proId
                                                }
                                          }
                                    })
                              res.json({ success: true })
                        } else {
                              res.json({ exist: true })
                        }

                  } else {
                        const data = new choiceWishlist({
                              user: req.session.user_id,
                              products: [{
                                    productId: proId
                              }]
                        })
                        await data.save()
                        res.json({ success: true })
                  }
            } else {
                  res.json({ login: true })
            }
      } catch (error) {
            console.log(error.message);
      }
}

exports.removeWishItem = async (req, res) => {
      try {
            const proId = req.body.product;
            const wish = await choiceWishlist.findOne({ user: req.session.user_id })
            if (wish) {
                  await choiceWishlist.findOneAndUpdate(
                        { user: req.session.user_id },
                        {
                              $pull: { products: { productId: proId } },
                        }
                  );
                  res.json({ remove: true })
            }

      } catch (error) {
            console.log(error.message);
      }
}