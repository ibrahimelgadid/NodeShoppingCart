const express  = require('express');
const router = express.Router();
const Product=  require('../model/product');
const flash = require('connect-flash')
const whoBuy = require('../config/auth')




/*
 * GET add product to cart
 */
router.get('/add/:product',whoBuy.whoBuy, function (req, res) {

    var slug = req.params.product;

    Product.findOne({slug: slug}, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }

        console.log((req.session.cart));
        req.flash('success', 'Product added!');
        res.redirect('back');
    });

});


router.get('/checkout', (req,res)=>{
    
    res.render('checkout',{
        title:'checkout',
        cart:req.session.cart
    })
})


router.get('/update/:product', (req,res)=>{
   var cart =  req.session.cart ;
   var slug = req.params.product;
   var action = req.query.action;

   for (let i = 0; i < cart.length; i++) {
      if(cart[i].title == slug);

       switch (action) {
        case 'add':
            cart[i].qty++;
            break;
        
        case 'remove':
            cart[i].qty--;
            break;

        case 'clear':
            cart.splice(i,1);
            if(cart.length == 0) delete req.session.cart;
            
            break;
    
        default:
            console.log('problem')
            break;
    }
    break;

    
       
   }
  
   req.flash('success', 'Cart updated!');
   res.redirect('/cart/checkout');
})


router.get('/clear', (req,res)=>{
    delete req.session.cart;
    req.flash('success', 'Cart cleated!');
    res.redirect('/cart/checkout');
   

})





module.exports = router;