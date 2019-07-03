const express  = require('express');
const router = express.Router();
const Product =  require('../model/product');
const Category =  require('../model/category');
const fs = require('fs-extra');


router.get('/' ,(req, res)=>{
    Product.find((err,products)=>{
        if(err)console.log(err);
  
            res.render('all_products',{
                title:'All Products',
                products:products
            })
    })
})

// ______________________________


router.get('/:category' ,(req, res)=>{
    var categorySlug = req.params.category;
    Category.findOne({slug:categorySlug},(err,c)=>{
        if(err)console.log(err);
        Product.find({category:categorySlug},(err,products)=>{
            if(err)console.log(err);
        
                res.render('cat_products',{
                    title:c.title,
                    products:products
                })
        })
    })
})


router.get('/:category/:product' ,(req, res)=>{
    var galleryImages = null;
    Product.findOne({slug:req.params.product},(err,product)=>{
        if(err) {console.log(err)}
        else{
            var galleryDir = 'public/product_images/' + product._id + '/gallery';
            fs.readdir(galleryDir, (err,files)=>{
                if(err) {console.log(err)}
                else{
                    galleryImages = files;

                    res.render('product', {
                        title:product.title,
                        p:product,
                        galleryImages:galleryImages
                    })
                }
            })
        }
    })
    
})









module.exports = router;

