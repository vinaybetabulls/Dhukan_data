var express = require('express')
var router = express.Router();
var dateTime = require('node-datetime');
var dt = dateTime.create();
var formatted = dt.format('Y-m-d H:M:S');
var productsService = require('../../services/productService')
const config = require('../../config/config');
const path = require('../../config/imagepath')

var jwt = require('jsonwebtoken');
const common = require('../../common');

var xlsx = require('xlsx');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.get('/getproduct', async (req, res) => {
    console.log(req.query);
    var result = [];
    var product = await productsService.getproducts(req.query);
    var sku_data = await productsService.getProductSkus(product.data.results);
    for (var i = 0; i < product.data.results.length; i++) {
        product.data.results[i].sku = [];
        for (var j = 0; j < sku_data.data.length; j++) {
            if (product.data.results[i].id == sku_data.data[j].product_id) {
                product.data.results[i].sku.push(sku_data.data[j]);
            }
        }
        if (i == product.data.results.length - 1) {
            //console.log(sku_ids)
            let sku_ids = [];
            for (var id = 0; id < sku_data.data.length; id++) {
                sku_ids.push(sku_data.data[id].skid);
                if (id == sku_data.data.length - 1) {


                    let images = await productsService.getImages(sku_ids);

                    //let faq=await productsService.getfaq(sku_ids)
                    for (var k = 0; k < product.data.results.length; k++) {
                        for (var l = 0; l < product.data.results[k].sku.length; l++) {
                            product.data.results[k].sku[l].sku_images = [];
                            for (var img = 0; img < images.result.length; img++) {
                                if (product.data.results[k].sku[l].skid == images.result[img].sku_id) {
                                    product.data.results[k].sku[l].sku_images.push(images.result[img])

                                }
                            }
                            //if(data.results)

                        }
                        if (k == product.data.results.length - 1) {
                            //res.send(product)
                            let termsandconditions = await productsService.gettaramesandctions(sku_ids)
                            for (var k = 0; k < product.data.results.length; k++) {
                                for (var l = 0; l < product.data.results[k].sku.length; l++) {
                                    product.data.results[k].sku[l].terms = "";
                                    for (var terms = 0; terms < termsandconditions.result.length; terms++) {
                                        if (product.data.results[k].sku[l].skid == termsandconditions.result[terms].sku_id) {
                                            product.data.results[k].sku[l].terms = termsandconditions.result[terms]

                                        }
                                    }
                                    //if(data.results)

                                }
                                if (k == product.data.results.length - 1) {
                                    let faqData = await productsService.getfaq(sku_ids);
                                    for (var k = 0; k < product.data.results.length; k++) {
                                        for (var l = 0; l < product.data.results[k].sku.length; l++) {
                                            for (var terms = 0; terms < faqData.result.length; terms++) {
                                                if (product.data.results[k].sku[l].skid == faqData.result[terms].sku_id) {
                                                    product.data.results[k].sku[l].faq = faqData.result[terms]

                                                }
                                            }
                                            //if(data.results)

                                        }
                                        if (k == product.data.results.length - 1) {
                                            res.send(product)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //res.send(product)
        }
    }
})
router.post('/getsubdata', (req, res) => {
    productsService.getsubdata(req.body, (data) => {
        res.status(200).json(data);
    })
})

router.post('/deleteproduct', (req, res) => {
    if (req.body.id == "" || req.body.id == undefined || req.body.id == null) {
        res.status(400).json({ "message": " id is  require" })
    } else {
        productsService.deleteproduct(req.body, (data) => {
            res.status(200).json(data);

        })
    }
})
router.post('/updateproduct', async (req, res) => {
    if (req.body.id == "" || req.body.id == undefined || req.body.id == null) {
        res.status(400).json({ "message": " id is  require" })
    } else {
        let update_product = await productsService.updateproduct(req.body);
        if (update_product.status == 200) {
            let update_terms = await productsService.updateTerms(req.body.sku);
            if (update_terms.status == 200) {
                console.log(update_terms);
                let update_faq = await productsService.updateFAQ(req.body.sku);
                if (update_faq.status == 200) {
                    console.log(update_faq);
                    let update_sku = await productsService.updateSKU(req.body.sku, req.body.id);
                    if (update_sku.data.status == 200) {
                        console.log(update_sku);
                        let new_skus = await productsService.NewInsertSKU(update_sku);
                        console.log(new_skus);
                        let update_sku_imates = await productsService.updateSKUImages(req.body.sku, req.body.id);
                        res.send(update_sku_imates)
                    }
                 
                }
            }
        }
    }
})
router.post('/insertproduct', async (req, res) => {
    if (req.body.title == "" || req.body.title == undefined || req.body.title == null) {
        res.status(400).json({ "message": " title  require" })
    }
    if (req.body.category_id == "" || req.body.category_id == undefined || req.body.category_id == null) {
        res.status(400).json({ "message": " category_id is require" })
    }
    if (req.body.subcategory_id == "" || req.body.subcategory_id == undefined || req.body.subcategory_id == null) {
        res.status(400).json({ "message": " subcategory_id is require" })
    }
    // if (req.body.sku == "" || req.body.sku == undefined || req.body.sku == null) {
    //     res.status(400).json({ "message": " sku is require" })
    // }
    // if (req.body.image == "" || req.body.image == undefined || req.body.image == null) {
    //     res.status(400).json({ "message": " image is require" })
    // }

    else {
        let saveProduct = await productsService.insertpoduct(req.body);
        if (saveProduct.status == 200) {
            req.body.product_id = saveProduct.data.insertId;
            let skuProduct = await productsService.InsertSKU(req.body);

            if (skuProduct.status == 200) {
                // res.json(skuProduct)
                let skuImages = await productsService.insertImages(skuProduct);
                //console.log("hello",skuProduct)
                var deletedata
                for (var i = 0; i < skuProduct.data.length; i++) {
                    deletedata = delete skuProduct.data[i].sku_images;
                    if (i == skuProduct.data.length - 1) {
                        console.log(skuProduct.data)
                        let terms = await productsService.saveTermsandConditions(skuProduct.data);
                        let faq = await productsService.inserfaq(skuProduct.data);
                        res.json({ status: 200, err_message: "", message: "Product inserted sucessfully" });
                    }
                }

            }
            else {
                res.json({ "error": skuProduct });
            }
        } else {
            res.send(saveProduct)
        }
    }


})
router.post('/getproductbyid', (req, res) => {
    if (req.body.id == "" || req.body.id == undefined || req.body.id == null) {
        res.status(400).json({ "message": " id is  require" })
    } else {
        productsService.getproductgetid(req.body, (data) => {
            productsService.getproductskubyid(req.body, (result) => {
                data.result[0].sku = result.result;


                res.status(200).json(data);
            })

        })
    }
})
router.post('/deleteproductimage', (req, res) => {
    if (req.body.id == "" || req.body.id == undefined || req.body.id == null) {
        res.status(400).json({ "message": " id is  require" })
    } else {
        productsService.deleteproductimage(req.body, (data) => {
            res.status(200).json(data);
        })
    }
})

router.post('/readExcel', multipartMiddleware, (req, res) => {

    let excelFile = req.files.excelFile;
    const workbook = xlsx.readFile(excelFile.path);
    var sheet_name_list = workbook.SheetNames;
    var xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    productsService.saveExcelData(xlData, (response) => {
        console.log(response)
        //console.log(xlData);
        res.send(response)

    })

});


module.exports = router
