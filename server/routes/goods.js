var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/vue_xiaomi');

mongoose.connection.on("connected", function () {
  console.log("MongoDB connected success.")
});

mongoose.connection.on("error", function () {
  console.log("MongoDB connected fail.")
});

mongoose.connection.on("disconnected", function () {
  console.log("MongoDB connected disconnected.")
});

//查询商品列表数据
router.get("/list", function (req,res,next) {
  // 分页逻辑
  let page = parseInt(req.param("page"));
  let pageSize = parseInt(req.param("pageSize"));
  let priceLevel = req.param("priceLevel");
  let sort = req.param("sort");
  let skip = (page-1)*pageSize;
  var priceGt = '',priceLte = '';
  let params = {};

  // 价格区间排序
  if(priceLevel!='all'){
    switch (priceLevel){
      case '0':priceGt = 10;priceLte=100;break;
      case '1':priceGt = 100;priceLte=500;break;
      case '2':priceGt = 500;priceLte=1000;break;
      case '3':priceGt = 1000;priceLte=5000;break;
    }
    params = {
      salePrice:{
          $gt:priceGt,
          $lte:priceLte
      }
    }
  }
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec(function (err,doc) {
      if(err){
          res.json({
            status:'1',
            msg:err.message
          });
      }else{
          res.json({
              status:'0',
              msg:'',
              result:{
                  count:doc.length,
                  list:doc
              }
          });
      }
  })
});

//具体商品查询

router.post("/searchProduct",function(req,res,next){
    var obj = req.body.params;
    console.log(obj);
    var productId = obj.productId;
    Goods.findOne({productId:productId}, function(err,doc){
              if(err){
                res.json({
                  status:"10001",
                  mes:'查询失败'
                });
              }else{
                if(doc){
                  console.log(doc);
                  res.json({
                    status:"10000",
                    mes:'查询成功',
                    result:doc
                  });
                }else{
                  res.json({
                    status:"10002",
                    mes:'未找到该商品'
                  });
                }
              }
    });
});

//查询当前商品用户评论

router.post("/getUsermes", function(req,res,next) {
        var obj = req.body.params;
        console.log(obj);
        var productId = obj.productId;
        Goods.findOne({productId:productId}, function(err,Userdoc){
                if(err){
                  res.json({
                    status:"10001",
                    mes:"查询失败"
                  });
                }else{
                    if(Userdoc){
                      res.json({
                        status:"10000",
                        mes:'查询成功',
                        res:Userdoc.user_mes
                      });
                    }else{
                      res.json({
                        status:"10002",
                        mes:" 暂无评论"
                      });
                    }
                }
        });
})

//加入到购物车
router.post("/addCart", function (req,res,next) {
  var userName = req.cookies.userName;
  var productId = req.body.productId;
  var User = require('../models/user');

  User.findOne({userName:userName}, function (err,userDoc) {
    if(err){
        res.json({
            status:"1",
            msg:err.message
        })
    }else{
      console.log("userDoc:"+userDoc);
      if(userDoc){
        var goodsItem = '';

        // 重复添加，则数量加 1
        userDoc.cartList.forEach(function (item) {
            if(item.productId == productId){
              goodsItem = item;
              item.productNum ++;
            }
        });

        if(goodsItem){
          userDoc.save(function (err2,doc2) {
            if(err2){
              res.json({
                status:"1",
                msg:err2.message
              })
            }else{
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              })
            }
          })
        }else{
          Goods.findOne({productId:productId}, function (err1,doc) {
            if(err1){
              res.json({
                status:"1",
                msg:err1.message
              })
            }else{
              if(doc){
                doc.productNum = 1;
                doc.checked = 1;
                userDoc.cartList.push(doc);
                userDoc.save(function (err2,doc2) {
                  if(err2){
                    res.json({
                      status:"1",
                      msg:err2.message
                    })
                  }else{
                    res.json({
                      status:'0',
                      msg:'',
                      result:'suc'
                    })
                  }
                })
              }
            }
          });
        }
      }
    }
  })
});

module.exports = router;
