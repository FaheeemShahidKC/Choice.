const choiceCategory = require('../Models/categoryModel')

//===================== Catrgory managment =========================
const loadCategory = async (req, res) => {
      try {
            let catDat = await choiceCategory.find()
            if (catDat) {
                  res.render('categoryManagment', { catgryData: catDat })
            } else {
                  res.status(500).send("Internal Server Error");
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const clickedAddCategory = async (req, res) => {
      try {
            res.render('addCategory')
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const addedCategory = async (req, res) => {
      try {
            const cat = await choiceCategory.find({
                  categoryName: { $regex: new RegExp('^' + req.body.category + '$', 'i') },
            });

            if (cat.length > 0) {
                  res.render('addCategory',{error : "Category already added!"});
            } else {
                  const categoryData = {
                        categoryName: req.body.category,
                        is_block: 0,
                  };
                  await choiceCategory.insertMany([categoryData]);
                  res.redirect('/admin/categoryManagment');
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};



const blockCategory = async (req, res) => {
      try {
            const categoryId = req.query.id
            let catData = await choiceCategory.findById(categoryId)
            if (catData) {
                  catData.is_block = !catData.is_block
                  await catData.save()
                  res.redirect('/admin/categoryManagment')
            } else {
                  res.status(500).send("Internal Server Error");
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const deleteCategory = async (req, res) => {
      try {
            const categoryId = req.query.id
            await choiceCategory.deleteOne({ _id: categoryId })
            res.redirect('/admin/categoryManagment')
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

module.exports = {
      loadCategory,
      clickedAddCategory,
      addedCategory,
      blockCategory,
      deleteCategory
}