const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err =>{
    console.log(err);
  })
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId).then(product=>{
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  }).catch(err => console.log(err));
    
};

exports.getIndex = (req, res, next) => {
  Product.findAll({}).then(products =>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(err =>{
    console.log(err);
  });
  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     res.render('shop/index', {
  //       prods: rows,
  //       pageTitle: 'Shop',
  //       path: '/'
  //     });
  //   })
  //   .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then( cart =>{
    return cart
    .getProducts()
    .then(products =>{
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    }).catch(err => console.log(err));

  })
  .catch(err => console.log(err))
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  req.user
  .getCart()
  .then(cart =>{
    //Cart속성중 product 객체 반환
    fetchedCart = cart
    return cart.getProducts({where: {id: prodId}});
  })
  .then(async (products) =>{
    let newQuantity = 1;
    //products 중 첫번째 요소 반환
    //product가 하나도 없을시 undefined
    let product;
    if(products.length > 0){
      product = products[0];
    }

    //경우1 Cart에서 해당제품 수량 추가 
    if(product){
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
    }

    //경우2 Cart에 최초로 Product 추가 
    //Cart에는 없지만, DB에는 정보가 있을것이다.
    product = await Product.findByPk(prodId)

    //경우1,2에서 찾은 product를 cart에 추가한다.
    return fetchedCart.addProduct(product, { through: {quantity:newQuantity} }); 
  })
  .then(()=>{
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  
  const cart = await req.user.getCart();
  const [product] = await cart.getProducts({where:{id:prodId}});

  //Product있는 데이터를 제거하는 것이 아니라 
  //CartItem에있는 데이터를 제거 
  await product.cartItem.destroy();
  res.redirect('/cart');
};

exports.postOrder = async (req, res, next) => {
  const cart = await req.user.getCart();
  const products = await cart.getProducts();
  const order = await req.user.createOrder();
  const result = await order.addProducts( products.map(product => {
    product.orderItem = { quantity: product.cartItem.quantity };
    return product
  }));
  console.log(result);
  res.redirect('/orders');
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
