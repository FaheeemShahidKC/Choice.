const choiceReview = require('../Models/reviewModel')

exports.submitReview = async (req, res) => {
      try {

            const data = {
                  user: req.session.user_id,
                  rating: req.body.rating,
                  comment: req.body.comment
            }

            await choiceReview.findOneAndUpdate(

                  { productId: req.body.Rproduct },
                  {
                        $push: { review: data }
                  },
                  { upsert: true, new: true }

            )
            res.redirect('/orders')

      } catch (error) {
            console.log(error.message);
      }
};
