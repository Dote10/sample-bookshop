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
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find(
          prod => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  req.user
  .getCart()
  .then(cart =>{
    //Cart속성중 product 객체 반환
    fetchedCart = cart
    return cart.getProduct({where: {id: prodId}});
  })
  .then(products =>{
    //products 중 첫번째 요소 반환
    //product가 하나도 없을시 undefined
    let product;
    if(products.length > 0){
      product = products[0];
    }

    //경우1 Cart에서 해당제품 수량 추가 
    let newQuantity = 1;
    if(product){
      //..
    }

    //경우2 Cart에 최초로 Product 추가 
    //Cart에는 없지만, DB에는 정보가 있을것이다.
    return Product.findByPk(prodId)
    .then(product =>{
      //cartProduct()는 시퀄라이즈에 의해 추가된
      //다대다 관계 메서드 중에 하나이다.
      //아래 코드에서는 전역변수가된 fetchedCart에
      //검색한 상품은 추가하는 역할을 한다.
      return fetchedCart.addProduct(); 
    }).catch(err => console.log(err))

  })
  .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  });
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
