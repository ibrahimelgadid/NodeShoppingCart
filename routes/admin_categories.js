const express  = require('express');
const router = express.Router();
const expressValidator =  require('express-validator');
const Page = require('../model/page');
const Category = require('../model/category');
const flash = require('connect-flash');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

/*
 * GET CATEGORIES
*/

router.get('/',isAdmin, (req,res)=>{
    Category.find({},(err,categories)=>{
        if (err) throw err;
        res.render('admin/categories',{
            categories:categories
        })
    })
})

/*
 * GET ADD CATEGORY
*/
router.get('/add_category',isAdmin ,(req, res)=>{
    let title = '';

    res.render('admin/add_category',{
        title
    })
})


/*
 * POST ADD CATEGORY
*/
router.post('/add_category',(req, res)=>{
    var title = req.body.title;
    var slug = title.replace(/\s+/g,'-').toLowerCase();
    
    req.checkBody('title', 'Title value must be not empty').notEmpty();
    

    var errors = req.validationErrors();
    if (errors) {
        res.render('admin/add_category',{
            errors:errors,
            title:title,
            slug:slug,
    
            
        })
        }
    else{
        Category.findOne({slug:slug}, (err,category)=>{
            if(category){
                req.flash('danger', 'This category is already exist, please choose another name');
                res.render('admin/add_category',{
                    title:title
                })
            }
            else{
                let newCategory= new Category({
                    title:title,
                    slug:slug,

                });
                newCategory.save((err)=>{
                    if (err) throw err;
                    Category.find({},(err,categories)=>{
                        if(err){throw err}
                        else{
                            req.app.locals.categories = categories;
                        }
                      })
                    req.flash('success', 'New category added successfully');
                    res.redirect('/admin/categories')
                })
            }
        })
    }

})


/*
 * GET EDIT CATEGORY
*/
router.get('/edit_category/:id',isAdmin ,(req, res)=>{
    const _id = req.params.id;
   Category.findById({_id:_id},(err,category)=>{
       if(err) throw err;
    
       let title = category.title;
       let id = category._id;

       res.render('admin/edit_category',{
           title,id
       })
   })
})

/*
 * POST  EDIT CATEGORY
*/
router.post('/edit_category/:id' ,(req, res)=>{
    var title = req.body.title;
    var slug = title.replace(/\s+/g,'-').toLowerCase();
    var id = req.params.id
    req.checkBody('title', 'Title value must be not empty').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('admin/edit_category',{
            errors:errors,
            title:title,
            id:id
        })
        }
    else{
        Category.findOne({slug:slug, _id:{'$ne':id} }, (err,category)=>{
            if(category){
                req.flash('danger', 'This category is already exist, please choose another name');
                res.render('admin/edit_category',{
                    title:title,
                    id:id
                })
            }
            else{
                Category.findByIdAndUpdate({_id:req.params.id},{
                    title},(err,category)=>{
                   if(err) throw err;
                   category.find({},(err,categories)=>{
                    if(err){throw err}
                    else{
                        req.app.locals.categories = categories;
                    }
                  })
                   req.flash('success', 'category Updated Successfully')

                    res.redirect('/admin/categories')
                })
            }
        })
    }

})



router.get('/delete_category/:id',isAdmin,(req,res)=>{
    
    Category.findByIdAndRemove({_id:req.params.id}, (err,done)=>{
        if(err) throw err;
        Category.find({},(err,categories)=>{
            if(err){throw err}
            else{
                req.app.locals.categories = categories;
            }
          })
        req.flash('success','Category deleted successfully')
        res.redirect('/admin/categories')
    })
})

module.exports = router;