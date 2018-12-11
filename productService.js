//reference of dbconnection.js
var productsDAO = require('../dao/productDAO');
var productsSkuDAO = require('../dao/skuDAO');
var productSpecificationDAO = require('../dao/productSpecificationDAO');
var productImagesDAO = require('../dao/productImagesDAO');
var cartDAO = require('../dao/cartDAO');
var cartService = require('../services/cartService');
const common = require('../common');
const path = require('../config/imagepath');
const config = require('../config/imagepath');
var async = require('async');
const uniqid = require('uniqid');
var fs = require('fs');
var _ = require('lodash');

var productsService = {
    //All categories list
    getAllProducts: function (limit, done) {
        if (limit == undefined) {
            limit = '';
        }
        productsDAO.getAllProducts(limit, function (err, product_data) {
            if (err) {
                done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err });
            } else {
                if (product_data.length > 0) {
                    done({ "status": 200, "err_field": "", "message": "Success", "products": product_data });
                } else {
                    done({ "status": 400, "err_field": "", "message": "No records found" });
                }
            }
        });
    },
    getproducts: function (body, done) {
        return new Promise((resolve, reject) => {
            productsDAO.getProductsCount((err, response) => {
                var numRows;
                var queryPagination;
                var numPerPage = parseInt(body.npp, 10) || 1;
                var page = parseInt(body.page, 10) || 0;
                console.log(numPerPage + "......" + page);
                var numPages;
                var skip = page * numPerPage;
                var end_limit = numPerPage;
                var limit = skip + ',' + end_limit;
                console.log(limit)
                numRows = response[0].numRows;
                numPages = Math.ceil(numRows / numPerPage);
                productsDAO.getProducts(limit, (err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ status: 400, err_message: "something went wrong" })
                    }
                    else {

                        var responsePayload = {
                            results: result
                        };
                        if (page < numPages) {
                            responsePayload.pagination = {
                                current: page,
                                perPage: numPerPage,
                                previous: page > 0 ? page - 1 : undefined,
                                next: page < numPages - 1 ? page + 1 : undefined
                            }
                        }
                        else responsePayload.pagination = {
                            err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
                        }
                        resolve({ status: 200, err_message: "", data: responsePayload });
                    }
                })
            })
        })
        //var imagedata=[]


        /* productsDAO.getproducts((err, responce) => {

            if (err) {
                done({ "status": 400, "err_field": "", "message": "No records found" });
            }
            else {

                // done({result:responce})
                var count = 0;
                for (let i = 0; i < responce.length; i++) {
                    productsDAO.getProductImages(responce[i].id, (err, data) => {
                        var img = []
                        count++;
                        for (j = 0; j < data.length; j++) {
                            img.push(data[j]);
                            if (j == data.length - 1) {
                                responce[i].myImages = img;
                            }
                        }
                        if (responce.length == count) {
                            done({ result: responce })
                        }
                    })
                }
            }

        }) */
    },
    getProductSkus: function (data, done) {
        return new Promise((resolve, reject) => {
            let products_id = [];
            for (var i = 0; i < data.length; i++) {
                console.log("tejasree", data[i].id)
                products_id.push(data[i].id);
                if (i == data.length - 1) {
                    productsSkuDAO.getProductSkuByProductId(products_id, (err, response) => {

                        console.log("dhukantext", response)
                        if (err) {
                            console.log(err);
                            reject({ status: 400, err_message: "something went wrong", data: err })
                        }
                        else {

                            resolve({ status: 200, err_message: "", data: response })
                        }
                    })
                }
            }
        })
    },
    deleteproduct: function (data, done) {
        productsDAO.getProductImages(data.id, (err, responce) => {
            //console.log(responce)
            if (err) {
                done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err });
            } else {
                for (var i = 0; i < responce.length; i++) {
                    //console.log(responce.length)
                    var imagepath = responce[i].product_image.split('http://versatilemobitech.co.in/DHUKAN/')[1]

                    imagepath = "./" + imagepath
                    if (fs.existsSync(image_db_path)) {
                        fs.unlinkSync(imagepath);
                    }


                    //console.log(imagepath)

                }
                productsDAO.deleteproducts(data, (err, responce) => {
                    if (err) {
                        done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err });
                    } else {
                        done({ "status": 200, "err_field": "", "message": "Success", "data": "product delte sucessfully" })
                    }
                })

            }



        })




    },
    deleteproductimage: function (data, done) {
        productsDAO.deleteproductimage(data, (err, responce) => {
            if (err) {
                done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err });
            } else {
                done({ "status": 200, "err_field": "", "message": "Success", "data": "product delte sucessfully" })
            }
        })
    },
    getsubdata: function (data, done) {
        productsDAO.getsubdata(data, (err, responce) => {
            // console.log(responce)
            if (err) {
                done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err });
            } else {
                done({ "status": 200, "err_field": "", "message": "Success", "data": responce })
            }
        })

    },
    /*updateproduct: function (data, done) {
        productsDAO.updateproduct(data, (err, response) => {
            if (err) {
                console.log(err)
            }
            else {
                updateImagesFun();
            }
        })
        function updateImagesFun() {
            productsDAO.getProductImages(data.id, (err, response) => {
                if (err) {
                    console.log(err)
                }
                else {

                    console.log(response)
                    for (let i = 0; i < data.image.length; i++) {
                        if (data.image[i].image_no == "") {
                            let d = new Date();
                            let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
                            let image_name = time + "_" + uniqid() + ".png";
                            let imagePath = "./images/" + image_name;
                            let db_path = config.path + image_name;
                            data.image_path = db_path;
                            data.product_id = data.id;
                            fs.writeFileSync(imagePath, data.image[i].image_data, 'base64')
                            productsDAO.insertImages(data, (err, insert) => {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    console.log(insert)
                                }
                            })
                        }
                        else {
                            for (let j = 0; j < response.length; j++) {
                                if (data.image[i].image_no == response[j].id) {
                                    let image_db_path = response[j].product_image.split('http://versatilemobitech.co.in/DHUKAN/')[1];
                                    image_db_path = "./" + image_db_path;
                                    if (fs.existsSync(image_db_path)) {
                                        fs.unlinkSync(image_db_path);
                                    }
                                    let d = new Date();
                                    let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
                                    let image_name = time + "_" + uniqid() + ".png";
                                    let imagePath = "./images/" + image_name;
                                    let db_path = config.path + image_name;
                                    response[j].image_path = db_path;
                                    fs.writeFileSync(imagePath, data.image[i].image_data, 'base64')
                                    productsDAO.updateProductImageById(response[j], (err, response) => {
                                        if (err) {

                                            console.log(err)
                                        }
                                        else {
                                            console.log(response)
                                        }
                                    })
                                }
                            }

                        }
                        if (data.image.length - 1 == i) {
                            //done({ message: "updated successfully" });
                            updateSKU(data);
                        }
                    }
                }
            })
        }

        function updateSKU(data) {
            for (var d = 0; d < data.length; d++) {
                for (var s = 0; s < data[d].skus.length; s++) {
                    if (data[d].skus[s].length > 0 && data[d].skus[s].skid) {
                        let sku_data = data[d].skus[s];
                        if (data[d].skus[s].image !== "") {
                            var date = new Date();
                            let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds();
                            let image_name = time + "_" + uniqid() + ".png";
                            let image_path = "./images/" + image_name;
                            let db_image_path = config.path + image_name;
                            data[d].skus[s].image = db_image_path;
                            fs.writeFileSync(image_path, data[d].skus[s].image);

                            productsSkuDAO.updateProductSKU(sku_data, function (err, response) {

                            })
                        }
                        else {
                            productsSkuDAO.updateProductSKU(sku_data, function (err, response) {

                            })
                        }
                    }
                    else {
                        //skuInsert
                        //insert new images
                    }
                }
                if (d == data.length - 1) {
                    setTimeout(() => {
                        updateSKUImages(data)
                    }, 250);
                }
            }
        }
        function updateSKUImages(data) {
            for (var dt = 0; dt < data.length; dt++) {
                if (data[dt].sku.length > 0) {
                    for (var sk = 0; sk < data[dt].sku.length; sk++) {
                        if (data[dt].sku[sk].sku_images.length > 0) {
                            for (var im = 0; im < data[dt].sku[sk].sku_images[im].length; im++) {
                                if (data[dt].sku[sk].sku_images[im].id) {
                                    //unlink
                                    //save file
                                    //add image object to object
                                    //update image
                                }
                                else {
                                    //save file
                                    //add image path to object
                                    //save image
                                }
                            }
                        }
                    }
                }
                if (dt == data.length - 1) {
                    setTimeout(() => {
                        done({ "status": 200, "err_field": "", "message": "updated successfully" })
                    }, 1000);
                }
            }
        }

    },*/
    saveExcelData: (data, done) => {
        var count = 0;
        var imagePath;
        async.parallel([
            function (complete) {
                for (let j = 0; j < data.length; j++) {
                    let d = new Date();
                    let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
                    let image = time + "_" + uniqid() + ".png";
                    //user_update_data.profile=image;
                    imagePath = "./images/" + image;
                    data[j].image_path = config.path + image;
                    data[j].imagePath = imagePath;
                    if (j == data.length - 1) {
                        complete(null, data);
                    }
                }
            },
            function (complete) {
                for (var i = 0; i < data.length; i++) {
                    productsDAO.insertpoduct(data[i], (err, responce) => {
                        if (err) {
                            done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err });
                        } else {
                            console.log(i);
                            console.log(data.length)

                        }
                    })
                    if (i == data.length - 1) {
                        console.log("calling saveImagesIntoFiels")
                        complete(null, data)

                    }
                }
            },
            function (complete) {
                for (var k = 0; k < data.length; k++) {
                    require("fs").writeFile(data[k].imagePath, data[k].product_image, 'base64', (err, response) => {
                        if (err) {
                            console.log('err', err);
                        }
                        else {

                        }
                    })
                    if (k == data.length - 1) {
                        console.log("done succesfully")
                        complete(null, "save data successfully")
                    }
                }
            }
        ], function (err, results) {
            done({ "status": 200, "err_field": "", "message": "Success", "data": "data inserted sucessfully" });
        })
    },
    insertpoduct: function (data) {
        return new Promise((resolve, reject) => {

            productsDAO.insertpoduct(data, (err, productResult) => {

                if (err) {
                    console.log(err)
                    reject({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err })
                }
                else {
                    //console.log(productResult)
                    resolve({
                        status: 200,
                        data: productResult
                    })
                }
            })
        })

    },
    InsertSKU: function (data) {
        //console.log(data.product_id)
        var skuImagesData = [];
        var count = 0;
        return new Promise((resolve, reject) => {
            for (var i = 0; i < data.sku.length; i++) {
                let skuImage = data.sku[i].skuImage;
                let termsAndCondtions = data.sku[i].terms;
                let faq = data.sku[i].faq;
                let answer = data.sku[i].answer;
                let description = data.sku[i].Description;
                let d = new Date();
                let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
                let image_name = time + "_" + uniqid() + ".png";
                let imagePath = "./images/" + image_name;
                let db_path = config.path + image_name;
                fs.writeFileSync(imagePath, data.sku[i].quality_image, 'base64');
                data.sku[i].quality = db_path
                productsSkuDAO.saveProductSKU(data.sku[i], data.product_id, (err, response) => {
                    count++;
                    if (err) {
                        console.log(err)
                        reject({ stsuts: 400, data: err })
                    }
                    else {
                        skuImagesData.push({
                            product_id: data.product_id,
                            sku_id: response.insertId,
                            sku_images: skuImage,
                            terms: termsAndCondtions,
                            faq: faq,
                            answer: answer

                        });
                        if (count == data.sku.length) {
                            resolve({ status: 200, data: skuImagesData })
                        }
                    }
                })
            }

        })
    },

    insertImages: function (data, callback) {
        //console.log(data)
        var count = 0;
        return new Promise((resolve, reject) => {

            for (var i = 0; i < data.data.length; i++) {
                //console.log(data.data[i])
                //console.log(data.data[i].sku_images)
                for (var j = 0; j < data.data[i].sku_images.length; j++) {
                    //console.log(data.data[i].sku_images[j])
                    let d = new Date();
                    let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
                    let image_name = time + "_" + uniqid() + ".png";
                    let imagePath = "./images/" + image_name;
                    let db_path = config.path + image_name;
                    fs.writeFileSync(imagePath, data.data[i].sku_images[j], 'base64');
                    let obj = {
                        image_path: db_path,
                        product_id: data.data[i].product_id,
                        sku_id: data.data[i].sku_id
                    }
                    productsSkuDAO.saveProductSKUImages(obj, (err, response) => {
                        count++;
                        if (err) {
                            console.log(err)
                            reject({ status: 400, data: err, err_field: "something went wrong" })
                        }
                        else {
                            console.log(response);

                            if (count == data.data.length) {
                                resolve({ status: 200, err_field: "", message: "product inserted successfully" })
                            }
                        }
                    })
                }
            }
        })
    },
    inserfaq: function (body, callback) {

        return new Promise((resolve, reject) => {
            let count = 0;
            for (var i = 0; i < body.length; i++) {
                productsSkuDAO.inserfaq(body[i], (err, response) => {
                    count++;
                    if (err) {
                        reject({ "status": 400, err_message: "something went to worng", result: err })
                    }
                    if (count == body.length) {
                        console.log("inserted faq")
                        resolve({ ststus: 200, message: "data inserted sucessfully" })
                    }


                })

            }

        })

        // productsDAO.insertfaq(body, (err, responce) => {
        //     if (err) {
        //         callback({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err });
        //     }
        //     else {
        //         callback({ "status": 200, "message": "inserted succesfully", "err_field": "" })

        //     }

        // })


    },
    saveTermsandConditions: function (body) {
        console.log("dhukan test", body.length)
        return new Promise((resolve, reject) => {
            let count = 0;
            for (var i = 0; i < body.length; i++) {

                productsSkuDAO.insertTermsAndConditions(body[i], (err, response) => {
                    count++;
                    if (err) {
                        console.log(err)
                        reject({ "status": 400, err_message: "something went to worng", result: err })
                    }
                    if (count == body.length) {
                        console.log("inserted tarames")
                        resolve({ ststus: 200, message: "data inserted sucessfully" })
                    }

                })


            }
        })
    },
    getImages: function (data, done) {
        return new Promise((resolve, reject) => {
            productsSkuDAO.getimages(data, (err, response) => {
                //console.log(response)
                if (err) {
                    reject({ "status": 400, err_message: "something went to worng", result: err })
                } else {
                    resolve({ ststus: 200, message: "data getting sucessfully", result: response })
                }

            })



        })


    },
    gettaramesandctions: function (data) {
        console.log("vinay...", data)
        return new Promise((resolve, reject) => {
            productsSkuDAO.gettermesandcontions(data, (err, response) => {
                console.log("/////", response)
                if (err) {
                    reject({ "status": 400, "err_filed": "something went to worng", "result": err })
                } else {
                    resolve({ "ststus": 200, "err_field": "", "result": response })
                }

            })

        })

    },
    getfaq: function (data) {
        return new Promise((resolve, reject) => {
            productsSkuDAO.getfaq(data, (err, response) => {
                if (err) {
                    reject({ "status": 400, "err_filed": "something went to worng", "result": err })

                } else {
                    resolve({ "ststus": 200, "err_field": "", "result": response })
                }
            })
        })

    },

    updateproduct: function (data) {
        return new Promise((resolve, reject) => {
            productsDAO.updateproduct(data, (err, response) => {
                if (err) {
                    console.log(err)
                    reject({ status: 400, err_message: "Something went wrong", data: err });
                }
                else {
                    resolve({ status: 200, err_message: "", message: "update product successfully" })
                }
            })
        })
    },
    updateTerms: function (data) {
        return new Promise((resolve, reject) => {
            let count = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].terms.skid != undefined) {
                    productsDAO.updateTerms(data[i].terms, (err, response) => {
                        count++;
                        if (err) {
                            console.log(err);
                            reject({ status: 400, err_field: "Something went wrong", data: err })
                        }

                    })
                }
                else {
                    count++;
                }
                if (count == data.length - 1) {
                    setTimeout(() => {
                        resolve({ status: 200, err_field: "", message: "Updated terms and conditions succesfully" })
                    }, 200);

                }
            }
        })
    },
    updateFAQ: function (data) {
        return new Promise((resolve, reject) => {
            let count = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].faq.sku_id != undefined) {
                    productsDAO.updateFAQ(data[i].faq, (err, response) => {
                        count++;
                        if (err) {
                            console.log(err);
                            reject({ status: 400, err_field: "Something went wrong", data: err })
                        }
                    })
                }
                else {
                    count++;
                }
                if (count == data.length - 1) {
                    setTimeout(() => {
                        resolve({ status: 200, err_field: "", message: "Updated terms and conditions succesfully" })
                    }, 200);

                }
            }
        })
    },
    updateSKU: function (data, product_id) {
        return new Promise((resolve, reject) => {
            let count = 0;
            for (var i = 0; i < data.length; i++) {
                
                if (data[i].skid != undefined) {
                    let img_db_path = data[i].image_quality_path.split('http://versatilemobitech.co.in/DHUKAN/')[1];
                    img_db_path = "/images" + img_db_path;
                    if (fs.existsSync(img_db_path)) {
                        fs.unlinkSync(img_db_path);
                    }
                    let d = new Date();
                    let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
                    let image_name = time + "_" + uniqid() + ".png";
                    let imagePath = "./images/" + image_name;
                    let db_path = config.path + image_name;
                    data[i].image_path = db_path;
                    fs.writeFileSync(imagePath, data[i].image, 'base64');
                    productsSkuDAO.updateProductSKU(data[i], (err, response) => {
                        count++;
                        if (err) {
                            console.log(err);
                            reject({ status: 400, err_field: "Something went wrong", data: err })
                        }
                        if (count == data.length) {
                            let new_skus = [];
                            for (var j = 0; j < data.length; j++){
                                if (!data[j].skid) {
                                    new_skus.push({sku_images: data[j],product_id:product_id })
                                }
                                if (j == data.length - 1) {
                                    rsolve({status:400,err_field:"",data:new_skus})
                                }
                            }
                        }
                    })
                }
            }
        })
    },
    NewInsertSKU: function (data) {
        //console.log(data.product_id)
        var skuImagesData = [];
        var count = 0;
        return new Promise((resolve, reject) => {
            for (var i = 0; i < data.sku.length; i++) {
                let skuImage = data.sku[i].skuImage;
                let d = new Date();
                let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
                let image_name = time + "_" + uniqid() + ".png";
                let imagePath = "./images/" + image_name;
                let db_path = config.path + image_name;
                fs.writeFileSync(imagePath, data.sku[i].quality_image, 'base64');
                data.sku[i].quality = db_path
                productsSkuDAO.saveProductSKU(data.sku[i], data.product_id, (err, response) => {
                    count++;
                    if (err) {
                        console.log(err)
                        reject({ stsuts: 400, data: err })
                    }
                    else {
                        skuImagesData.push({
                            product_id: data.product_id,
                            sku_id: response.insertId,
                            sku_images: skuImage

                        });
                        if (count == data.sku.length) {
                            resolve({ status: 200, data: skuImagesData })
                        }
                    }
                })
            }

        })
    },
    updateSKUImages: function (data, product_id) {
        return new Promise((resolve, reject) => {
            let count = 0;
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].sku_images.length; j++) {
                    if (data[i].sku_images[j].id != undefined) {
                        let img_db_path = data[i].sku_images[j].sku_img_path.split('http://versatilemobitech.co.in/DHUKAN/')[1];
                        img_db_path = "./images" + img_db_path;
                        if (fs.existsSync(img_db_path)) {
                            fs.unlinkSync(img_db_path);
                        }
                        let d = new Date();
                        let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
                        let image_name = time + "_" + uniqid() + ".png";
                        let imagePath = "./images/" + image_name;
                        let db_path = config.path + image_name;
                        data[i].sku_images[j].sku_db_path = db_path;
                        fs.writeFileSync(imagePath, data[i].sku_images[j].sku_image, 'base64');
                        productsSkuDAO.upadteSKUImages(data[i].sku_images[j], (err, response) => {
                            count++;
                            if (err) {
                                console.log(err);
                                reject({ status: 400, err_field: "Something went wrong", data: err })
                            }

                        })
                    }
                    else {
                        let d = new Date();
                        let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
                        let image_name = time + "_" + uniqid() + ".png";
                        let imagePath = "./images/" + image_name;
                        let db_path = config.path + image_name;
                        data[i].sku_images[j].image_path = db_path;
                        fs.writeFileSync(imagePath, data[i].sku_images[j].sku_image, 'base64');
                        data[i].sku_images[j].sku_id = data[i].skid;
                        data[i].sku_images[j].product_id = product_id;
                        productsSkuDAO.saveProductSKUImages(data[i].sku_images[j], (err, imageResponse) => {
                            count++;
                            if (err) {
                                console.log(err);
                                reject({ status: 200, err_field: "", data: err })
                            }

                        })
                    }
                }
                if (count - 1 == data.length) {
                    resolve({ status: 200, err_field: "", message: "Updated done successfully" })
                }
            }
        })
    },
    // insertpoduct: function (data, done) {
    //     productsDAO.insertpoduct(data, (err, productResult) => {
    //         if (err) {
    //             done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err });
    //         }
    //         else {
    //             if (data.image.length != 0) {
    //                 for (let i = 0; i < data.image.length; i++) {
    //                     let d = new Date();
    //                     let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
    //                     let image_name = time + "_" + uniqid() + ".png";
    //                     let imagePath = "./images/" + image_name;
    //                     let db_path = config.path + image_name;
    //                     fs.writeFileSync(imagePath, data.image[i], 'base64')
    //                    //console.log(productResult.insertId);
    //                     data.image_path = db_path;
    //                     data.product_id = productResult.insertId
    //                     productsDAO.insertImages(data, (err, response) => {
    //                         if (err) {
    //                             done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err });
    //                         }

    //                     })
    //                     if (data.image.length - 1 == i) {

    //                         done({"status":200,"message": "inserted succesfully","err_field": ""})
    //                     }
    //                 }
    //             }if(data.sku.length!=0){
    //                 for(var sk=0;sk<data.sku.length;sk++){
    //                     data.sku[sk].productId=productResult.insertId
    //                     let d = new Date();
    //                     let time = d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds()
    //                     let image_name = time + "_" + uniqid() + ".png";
    //                     let imagePath = "./images/" + image_name;
    //                     let db_path = config.path + image_name;
    //                     productsDAO.insertsku(data.sku[sk],(err,responce)=>{


    //                     })

    //                 }
    //             }
    //         }
    //     })


    // },
    getProductDetailsWithDetail: function (user_id, session_id, productsList, product_ids, otherParams, done) {
        //console.log("teeeeeeeeeee",otherParams)
        var data = { products: [] };
        var quantity = [];
        if (otherParams == '' || otherParams == null || otherParams.skuids == undefined) {
            var skuids = ''
        } else {

            var skuids = common.gNUE(otherParams.skuids);
        }

        async.parallel([
            function (completed) {

                var pushSkuData = function (sku_data, quantity) {
                    console.log("push sku quantity....", quantity)
                    if (sku_data.length > 0) {

                        for (var j in sku_data) {
                            for (var i in productsList) {
                                if (productsList[i].id == sku_data[j].product_id) {
                                    productsList[i].sku.push(sku_data[j]);
                                }

                            }
                        }
                    }
                    //console.log("hwll", productsList)
                    // for(var q1 in productsList){
                    //     for(var sk1 in productsList[q1].sku){
                    //         for(qu in quantity){
                    //             if(productsList[q1].sku[sk1].skid==quantity[qu].product_sku_id){
                    //                 productsList[q1].sku[sk1].mycart = quantity[qu].quantity
                    //             }
                    //         }
                    //     }

                    // }
                    // data.products = productsList;
                    // completed(null,data)

                    for (var q1 = 0; q1 < productsList.length; q1++) {
                        for (var sk = 0; sk < productsList[q1].sku.length; sk++) {
                            for (var qu = 0; qu < quantity.length; qu++) {
                                if (productsList[q1].sku[sk].skid == quantity[qu].product_sku_id) {
                                    productsList[q1].sku[sk].mycart = quantity[qu].quantity
                                }
                            }
                        }
                        if (q1 == productsList.length - 1) {
                            for (var p = 0; p < productsList.length; p++) {
                                for (var pl = 0; pl < productsList[p].sku.length; pl++) {
                                    console.log(productsList[p].sku[pl].mycart)
                                    if (!productsList[p].sku[pl].mycart) {
                                        productsList[p].sku[pl].mycart = 0;
                                    }
                                }
                                if (p == productsList.length - 1) {
                                    data.products = productsList;
                                    console.log("completedvmcichesuko")
                                    completed(null, data);
                                }
                            }

                        }
                    }

                };

                if (skuids == '') {
                    var count = 0;
                    productsSkuDAO.getProductSkuByProductId(product_ids, function (err, sku_data) {
                        if (!err) {
                            getImages(sku_data)
                        }
                    })
                    function getImages(sku_data) {
                        var sku_ids = [];

                        for (var sks in sku_data) {
                            sku_ids.push(sku_data[sks].skid)
                        }
                        getImagesBySkuIDs(sku_ids, sku_data);


                    }
                    function getImagesBySkuIDs(sku_ids, sku_data) {
                        productsSkuDAO.getSKUImages(sku_ids, (err, imagesRes) => {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                for (k in sku_data) {
                                    sku_data[k].skuImages = [];
                                    for (imgs in imagesRes) {
                                        if (sku_data[k].skid == imagesRes[imgs].sku_id) {
                                            sku_data[k].skuImages.push(imagesRes[imgs].sku_image)
                                        }
                                    }
                                }
                                getQunatity(sku_data, sku_ids);
                            }
                        })
                    }
                    function getQunatity(sku_data, sku_ids) {
                        for (var q in sku_data) {
                            productsDAO.getQuantityBySkuId(sku_data[q].skid, sku_data[q].product_id, user_id, session_id, (err, response) => {
                                if (!err) {
                                    if (response.length > 0) {
                                        console.log("get quantity...", response[0])
                                        quantity.push(response[0])
                                    }
                                }

                            })
                            // if(q==sku_data.length-1){
                            //     console.log("quantity..aksdlg..",quantity)
                            //     pushSkuData(sku_data, quantity)
                            // }
                        }
                        setTimeout(() => {
                            pushSkuData(sku_data, quantity)
                        }, 2000);
                    }

                }
                else {
                    var reqParamsObj = { product_id: product_ids, sku_ids: skuids };
                    productsSkuDAO.getProductSkuByProductIdAndSkuId(reqParamsObj, function (err, sku_data) {
                        if (!err) {
                            pushSkuData(sku_data, quantity);
                        }
                    });
                }
            },
            function (completed) {
                productSpecificationDAO.getProductSpecificationsByProductId(product_ids, function (err, specs_data) {
                    if (!err) {
                        if (specs_data.length > 0) {
                            for (var j in specs_data) {
                                for (var i in productsList) {
                                    if (productsList[i].id == specs_data[j].product_id) {
                                        productsList[i].specs.push(specs_data[j]);
                                    }
                                }
                            }
                        }
                    }
                    data.products = productsList;
                    completed(null, data);
                });
            },
            function (completed) {
                productImagesDAO.getProductImagesByProductId(product_ids, function (err, images_data) {
                    if (!err) {
                        if (images_data.length > 0) {
                            for (var j in images_data) {
                                for (var i in productsList) {
                                    if (productsList[i].id == images_data[j].product_id) {
                                        productsList[i].pic.push(images_data[j]);
                                    }
                                }
                            }
                        }
                    }
                    data.products = productsList;
                    completed(null, data);
                });
            },

        ], function (err, results) {
            done(data);
        });
    },
    getProductsWithDetail: function (user_id, session_id, done) {
        console.log("getProductsWithDetail...", user_id)
        var this_ = (this); var limit = 30;
        this_.getAllProducts(limit, function (data) {
            if (data.status === 200) {
                var productsList = data.products;
                var product_id_arr = [];
                for (var i in productsList) {
                    product_id_arr.push(productsList[i].id);
                    productsList[i].sku = [];
                    productsList[i].specs = [];
                    productsList[i].pic = [];
                }
                var product_ids = product_id_arr.join(',');
                console.log("dhukanteja", product_ids)
                this_.getProductDetailsWithDetail(user_id, session_id, productsList, product_ids, {}, function (resData) {
                    data.products = resData.products;
                    done(data)

                });
            } else {
                done(data);
            }
        });
    },
    getProductById: function (reqObj, user_id, session_id, done) {
        var this_ = (this);
        console.log(user_id, session_id, reqObj)
        productsDAO.getProductById(reqObj, function (err, product_data) {
            if (err) {
                done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" + err });
            } else {
                if (product_data.length > 0) {
                    var productsList = product_data; var product_id_arr = [];
                    for (var i in productsList) {
                        product_id_arr.push(productsList[i].id);
                        productsList[i].sku = [];
                        productsList[i].specs = [];
                        productsList[i].pic = [];
                    }
                    var product_ids = product_id_arr.join(',');
                    this_.getProductDetailsWithDetail(user_id, session_id, productsList, product_ids, {}, function (resData) {
                        productsList = resData.products;
                        done({ "status": 200, "err_field": "", "message": "Success", "products": productsList });
                    });
                } else {
                    done({ "status": 400, "err_field": "", "message": "No records found" });
                }
            }
        });
    },

    getproductgetid: function (reqObj, done) {
        //console.log(reqObj)
        productsDAO.getProductById(reqObj, function (err, responce) {

            //console.log(responce)
            if (err) {
                done({ "status": 400, "err_field": "", "message": "No records found" });
            }
            else {
                // done({result:responce})
                //var count=0;
                //for(let i=0;i<responce.length;i++){
                var img = []

                productsDAO.getProductImages(responce[0].id, (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {
                        //console.log(data)

                        //   count++;
                        for (i = 0; i < data.length; i++) {
                            img.push(data[i]);

                        }
                        //console.log(img)
                        responce[0].myImages = img;
                        //console.log("hdbfnfdafna", responce.myImages)

                        //   if(i==data.length-1){
                        //     console.log(img)
                        //     responce.myImages=img;

                        //     //console.log( responce[i])
                        // }

                        //if(responce.length==count){
                        // console.log()
                        done({ "status": 200, result: responce })
                        //}
                    }
                })
                //console.log(count)


                // }

            }




            // if (err) {
            //     console.log(err)
            //     done({ "status": 400, "err_field": "", "message": "", "products": "something went to wrong" });
            // } else {
            //     console.log(data)
            //     done({ "status": 200, "err_field": "", "message": "Success", "products": data });
            // }



        })


    },
    getProductsBySubcategoryId: function (reqObj, done) {
        var this_ = (this);
        productsDAO.getSubCategoryProducts(reqObj, function (err, product_data) {
            if (err) {
                console.log(err);
                done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" });
            } else {
                if (product_data.length > 0) {
                    var productsList = product_data; var product_id_arr = [];
                    for (var i in productsList) {
                        product_id_arr.push(productsList[i].id);
                        delete productsList[i]['sku'];
                        productsList[i].sku = [];
                        productsList[i].specs = [];
                        productsList[i].pic = [];
                    }
                    var product_ids = product_id_arr.join(',');
                    this_.getProductDetailsWithDetail(productsList, product_ids, {}, function (resData) {
                        productsList = resData.products;

                        if (reqObj.sortType == 'plh' || reqObj.sortType == 'phl') {
                            productsList = formSKUWiceProducts({ productsList: productsList });
                        }

                        done({ "status": 200, "err_field": "", "message": "Success", "products": productsList });
                    });
                } else {
                    done({ "status": 400, "err_field": "", "message": "No records found" });
                }
            }
        });
    },
    getRefineProductsBySubcategoryId: function (reqObj, done) {
        var this_ = (this);
        productsDAO.getRefineProductsBySubcategoryId(reqObj, function (err, product_data) {
            if (err) {
                console.log(err);
                done({ "status": 400, "err_field": "", "message": "something wentwrong please try agin" });
            } else {
                if (product_data.length > 0) {
                    var productsList = product_data; var product_id_arr = []; var skid_arr = [];
                    for (var i in productsList) {
                        product_id_arr.push(productsList[i].id);
                        skid_arr.push(productsList[i].skid);
                        delete productsList[i]['sku'];
                        productsList[i].sku = [];
                        productsList[i].specs = [];
                        productsList[i].pic = [];
                    }
                    var product_ids = product_id_arr.join(',');
                    var skuids = skid_arr.join(',');
                    this_.getProductDetailsWithDetail(productsList, product_ids, { skuids: skuids }, function (resData) {
                        productsList = resData.products;
                        productsList = formSKUWiceProducts({ productsList: productsList });
                        done({ "status": 200, "err_field": "", "message": "Success", "products": productsList });
                    });
                } else {
                    done({ "status": 400, "err_field": "", "message": "No records found" });
                }
            }
        });
    },
    checkIsCartProducts: function (request, OtherParameters, done) {
        var products = OtherParameters.products;
        for (let i in products) {
            for (let j in products[i].sku) {
                products[i].sku[j].mycart = 0;
            }
        }
        common.check_token(request, function (decoded) {
            var user_id = '';
            if (decoded.status == 200) {
                user_id = decoded.decoded.u_id;
            } else {
                //user_id = user_data.session_id;
                user_id = request.headers.session_id;
            }
            var session_id = request.headers.session_id;
            if (common.gNUE(user_id) != '' || common.gNUE(session_id) != '') {

                cartDAO.getCartlistByUserSessionId(user_id, session_id, function (err, cart_data) {
                    if (!err) {
                        if (cart_data.length != 0) {
                            for (let i in products) {
                                for (let j in products[i].sku) {
                                    for (let k in cart_data) {
                                        if (products[i].id == cart_data[k].product_id &&
                                            products[i].sku[j].skid == cart_data[k].product_sku_id
                                        ) {
                                            products[i].sku[j].mycart = cart_data[k].quantity;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    done(products);
                });
            } else {
                done(products);
            }
        });
    },
    getpayment: function (done) {
        productsDAO.getpayment((err, response) => {
            if (err) {
                done({ "status": 400, "message": "something went wrong plesae try again" })
            } else {
                done({ "status": 200, "message": response })
            }

        })
    },

    getproductskubyid: function (data, done) {
        //console.log("dhukantext",data)
        productsDAO.getproductskubyid(data, (err, response) => {
            if (err) {
                done({ "status": 400, "message": "something went wrong plesae try again" })
            } else {
                var sku_id = [];
                for (i = 0; i < response.length; i++) {
                    sku_id.push(response[i].skid)
                    if (i == response.length - 1) {
                        productsSkuDAO.getSKUImages(sku_id, function (err, images) {
                            if (err) {
                                done({ "status": 400, "message": "something went wrong plesae try again" })
                            } else {
                                sendData(response, images)
                            }
                        })
                    }
                }
                function sendData(response, data) {
                    for (var j = 0; j < response.length; j++) {
                        response[j].sku_images = []
                        for (var k = 0; k < data.length; k++) {
                            if (response[j].skid == data[k].sku_id) {
                                response[j].sku_images.push(data[k])
                            }

                        }
                        if (j == response.length - 1) {
                            //console.log("dhukantext",response)
                            done({ "status": 200, "err_message": "", "result": response })
                        }
                    }
                }
            }

        })
    }
};

function formSKUWiceProducts(prodObj) {
    var productsList = prodObj.productsList;
    for (var i in productsList) {
        for (var j in productsList[i].sku) {
            if (productsList[i].sku[j].skid != productsList[i].skid) {
                productsList[i].sku.splice(j, 1);
            }
        }
    }

    var productsFinal = []; var finalProductIds = [];
    for (var i in productsList) {
        if (finalProductIds.indexOf(productsList[i].id) == -1) {
            productsFinal.push(productsList[i]);
            finalProductIds.push(productsList[i].id);
        } else {
            for (var j in productsFinal) {
                if (productsFinal[j].id == productsList[i].id) {
                    for (var k in productsList[i].sku) {
                        productsFinal[j].sku.push(productsList[i].sku[k]);
                    }
                }
            }
        }
    }
    for (var i in productsList) {
        delete productsList[i]['skid'];
    }
    return productsFinal;
}

module.exports = productsService;
