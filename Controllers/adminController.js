const choiceAdmin = require('../Models/adminModel')
const bcrypt = require('bcrypt');
const choiceUser = require('../Models/userModel');
const choiceProduct = require('../Models/productModel')
const choiceOrder = require('../Models/orderModel')
const puppeteer = require('puppeteer')
const ExcelJS = require('exceljs')
const path = require("path")
const fs = require('fs')
const ejs = require('ejs')

//=========================== admin login =================================
const loadLogin = async (req, res) => {
      try {
            res.render('login')
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//================================ user managment page ================================
const loadUserManagment = async (req, res) => {
      try {
            const users = await choiceUser.find();
            if (users) {
                  res.render('userManagment', { userData: users });
            } else {
                  res.status(500).send("Internal Server Error");
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//================================= loading the admin page by loging in by admin ============================
const loadAdmin = async (req, res) => {
      try {
            const thisData = await choiceAdmin.findOne({ email: req.body.adminEmail });
            if (thisData && await bcrypt.compare(req.body.adminPassword, thisData.password)) {
                  res.redirect('/admin/dashboard')
            } else {
                  res.render('login', { error: "Invalid email or password!!" });
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//======================= to block the user by the admin =============================
const blockingUser = async (req, res) => {
      try {
            const userId = req.query.id;
            const user = await choiceUser.findById(userId);
            if (user) {
                  user.is_block = !user.is_block;
                  await user.save();
                  res.redirect('/admin/userManagment')
            } else {
                  res.status(500).send("Internal Server Error");
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

//=========================== logout ======================================
const logout = async (req, res) => {
      try {
            req.session.destroy()
            res.redirect('/admin')
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

//==========================SALES REPORT IN ADMIN SIDE===============================
const salesReport = async (req, res) => {
      try {
            const users = await choiceUser.find({ is_block: 0 });
            const orderData = await choiceOrder.aggregate([
                  { $unwind: "$products" },
                  { $match: { status: "Delivered" } },
                  { $sort: { date: -1 } },
                  {
                        $lookup: {
                              from: "choiceproducts",
                              let: { productId: { $toObjectId: "$products.productId" } },
                              pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
                              as: "products.productDetails",
                        },
                  },
                  {
                        $addFields: {
                              "products.productDetails": {
                                    $arrayElemAt: ["$products.productDetails", 0],
                              },
                        },
                  },
            ]);
            res.render("salesReport", {
                  orders: orderData, users,
            });
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

//===================================== Download report ===================================
const downloadReport = async (req, res) => {
      try {
            const { duration, format } = req.params;
            const currentDate = new Date();
            const startDate = new Date(currentDate - 1 * 24 * 60 * 60 * 1000);
            const orders = await choiceOrder.aggregate([
                  {
                        $unwind: "$products",
                  },
                  {
                        $match: {
                              status: "Delivered",
                        },
                  },
                  {
                        $sort: { deliveryDate: -1 },
                  },
                  {
                        $lookup: {
                              from: "choiceproducts",
                              let: { productId: { $toObjectId: "$products.productId" } },
                              pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
                              as: "products.productDetails",
                        },
                  },
                  {
                        $addFields: {
                              "products.productDetails": {
                                    $arrayElemAt: ["$products.productDetails", 0],
                              },
                        },
                  },
            ]);
            const date = new Date()
            data = {
                  orders,
                  date,
            }

            if (format === 'pdf') {
                  const filepathName = path.resolve(__dirname, "../Views/adminView/downloadSales.ejs");

                  const html = fs.readFileSync(filepathName).toString();
                  const ejsData = ejs.render(html, data);

                  const browser = await puppeteer.launch({ headless: "new" });
                  const page = await browser.newPage();
                  await page.setContent(ejsData, { waitUntil: "networkidle0" });
                  const pdfBytes = await page.pdf({ format: "letter" });
                  await browser.close();

                  res.setHeader("Content-Type", "application/pdf");
                  res.setHeader(
                        "Content-Disposition",
                        "attachment; filename= Sales Report.pdf"
                  );
                  res.send(pdfBytes);
            } else if (format === 'excel') {
                  // Generate and send an Excel report
                  const workbook = new ExcelJS.Workbook();
                  const worksheet = workbook.addWorksheet('Sales Report');

                  // Add data to the Excel worksheet (customize as needed)
                  worksheet.columns = [
                        { header: 'Order ID', key: 'orderId', width: 8 },
                        { header: 'Product Name', key: 'productName', width: 50 },
                        { header: 'Qty', key: 'qty', width: 5 },
                        { header: 'Date', key: 'date', width: 12 },
                        { header: 'Customer', key: 'customer', width: 15 },
                        { header: 'Total Amount', key: 'totalAmount', width: 12 },
                  ];
                  // Add rows from the reportData to the worksheet
                  orders.forEach((data) => {
                        worksheet.addRow({
                              orderId: data.uniqueId,
                              productName: data.products.productDetails.name,
                              qty: data.products.count,
                              date: data.date.toLocaleDateString('en-US', {
                                    year:
                                          'numeric', month: 'short', day: '2-digit'
                              }).replace(/\//g,
                                    '-'),
                              customer: data.userName,
                              totalAmount: data.products.totalPrice,
                        });
                  });

                  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                  res.setHeader('Content-Disposition', `attachment; filename=${duration}_sales_report.xlsx`);
                  const excelBuffer = await workbook.xlsx.writeBuffer();
                  res.end(excelBuffer);
            } else {
                  // Handle invalid format
                  res.status(400).send('Invalid format specified');
            }
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
};

//================================= filtering sales page ============================
const saleSorting = async (req, res) => {
      try {
            const duration = parseInt(req.params.id);
            const currentDate = new Date();
            const startDate = new Date(currentDate - duration * 24 * 60 * 60 * 1000);

            const orders = await choiceOrder.aggregate([
                  {
                        $unwind: "$products",
                  },
                  {
                        $match: {
                              status: "Delivered",
                              deliveryDate: { $gte: startDate, $lt: currentDate },
                        },
                  },
                  {
                        $sort: { deliveryDate: -1 },
                  },
                  {
                        $lookup: {
                              from: "choiceproducts",
                              let: { productId: { $toObjectId: "$products.productId" } },
                              pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
                              as: "products.productDetails",
                        },
                  },
                  {
                        $addFields: {
                              "products.productDetails": {
                                    $arrayElemAt: ["$products.productDetails", 0],
                              },
                        },
                  },
            ]);

            res.render('salesReport', { orders });
      } catch (error) {
            console.log(error.message);
            res.render('404')
      }
}

const saleDateSort = async (req, res) => {
      try {
            const start = new Date(req.body.startD)
            const end = new Date(req.body.endD)
            const orders = await choiceOrder.aggregate([
                  {
                        $unwind: "$products",
                  },
                  {
                        $match: {
                              status: "Delivered",
                              deliveryDate: { $gt: start, $lt: end },
                        },
                  },
                  {
                        $sort: { deliveryDate: -1 },
                  },
                  {
                        $lookup: {
                              from: "choiceproducts",
                              let: { productId: { $toObjectId: "$products.productId" } },
                              pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
                              as: "products.productDetails",
                        },
                  },
                  {
                        $addFields: {
                              "products.productDetails": {
                                    $arrayElemAt: ["$products.productDetails", 0],
                              },
                        },
                  },
            ]);
            res.render('salesReport', { orders });
      } catch (error) {
            console.log(error.message);
      }
}

const loadDashboard = async (req, res) => {
      try {
            const users = await choiceUser.find({ is_block: 0 });
            const products = await choiceProduct.find({ blocked: 0 });
            const tot_order = await choiceOrder.find();
            const sales = await choiceOrder.countDocuments({ status: 'Delivered' });

            if (sales) {
                  const codCount = await choiceOrder.countDocuments({ status: 'Delivered', paymentMethod: 'cash' });
                  const onlinePaymentCount = await choiceOrder.countDocuments({ status: 'Delivered', paymentMethod: 'Rayzor pay' });
                  const walletCount = await choiceOrder.countDocuments({ status: 'Delivered', paymentMethod: 'wallet' });

                  const monthlyOrderCounts = await choiceOrder.aggregate([
                        {
                              $match: {
                                    status: 'Delivered',
                              },
                        },
                        {
                              $group: {
                                    _id: { $dateToString: { format: '%m', date: '$deliveryDate' } },
                                    count: { $sum: 1 },
                              },
                        }
                  ]);
                  const data = []
                  let ind = 0;
                  if (monthlyOrderCounts.length != 0) {
                        for (let i = 0; i < 12; i++) {

                              if (i + 1 < monthlyOrderCounts[0]._id) {
                                    data.push(0)
                              } else {
                                    if (monthlyOrderCounts[ind]) {
                                          let count = monthlyOrderCounts[ind].count
                                          data.push(count)
                                    } else {
                                          data.push(0)
                                    }
                                    ind++
                              }
                        }
                  }


                  const monthRev = await choiceOrder.aggregate([
                        {
                              $match: {
                                    status: "Delivered"
                              }
                        },
                        {
                              $project: {
                                    year: { $year: '$date' },
                                    month: { $month: '$date' },
                                    totalAmount: 1
                              }
                        },
                        {
                              $group: {
                                    _id: { year: '$year', month: '$month' },
                                    totalRevenue: { $sum: '$totalAmount' }
                              }
                        },
                        {
                              $sort: {
                                    '_id.year': 1,
                                    '_id.month': 1
                              }
                        }
                  ])
                  const monRev = monthRev[0].totalRevenue
                  const totalRev = await choiceOrder.aggregate([
                        {
                              $match: {
                                    status: "Delivered"
                              }
                        },
                        {
                              $group: {
                                    _id: null,
                                    totalRevenue: { $sum: '$totalAmount' }
                              }
                        }
                  ])
                  const totalRevenue = totalRev[0].totalRevenue
                  res.render('dashboard', {
                        users,
                        products,
                        tot_order,
                        totalRevenue,
                        monRev,
                        sales,
                        codCount,
                        walletCount,
                        onlinePaymentCount,
                        data
                  });
            } else {
                  // If there is no data, set all values to 0
                  res.render('dashboard', {
                        users,
                        products,
                        tot_order: [],
                        totalRevenue: 0,
                        monRev: 0,
                        sales: 0,
                        codCount: 0,
                        walletCount: 0,
                        onlinePaymentCount: 0,
                        data: []
                  });
            }
      } catch (error) {
            console.log(error.message);
            res.render('404');
      }
}


module.exports = {
      loadAdmin,
      loadLogin,
      blockingUser,
      loadUserManagment,
      loadUserManagment,
      logout,
      salesReport,
      downloadReport,
      loadDashboard,
      saleSorting,
      saleDateSort
}