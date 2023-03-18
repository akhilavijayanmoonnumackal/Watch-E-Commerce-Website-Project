//const { response } = require("../../app");

const { response } = require("../../app");

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
    $.ajax({
        url: '/addToCart/' + proId,
        method: 'get',
        success: (response) => {
            console.log(response);
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $('#cart-count').html(count)
            }
            alert(response)
        }
    })
}


    function changeQuantity(event,cartId, proId, userId, count) {
        event.preventDefault();
        let quantity = parseInt(document.getElementById(proId).innerHTML)
        count = parseInt(count)
        console.log(userId)
        $.ajax({
            url: '/change-product-quantity',
            data: {
                user: userId,
                cart: cartId,
                product: proId,
                count: count,
                quantity: quantity
            },
            method: 'post',
            success: (response) => {
                console.log("response :" + response);
                if (response.removeCartProduct) {
                    //document.getElementById('total')
                    alert('Product removed from your cart');
                    location.reload()
                } else {
                    console.log(response);
                    document.getElementById(proId).innerHTML = quantity + count
                    document.getElementById('total').innerHTML = response.total;
                }
            }
        })
    }
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

    function removeCartProduct(proId,cartId,name){
        var check=confirm("Do you want to remove "+name+" from cart?")
        if(check){
            $.ajax({
                url:'/remove-cart-product',
                data:{
                    product:proId,
                    cart:cartId
                },
                method:'post',
                success:(response)=>{
                    $(proId).remove()
                    let msg=name+" removed"
                    $('#delete-msg').html(msg)
                    location.reload()
                }
            })
        }
    }
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