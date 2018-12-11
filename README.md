router.post('/updateproduct', async (req, res) => {
    if (req.body.id == "" || req.body.id == undefined || req.body.id == null) {
        res.status(400).json({ "message": " id is  require" })
    } else {
        let update_product = await productsService.updateproduct(req.body);
        if (update_product.status == 200) {
            let update_terms = await productsService.updateTerms(req.body.sku);
            if (update_terms.status == 200) {
                console.log(update_terms)
                let update_faq = await productsService.updateFAQ(req.body.sku);
                if (update_faq.status == 200) {
                    console.log(update_faq)
                    let update_sku = await productsService.updateSKU(req.body.sku, req.body.id);
                    if (update_sku.data.status == 200) {
                        console.log(update_sku);
                        let new_skus = await productsService.NewInsertSKU(update_sku);
                        console.log(new_skus)
                        let update_sku_imates = await productsService.updateSKUImages(req.body.sku, req.body.id);
                        res.send(update_sku_imates)
                    }
                    //res.json({ status: 200, err_message: "", message: "updated successfully" })
                }
            }
        }
    }
})
