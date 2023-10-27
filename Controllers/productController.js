const choiceProduct = require('../Models/productModel')
const choiceCategory = require('../Models/categoryModel')
const Sharp = require ('sharp')

//========================= product managment page in admin side ==========================
const loadProductManagment = async(req,res)=>{
      try {
            const proData = await choiceProduct.find()
            if(proData){
                  res.render('productManagment',{productData : proData})
            }else{
                  res.status(500).send("Internal Server Error");     
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

// form to add the product
const addProduct = async(req,res)=>{
      try {
            const catdata = await choiceCategory.find({})
            if(catdata){
                  res.render('addProduct',{ categoryData : catdata})
            }else{
                  res.status(500).send("Internal Server Error");     
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const addedProduct = async (req, res) => {
      try {
            let details = req.body;
            const files = await req.files;
            
            const img = [
                  files.image1[0].filename,
                  files.image2[0].filename,
                  files.image3[0].filename,
                  files.image4[0].filename,
            ];
            for (let i = 0; i < img.length; i++) {
                  await Sharp("Public/products/images/" + img[i])
                  .resize(500, 500)
                  .toFile("Public/products/crop/" + img[i]);
            }
            let product = new choiceProduct({
                  name: details.productName,
                  category: details.category,
                  quantity: details.quantity,
                  price: details.price,
                  description: details.description,
                  blocked: 0,
                  "images.image1": files.image1[0].filename,
                  "images.image2": files.image2[0].filename,
                  "images.image3": files.image3[0].filename,
                  "images.image4": files.image4[0].filename,
            });

            let result = await product.save();
            if(result){
                  res.redirect("/admin/productManagmen");
            }else{
                  res.status(500).send("Internal Server Error");
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const deleteProduct = async(req,res)=>{
      try {
            const productId = req.query.id
            await choiceProduct.deleteOne({ _id: productId});
            res.redirect('/admin/productManagmen')
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const editProduct = async (req, res) => {
      try {
            const productId = req.query.id;
            const productData = await choiceProduct.findById(productId); 
            const catdata = await choiceCategory.find({})
            if(productData){
                  res.render('editProduct', { updateData: productData, categoryData : catdata });
            }else{
                  res.status(500).send("Internal Server Error"); 
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const prodectEdited = async (req, res) => {
      try {
            let details = req.body;
            let imagesFiles = req.files;
            let currentData = await choiceProduct.findOne({ _id: req.query.id });
            
            if(currentData){
                  let img1, img2, img3, img4;
      
                  img1 = imagesFiles.image1
                  ? imagesFiles.image1[0].filename
                  : currentData.images.image1;
                  img2 = imagesFiles.image2
                  ? imagesFiles.image2[0].filename
                  : currentData.images.image2;
                  img3 = imagesFiles.image3
                  ? imagesFiles.image3[0].filename
                  : currentData.images.image3;
                  img4 = imagesFiles.image4
                  ? imagesFiles.image4[0].filename
                  : currentData.images.image4;
      
                  await Sharp("Public/products/images/" + img1)
                  .resize(500, 500)
                  .toFile("Public/products/crop/" + img1);
                  await Sharp("public/products/images/" + img2)
                  .resize(500, 500)
                  .toFile("Public/products/crop/" + img2);
                  await Sharp("public/products/images/" + img3)
                  .resize(500, 500)
                  .toFile("Public/products/crop/" + img3);
                  await Sharp("public/products/images/" + img4)
                  .resize(500, 500)
                  .toFile("Public/products/crop/" + img4);
                  
                  await choiceProduct.updateOne(
                  { _id: req.query.id },
                  {
                        $set: {
                        name: details.name,
                        price: details.price,
                        quantity: details.quantity,
                        category: details.category,
                        description: details.description,
                        "images.image1": img1,
                        "images.image2": img2,
                        "images.image3": img3,
                        "images.image4": img4,
                        },
                  }
                  );
                  res.redirect("/admin/productManagmen");
            }else{
                  res.status(500).send("Internal Server Error"); 
            }
            
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};
  
  
  

module.exports = {
      addedProduct,
      loadProductManagment,
      addProduct,
      deleteProduct,
      editProduct,
      prodectEdited
}