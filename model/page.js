const mongoose =  require('mongoose');
const express =  require('express');

let pageSchema = mongoose.Schema({
    title:{type:String, required:true},
    slug:{type:String, required:true},
    content:{type:String, required:true},
    sorting:{type:String, required:true}
})

let page = module.exports = mongoose.model('page', pageSchema);