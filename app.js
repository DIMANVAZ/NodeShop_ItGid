let express = require('express');
let exP = express();
const fs = require("fs");

/* запуск сервера */
const port = 3000;
exP.listen(port);

/* задаём папку со статикой */
exP.use(express.static('public'));

/* задаём метод чтения ответа ?!?!?! а-ля body parser */
exP.use(express.json());

/* задаём шаблонизатор */
exP.set('view engine','pug');

/* my Sql */
const mysql2 = require('mysql2');
//const mysql = require('mysql'); - выдаёт эррор 1251 Client does not support authentication protocol
const conn = mysql2.createConnection({
    host:"localhost",
    user:"root",
    password:"root",
    database:"market"
});

exP.get("/",function (req,res){
    let cat = new Promise(function (resolve, reject) {
        conn.query(
            "select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 3",
            function (error, result, field) {
                if (error) return reject(error);
                resolve(result);
            }
        );
    });
    let catDescription = new Promise(function (resolve, reject) {
        conn.query(
            "SELECT * FROM category",
            function (error, result, field) {
                if (error) return reject(error);
                resolve(result);
            }
        );
    });
    Promise.all([cat, catDescription]).then(function (value) {
        console.log(value[1]);
        res.render('shop', {
            goods: JSON.parse(JSON.stringify(value[0])),
            cat: JSON.parse(JSON.stringify(value[1])),
        });
    });
});

exP.get("/cat",function (request,response){
    let id = request.query.id || 1;

    let cat = new Promise((resolve,reject)=>{
        conn.query("SELECT * FROM category WHERE id="+id, function (err,queryResult){
            if(err){
                reject(err)
            }
            resolve(queryResult)
        })
    });

    let goodsByCat = new Promise((resolve,reject)=>{
        conn.query("SELECT * FROM goods WHERE category="+id, function (err,queryResult){
            if(err){
                reject(err)
            }
            resolve(queryResult)
        })
    });

    Promise.all([cat, goodsByCat]).then(resultArray =>{
        response.render('cat',{
            categ:resultArray[0],
            goodsByCateg:resultArray[1]
        })
    })
});

exP.get('/item',function(request,response){
    let id = request.query.id || 1;
    conn.query("SELECT * FROM goods WHERE id="+id, function (err,result, fields) {
        if(err) throw err
        console.log('result from axp get item',result);
        response.render('item',{
            item: JSON.parse(JSON.stringify(result)),
        })
    })
})

exP.post('/get-category-list',(request, response)=>{
    conn.query("SELECT id,category FROM category", (err,result,fields)=>{
        if (err) throw err;
        response.json(result)
    })
})

exP.post('/get-goods-info',(request, response)=>{
    let reqKeysArray = request.body.key; // ['4','5']
    if (reqKeysArray.length !== 0){
        let keysString = reqKeysArray.join(',')// 4,5
        conn.query('SELECT id,name,cost FROM goods WHERE id IN ('+keysString+')', function (error, result, fields) {
            if (error) throw error;
            // result - это неудобный массив: [ { id: 4,name, cost},{ id: 7,name, cost}]
            let goods = {};
            result.forEach((elem, index)=>{
                goods[elem.id] = elem;
            });
            // goods - это удобный (индексированный) массив: [ 4:{ id: 4,name, cost},7:{ id: 7,name, cost}]
            response.json(goods);
        });
    }
    else response.send('0')

})







