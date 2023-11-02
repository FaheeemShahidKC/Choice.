const choiceBanner = require('../Models/bannerModel')

exports.loadBannerManagment = async (req, res) => {
      try {
            req.session.bannerDescription = false
            req.session.bannerTitle = false
            req.session.bannerImage = false
            req.session.bannerUrl = false
            const banners = await choiceBanner.find()
            res.render('bannerManagment', { banners: banners })
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

exports.addedBanner = async (req, res) => {
      try {
            if(req.body.bannerTitle.trim() === ""){
                  req.session.bannerTitle = true
                  res.redirect('/admin/addBanner')
            }else if(req.body.description.trim() === ""){
                  req.session.bannerDescription = true
                  res.redirect('/admin/addBanner')
            }else if(!req.file){
                  req.session.bannerImage = true
                  res.redirect('/admin/addBanner')
            }else if(req.body.url.trim() === ""){
                  req.session.bannerUrl = true
                  res.redirect('/admin/addBanner')
            }else{
                  let banner = new choiceBanner({
                        title: req.body.bannerTitle,
                        description: req.body.description,
                        image: req.file.filename,
                        linkUrl: req.body.url,
                        status: true
                  });
                  let result = await banner.save();
                  if (result) {
                        res.redirect("/admin/bannerManagment");
                  } else {
                        res.status(500).send("Failed to save banner data.");
                  }
            }
            
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

exports.addBanner = async (req, res) => {
      try {
            let bannerDescription = req.session.bannerDescription
            let bannerTitle = req.session.bannerTitle
            let bannerImage = req.session.bannerImage
            let bannerUrl = req.session.bannerUrl
            res.render('addBanner', {bannerUrl,bannerImage,bannerTitle,bannerDescription})
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

exports.editBanner = async (req, res) => {
      try {
            const banner = await choiceBanner.find({ _id: req.query.id })
            res.render('editBanner', { banner: banner })
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

exports.editedBanner = async (req, res) => {
      try {
            const bannerId = req.query.id; // Assuming you pass the bannerId as a parameter in the URL
            const currentBanner = await choiceBanner.find({ _id: bannerId });

            let image;
            if (!req.file || !req.file.filename) {
                  // Handle the case where req.file or req.file.filename is undefined
                  // Use the existing banner's image if available, or provide a default value
                  if (currentBanner[0] && currentBanner[0].image) {
                        image = currentBanner[0].image;
                  } else {
                        // Provide a default image name or handle it as needed
                        image = "default-image.jpg";
                  }
            } else {
                  image = req.file.filename;
            }

            const update = {
                  title: req.body.bannerTitle,
                  description: req.body.description,
                  image: image,
                  linkUrl: req.body.url
            };

            // Update the existing banner in the database
            const result = await choiceBanner.findOneAndUpdate(
                  { _id: bannerId }, // Filter by bannerId
                  update, // New data to be updated
                  { new: true } // Return the updated document
            );

            if (!result) {
                  return res.status(404).send("Banner not found");
            }

            return res.redirect("/admin/bannerManagment");
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

exports.blockBanner = async(req,res)=>{
      try {
            const bannerId = req.query.id
            let banner = await choiceBanner.findById(bannerId)
            if(banner){
                  banner.status = !banner.status
                  await banner.save()
                  res.redirect('/admin/bannerManagment')
            }else{
                  res.status(500).send("Internal Server Error"); 
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}