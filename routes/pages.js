const express  = require('express');
const router = express.Router();
const Page =  require('../model/page')


router.get('/' ,(req, res)=>{
    Page.findOne({slug:'home'},(err,page)=>{
        if(err)console.log(err);
  
                res.render('index',{
                    title:page.title,
                    content:page.content
                })
    })
})


router.get('/:slug' ,(req, res)=>{
    var slug = req.params.slug;
    Page.findOne({slug:slug},(err,page)=>{
        if(err)console.log(err);
        if(!page){
            res.redirect('/')
        }else{
            
                res.render('index',{
                    title:page.title,
                    content:page.content
                })
            
           
        }
    })
    
})





module.exports = router;