const express  = require('express');
const router = express.Router();
const expressValidator =  require('express-validator');
const Page = require('../model/page')
const flash = require('connect-flash');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

/*
 * GET PAGES
*/

router.get('/',isAdmin, (req,res)=>{
    Page.find({}).sort({sorting:1}).exec((err,pages)=>{
        if(err){throw err}
        else{
            res.render('admin/pages',{
                pages:pages
            })
        }
    })
})

/*
 * GET ADD PAGE
*/
router.get('/add_page' ,isAdmin,(req, res)=>{
    let title = '';
    let slug = '';
    let content = '';
    res.render('admin/add_page',{
        title,slug,content
    })
})


/*
 * POST ADD PAGE
*/
router.post('/add_page' ,(req, res)=>{
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if(slug == "") {slug = title.replace(/\s+/g,'-').toLowerCase();}
    var content = req.body.content
    req.checkBody('title', 'Title value must be not empty').notEmpty();
    req.checkBody('content', 'Content value must be not empty').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('admin/add_page',{
            errors:errors,
            title:title,
            slug:slug,
            content:content,
            
        })
        }
    else{
        Page.findOne({slug:slug}, (err,page)=>{
            if(page){
                req.flash('danger', 'This page is already exist, please choose another name');
                res.render('admin/add_page',{
                    title:title,
                    slug:slug,
                    content:content
                })
            }
            else{
                let newPage= new Page({
                    title:title,
                    slug:slug,
                    content:content,
                    sorting:0
                });
                newPage.save((err)=>{
                    if (err) throw err;
                    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });
                    req.flash('success', 'New page added successfully');
                    res.redirect('/admin/pages')
                })
            }
        })
    }

})



// Sort pages function
function sortPages(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err);
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);

    }
}

/*
 * POST reorder pages
 */
router.post('/reorder_pages',function (req, res) {
    var ids = req.body['id[]'];

    sortPages(ids, function () {
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    });

});


/*
 * GET EDIT PAGE
*/
router.get('/edit_page/:id' ,isAdmin,(req, res)=>{
    const id = req.params.id;
   Page.findById(id,(err,page)=>{
       if(err) throw err;

    
       res.render('admin/edit_page',{
        title : page.title,
        slug : page.slug,
        content : page.content,
        id : page._id,
 
       })
   })
})

/*
 * POST  EDIT PAGE
*/
router.post('/edit_page/:id' ,(req, res)=>{
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if(slug == "") {slug = title.replace(/\s+/g,'-').toLowerCase();}
    var content = req.body.content;
    var id = req.params.id
    req.checkBody('title', 'Title value must be not empty').notEmpty();
    req.checkBody('content', 'Content value must be not empty').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('admin/edit_page',{
            errors:errors,
            title:title,
            slug:slug,
            content:content,
            id:id
        })
        }
    else{
        Page.findOne({slug:slug, _id:{'$ne':id} }, (err,page)=>{
            if(page){
                req.flash('danger', 'This page is already exist, please choose another name');
                res.render('admin/edit_page',{
                    title:title,
                    slug:slug,
                    content:content,
                    id:id
                })
            }
            else{
                Page.findByIdAndUpdate({_id:req.params.id},{
                    title,slug,content},(err,page)=>{
                   if(err) throw err;
                    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });     
                   req.flash('success', 'Page Updated Successfully')

                    res.redirect('/admin/pages')
                })
            }
        })
    }

})




router.get('/delete_page/:id',isAdmin,(req,res)=>{
    
    Page.findByIdAndRemove({_id:req.params.id}, (err,done)=>{
        if(err) throw err;
            Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                if (err) {
                    console.log(err);
                } else {
                    req.app.locals.pages = pages;
                }
            });
        req.flash('success','Page deleted successfully')
        res.redirect('/admin/pages')
    })
})

module.exports = router;