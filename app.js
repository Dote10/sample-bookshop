const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require ('./models/product');
const User = require ('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item'); 

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    //이 미들워어에서 user를 조회한것을
    //seqlize catch~then에서 사용할수 있을까? -> X
    User.findByPk(1)
    .then(user =>{
        req.user = user;
        //다음 단계의 함수로의 전달의 위한 next()
        next();
    })
    .catch(err =>{
        console.log(err);
    })
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// 1:N
Product.belongsTo(User,{constraints: true, onDelete:'CASCADE'})
User.hasMany(Product);

// 1:1
User.hasOne(Cart);
Cart.belongsTo(User);

// N:M
Cart.belongsToMany(Product, {through : CartItem});
Product.belongsToMany(Cart, {through : CartItem});


sequelize
.sync()
//.sync({force:true})
.then(result => {
    //console.log(result);
    
    //인증 기능이 없으므로 최소한
    //user 1명이 존재하는지 확인
    return User.findAll({limit:1})
 
})
.then(user =>{
    // 최소한 하나의 user도 존재하지 않는 경우 
    if(user.length < 1){
        return User.create({name:'Max', email:'test@example.com'})
    }
    return user;
})
.then( user =>{
    //console.log(user);
    app.listen(6300);
})
.catch(err =>{
    console.error(err);
});

