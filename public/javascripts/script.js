//const { response } = require("../../app");

// const { response } = require("../../app");

// function addToCart(proId) {
//     $.ajax({
//         url: '/add-to-cart/'+proId,
//         method: 'get',
//         success: (response) => {
//             console.log(response);
//             if(response.status) {
//                 let count = $('#cart-count').html()
//                 count = parseInt(count)+1
//                 $('#cart-count').html(count)
//             }
//             alert(response)
//         }
//     })
// }

function addToCart(proId) {
    console.log("api calll")
    $.ajax({
        url: '/addToCart/' + proId,
        method: 'get',
        success: (response) => {
            console.log(response);
            if (response.status) {
                let count = $('#cart-count').html();
                count = parseInt(count) + 1
                $("#cart-count").load(window.location.href + " #cart-count");
                $('#cart-count').html(count)
            }
            //alert(response)
        }
    })
}


$('.js-addcart-btn').on('click', (e) => {
    e.preventDefault();
    const el = document.querySelector('#addToCart');
    const clickedBtn = $(this);
    const productId = el.dataset.product;

    $.get('/addToCart', { productId }, (response) => {
        console.log(response);
        if (response.status) {
            swal(nameProduct, "is added to cart!", "success");
            clickedBtn.addClass('js-addedcart').off('click');
            $('#cart-count').html(count);
            location.reload();
        } else {
            swal("Error", response.message, "error");
        }
    });
});
// function addToCart(proId) {
//     $.get('/addToCart/' + proId, function(response) {
//         console.log(response);
//         if (response.status) {
//             let count = $('#cart-count').html()
//             count = parseInt(count) + 1
//             $('#cart-count').html(count)
//         }
//         alert(response);
//         location.reload();
//     });
// }

// function removeProduct(proId, cartId, userId) {
//     var check = confirm("Do you want to remove " + name + " from cart?")
//     if (check) {
//         $.ajax({
//             url: '/remove-cart-product',
//             data: {
//                 product: proId,
//                 cart: cartId,
//                 userId: userId,

//             },
//             method: 'post',
//             success: (response) => {
//                 $(proId).remove()
//                 let msg = name + " removed"
//                 $('#delete-msg').html(msg)
//                 location.reload()
//                 console.log("removed");
//             }
//         })
//     }
// }



    
    // function removeCartProduct(proId,cartId, name) {
    //     let quantity = parseInt(document.getElementById(proId).innerHTML)
    //     count = parseInt(count)
    //     $.ajax({
    //         url: '/remove-cart-product',
    //         data : {
    //             user : userId,
    //             cart : cartId,
    //             product : proId,
    //             count : count,
    //             quantity: quantity
    //         },
    //         method : 'post',
    //         success : (response) => {
    //             if(response.removeCartProduct) {
    //                 alert("Product removed")
    //                 location.reload()
    //             }else{
    //                 document.getElementById(proId).innerHTML=quantity+count
    //                 document.getElementById('total').innerHTML=response.total;
    //             }
    //         }
    //     })
    // }

    
// function changeQuantity(cartId,proId,userId,count){
//     let quantity=parseInt(document.getElementById(proId).innerHTML)
//     count=parseInt(count)
//     console.log(userId)
//     $.ajax({
//         url:'/change-product-quantity',
//         data:{ 
//             user:userId,
//             cart:cartId,
//             product:proId,
//             count:count,
//             quantity:quantity
//         },
//         method:'post',
//         success:(response)=>{
//             if(response.removeProduct){
//                 alert("Product removed from cart")
//                 location.reload()
//             }else{     
//                 console.log(response)           
//                 document.getElementById(proId).innerHTML=quantity+count
//                 document.getElementById('total').innerHTML=response.total
//             }
//         }
//     })
// }


// function removeCartProduct(proId,cartId,Name){
//     var check=confirm("Do you want to remove "+Name+" from cart?")
//     if(check){
//         $.ajax({
//             url:'/remove-cart-product',
//             data:{
//                 product:proId,
//                 cart:cartId
//             },
//             method:'post',
//             success:(response)=>{
//                 $(proId).remove()
//                 let msg=Name+" removed"
//                 $('#delete-msg').html(msg)
//                 location.reload()
//             }
//         })
//     }
// }