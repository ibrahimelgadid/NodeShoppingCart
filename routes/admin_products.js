const express  = require('express');
const router = express.Router();
const expressValidator =  require('express-validator');
const Product = require('../model/product');
const Category = require('../model/category')
const flash = require('connect-flash');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;
/*
 * GET PRODUCT
*/

router.get('/', isAdmin,(req,res)=>{
    var count;
    Product.count(function (err,c) {
        count = c;
    })

    Product.find((err,products)=>{
        if (err) {
            throw err
        }
        res.render('admin/products',{
            products:products,
            count:count

        })
    })
})

/*
 * GET ADD PAGE
*/
router.get('/add_product' ,isAdmin,(req, res)=>{
    let title = '';
    let desc = '';
    let price = '';
    Category.find((err,categories)=>{
        res.render('admin/add_product',{
            title,desc,price,categories
        })
    })
})


/*
 * POST ADD PRODUCT
*/
router.post('/add_product' ,(req, res)=>{
   
    var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name:"";

    req.checkBody('title', 'Title value must be not empty').notEmpty();
    req.checkBody('desc', 'Desc value must be not empty').notEmpty();
    req.checkBody('price', 'Price value must be not empty').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g,'-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;


    var errors = req.validationErrors();
    if (errors) {
        Category.find((err,categories)=>{
            res.render('admin/add_product',{
                errors:errors,
                title,desc,price,categories

            })
        })
        }
    else{
        Product.findOne({slug:slug}, (err,product)=>{
            if(product){
                req.flash('danger', 'This product is already exist, please choose another name');
                Category.find((err,categories)=>{
                    res.render('admin/add_product',{
                        title,desc,price,categories
        
                    })
                })
            }
            else{
                let price2 = parseFloat(price).toFixed(2);
                let newProduct= new Product({
                    title:title,
                    slug:slug,
                    desc:desc,
                    price:price2,
                    image:imageFile,
                    category:category
                });
                newProduct.save((err,product)=>{
                    if (err) throw err;

                    mkdirp('public/product_images/'+ product._id,(err)=>{
                        if(err)throw err;
                    })

                    mkdirp('public/product_images/'+product._id + '/gallery',(err)=>{
                        if(err)throw err;
                    })

                    mkdirp('public/product_images/'+product._id + '/gallery/thumbs',(err)=>{
                        if(err)throw err;
                    })

                    if(imageFile != ""){
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id +  '/'+imageFile;
                        productImage.mv(path,(err)=>{
                            if (err) throw err;
                        })
                    }

                    req.flash('success', 'New product added successfully');
                    res.redirect('/admin/products')
                })
            }
        })
    }

})


/*
 * GET EDIT PRODUCT
*/
router.get('/edit_product/:id' ,isAdmin,(req, res)=>{
    
    var errors;
    if(req.session.errors) 
        errors = req.session.errors;
    req.session.errors = null;

    Category.find((err,categories)=>{
        Product.findById({_id:req.params.id}, (err, p)=>{
            if(err){
                throw err;
                res.redirect('/admin/products');
            }else{
                var galleryDir = 'public/product_images/'+p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir,(err,files)=>{
                    if(err){throw err}
                    else{
                        galleryImages  = files;
                        res.render('admin/edit_product',{
                            errors:errors,
                            title:p.title,
                            desc:p.desc,
                            price:parseFloat(p.price).toFixed(2),
                            category:p.category.replace(/\s+/, '-').toLowerCase(),
                            categories:categories,
                            image:p.image,
                            galleryImages:galleryImages,
                            id:p._id
                        })
                    }
                })
            }
        
            
        })
       
    })
     
})



// POST EDIT PRODUCT
router.post('/edit_product/:id' ,(req, res)=>{
   
    var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name:"";

    req.checkBody('title', 'Title value must be not empty').notEmpty();
    req.checkBody('desc', 'Desc value must be not empty').notEmpty();
    req.checkBody('price', 'Price value must be not empty').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g,'-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id  =req.params.id

    var errors = req.validationErrors();
    
    if(errors){ 
        req.session.errors=errors;
        res.redirect('/admin/products/edit_product/' + id)
    }else{
        Product.findOne({slug:slug, id:{'$ne':id}},(err,p)=>{
            if(err) console.log(err);
            if(p){
                req.flash('danger', 'Product is already exist');
                res.redirect('/admin/products/edit_product/' + id)
            }else{
                Product.findById(id, (err,p)=>{
                    if(err) console.log(err);
                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if(imageFile != ''){
                        p.image = imageFile
                    }

                    p.save((err)=>{
                        if(err) console.log(err);
                        if(imageFile != ""){
                            if (pimage != ''){
                                fs.remove('public/product_images/'+id+'/'+pimage,(err)=>{
                                    if(err)console.log(err);
                                })
                            }
                            var productImage = req.files.image;
                            var path = 'public/product_images/'+id + '/'+imageFile;
                            productImage.mv(path, (err)=>{
                                if(err) console.log(err)
                            })
                        }

                        req.flash('success', 'Product updated successfully');
                        res.redirect('/admin/products/edit_product/'+id)
                    })
                })
            }
        })
    }
})


router.post('/product_gallery/:id',(req,res)=>{
    console.log(req.files)
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/'+id+'/gallery'+'/'+req.files.file.name;
    var thumbsPath = 'public/product_images/'+id+'/gallery/thumbs'+'/'+req.files.file.name;

    productImage.mv(path,(err)=>{
        if(err) console.log(err);
        res.sendStatus(200)

        resizeImg(fs.readFileSync(path), {width:100, height:100}).then((buf)=>{
            fs.writeFileSync(thumbsPath,buf)
        })
    })
})



router.get('/delete_image/:image',isAdmin,(req,res)=>{
    var originalImage = 'public/product_images/'+req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/'+req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, (err)=>{
        if(err) {console.log(err);}
        else{
            fs.remove(thumbImage,(err)=>{
                if(err){console.log(err)}
                else{
                    req.flash('success', 'Image deleted');
                    res.redirect('/admin/products/edit_product/' + req.query.id)
                }
            })
           
        }

    })
})

router.get('/delete_product/:id',isAdmin,(req,res)=>{
    var id = req.params.id;
    var path = 'public/product_images/'+id;
    fs.remove(path,(err)=>{
        if(err) {throw err}
        else{
            Product.findByIdAndRemove(id,(err)=>{
                if(err) console.log(err)
                req.flash('success', 'Product deleted successfully');
                res.redirect('/admin/products')
            })
        }
    })
})

module.exports = router;