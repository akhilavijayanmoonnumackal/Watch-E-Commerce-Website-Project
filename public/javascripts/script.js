
// function addToCart(proId) {
//     console.log("api calll")
//     $.ajax({
//         url: '/addToCart/' + proId,
//         method: 'get',
//         success: (response) => {
//             console.log(response);
//             console.log(response.message);
//             console.log("came")
//             if (response.message === "guest") {
//                 console.log("api here!!!");
//                 // if(response.message==="guest"){
//                     // let count = $('#cart-count').html();
//                     // count = parseInt(count) + 1
//                     $("#cart-count").load(window.location.href + " #cart-count");
//                     // $('#cart-count').html(count);
//                     Toastify({
//                         text: 'Product added to cart!',
//                         duration: 3000,
//                         gravity: 'bottom',
//                         position: 'center',
//                         backgroundColor: "linear-gradient(#e66465, #9198e5)",
//                         stopOnFocus: true,
//                         // Add an icon to the notification
//                         className: "toastify-icon",
//                         close: false,
//                         // onClick: function () {
//                         //     console.log("apiCall");
//                         // }
//                     }).showToast();
    
//                 // }else{
//                 //     //location.href = '/login'
//                 //     console.log(response)
//                 //     console.log(response.status)
//                 //     console.log(response.message)
//                 // }
//             }else{
//                 location.href = '/login'
//             }
//         },
//         error: (xhr, status, error) => {
//             console.error(error);
//             // handle the error here
//         }
//     })
// }


// $('.js-addcart-btn').on('click', (e) => {
//     console.log("working")
//     e.preventDefault();
//     const el = document.querySelector('#addToCart');
//     const clickedBtn = $(this);
//     const productId = el.dataset.product;
//     console.log(productId);
//     addToCart(productId);
// });
