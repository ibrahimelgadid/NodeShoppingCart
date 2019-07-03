const mongoose =  require('mongoose');
const express =  require('express');

let categorySchema = mongoose.Schema({
    title:{type:String, required:true},
    slug:{type:String, required:true}
})

let Category = module.exports = mongoose.model('Category', categorySchema);