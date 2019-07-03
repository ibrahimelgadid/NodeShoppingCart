$(function () {
    if($('textarea').length){
        CKEDITOR.replace('ta')
    }

    $('.confirmDeletion'). click(function () {
        if(!confirm('are you sure to delete')) return false;

    })

    if($('[data-fancybox]').length){
        $('[data-fancybox]').fancybox()
    }
})