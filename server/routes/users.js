var express = require('express');
var router = express.Router();
require('./../util/util')
var User = require('./../models/user');
var Goods = require('../models/goods');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/test', function(req, res, next) {
  res.send('test');
});

//登入接口
router.post("/login", function (req,res,next) {
  var param = {
      userName:req.body.userName,
      userPwd:req.body.userPwd
  }
  User.findOne(param, function (err,doc) {
      if(err){
          res.json({
              status:"1",
              msg:err.message
          });
      }else{
          if(doc){
              // res.cookie("userId",doc.userId,{
              //     path:'/',
              //     // cookie 周期，1小时
              //     maxAge:1000*60*60
              // });
              res.cookie("userName",doc.userName,{
                path:'/',
                maxAge:1000*60*60
              });
              //req.session.user = doc;
              res.json({
                  status:'0',
                  msg:'',
                  result:{
                      userName:doc.userName
                  }
              });
          } else {
            res.json({
                status:'1',
                msg:'账号密码错误',
                result:''
            });
          }
      }
  });
});

//注册接口
router.post("/regist", function (req,res,next) {
  var userName = req.body.userName,
      userpwd = req.body.userPwd

  User.findOne({userName:userName}, function (err,data){
      if(err){
        res.send({'status': 1002, 'message': '查询失败', 'data': err});
      }else{
        console.log('查询成功'+data)
            //data为返回的数据库中的有相同name的集合
            if(data !== null){
                res.send({'status': 1001, 'message': '该用户名已经注册！'});
            }else{
              let newName = new User({
                userName : userName,
                userPwd : userpwd
            });
            //newName.save 往数据库中插入数据
            newName.save((err,data) => {
                if (err) {
                    res.send({'status': 1002, 'message': '注册失败！', 'data': err});
                } else {
                    res.json({
                      status: 1000, 
                      message:'注册成功',
                      result:{
                      userName:data.userName
                      }
                });
                  //   res.cookie("userId",data.userId,{
                  //     path:'/',
                  //     // cookie 周期，1小时
                  //     maxAge:1000*60*60
                  // });
                  // res.cookie("userName",data.userName,{
                  //   path:'/',
                  //   maxAge:1000*60*60
                  // });
                }
               });
            }
      } 
  })
});

//登出接口
router.post("/logout", function (req,res,next) {
  // 清除 cookie
  res.cookie("userName","",{
    path:"/",
    maxAge:-1
  });
  res.json({
    status:"0",
    msg:'',
    result:0
  })
});

// 检查登录
router.get("/checkLogin", function (req,res,next) {
  if(req.cookies.userName){
      res.json({
        status:'0',
        msg:'',
        result:req.cookies.userName || ''
      });
  }else{
    res.json({
      status:'1',
      msg:'未登录',
      result:''
    });
  }
});

// 购物车
router.get("/getCartCount", function (req,res,next) {
  if(req.cookies && req.cookies.userName){
    var userName = req.cookies.userName;
    User.findOne({"userName": userName }, function (err,doc) {
      if(err){
        res.json({
          status:"0",
          msg:err.message
        });
      }else{
        let cartCount = 0;
        if(doc != null)  {
            let cartList = doc.cartList;
            cartList.map(function(item){
                cartCount += parseFloat(item.productNum);
            });
        }
        res.json({
          status:"0",
          msg:"",
          result:cartCount
        });
      }
    });
  }else{
    res.json({
      status:"0",
      msg:"当前用户不存在"
    });
  }
});

// 查询当前用户的购物车数据
router.get("/cartList", function (req,res,next) {
  var userName = req.cookies.userName;

  User.findOne({"userName":userName}, function (err,doc) {
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else{
          if(doc){
            res.json({
              status:'0',
              msg:'',
              result:doc.cartList
            });
          }
      }
  });
});

//购物车删除
router.post("/cartDel", function (req,res,next) {
  var userName = req.cookies.userName,productId = req.body.productId;
  User.update({
    userName:userName
  },{
    $pull:{
      'cartList':{
        'productId':productId
      }
    }
  }, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  });
});

//修改商品数量
router.post("/cartEdit", function (req,res,next) {
  var userName = req.cookies.userName,
      productId = req.body.productId,
      productNum = req.body.productNum,
      checked = req.body.checked;
  User.update({"userName":userName,"cartList.productId":productId},{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked,
  }, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  })
});

router.post("/editCheckAll", function (req,res,next) {
  var userName = req.cookies.userName,
      checkAll = req.body.checkAll?'1':'0';
  User.findOne({userName:userName}, function (err,user) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      if(user){
        user.cartList.forEach((item)=>{
          item.checked = checkAll;
        })
        user.save(function (err1,doc) {
            if(err1){
              res.json({
                status:'1',
                msg:err1,message,
                result:''
              });
            }else{
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              });
            }
        })
      }
    }
  });
});

//查询用户地址接口
router.get("/addressList", function (req,res,next) {
  var userName = req.cookies.userName;
  User.findOne({userName:userName}, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:doc.addressList
      });
    }
  })
});

// 设置默认地址接口
router.post("/setDefault", function (req,res,next) {
  var userName = req.cookies.userName,
      username = req.body.userName;

  if(!username){
    res.json({
      status:'1003',
      msg:'username is null',
      result:''
    });
  }else{
    User.findOne({userName:userName}, function (err,doc) {
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else{
        var addressList = doc.addressList;
        addressList.forEach((item)=>{
          if(item.userName ==username){
             item.isDefault = true;
          }else{
            item.isDefault = false;
          }
        });

        doc.save(function (err1,doc1) {
          if(err){
            res.json({
              status:'1',
              msg:err.message,
              result:''
            });
          }else{
              res.json({
                status:'0',
                msg:'',
                result:''
              });
          }
        })
      }
    });
  }
});

// 删除地址接口
router.post("/delAddress", function (req,res,next) {
  var userName = req.cookies.userName,username = req.body.userName;

  User.update({
    userName:userName
  },{
    $pull:{
      'addressList':{
        'userName':username
      }
    }
  }, function (err,doc) {
      if(err){
        res.json({
            status:'1',
            msg:err.message,
            result:''
        });
      }else{
        res.json({
          status:'0',
          msg:'',
          result:''
        });
      }
  });
});
  //新增地址接口
   router.post("/addNewaddress",function(req,res,next) {
          var data = req.body.data;
          console.log(data);
          User.update({
            userName:req.cookies.userName
          },{
            $push:{
              'addressList':{
                'userName':data.userName,
                'streetName':data.streetName,
                'isDefult':data.isDefault,
                'tel':data.tel
              }
            }
          }, function (err,doc) {
              if(err){
                res.json({
                    status:'1',
                    msg:err.message,
                    result:''
                });
              }else{
                res.json({
                  status:'0',
                  msg:'',
                  result:''
                });
              }
          });
   })

   //用户提交评论
   router.post("/postMes", function(req,res,next){
       var obj = req.body.params;
       console.log(obj);
       var mes = obj.mes;
       var starLevel = obj.starLevel;
       var productId = obj.productId;
       var userName = req.cookies.userName;

       Goods.findOne({productId:productId}, function(err,uoc){
             if(err){
              res.json({
                status:"1",
                msg:err.message,
                result:''
                });
             }else{
              var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
              var message = {
                  userName:userName,
                  create_time:createDate,
                  mes_content:mes,
                  starLevel:starLevel
              };
               uoc.user_mes.push(message);

               uoc.save(function(err1,uoc1){
                 if(err1){
                    res.json({
                      status:"100001",
                      mes:'插入失败'
                    });
                 }else{
                   res.json({
                     status:"100002",
                     mes:"插入成功"
                   });
                 }
               });
             }
       });
   });

router.post("/payMent", function (req,res,next) {
  var userName = req.cookies.userName,
    username = req.body.userName,
    orderTotal = req.body.orderTotal;

  User.findOne({userName:userName}, function (err,doc) {
     if(err){
        res.json({
            status:"1",
            msg:err.message,
            result:''
        });
     }else{
       var address = '',goodsList = [];
       //获取当前用户的地址信息
       doc.addressList.forEach((item)=>{
          if(username==item.userName){
            address = item;
          }
       })

       //获取用户购物车的购买商品
       doc.cartList.filter((item)=>{
         if(item.checked=='1'){
           goodsList.push(item);
         }
       });

       var platform = '622';
       var r1 = Math.floor(Math.random()*10);
       var r2 = Math.floor(Math.random()*10);

       var sysDate = new Date().Format('yyyyMMddhhmmss');
       var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
       var orderId = platform+r1+sysDate+r2;

       var order = {
          orderId:orderId,
          orderTotal:orderTotal,
          addressInfo:address,
          goodsList:goodsList,
          orderStatus:'1',
          createDate:createDate
       };

       doc.orderList.push(order);

       doc.save(function (err1,doc1) {
          if(err1){
            console.log('>>>>>>',err1)
            res.json({
              status:"1",
              msg:'err.message',
              result:''
            });
          }else{
            res.json({
              status:"0",
              msg:'',
              result:{
                orderId:order.orderId,
                orderTotal:order.orderTotal
              }
            });
          }
       });
     }
  })
});

//根据用户名查询所有订单信息
router.post("/getOrderList",function(req,res,next){
  var userName = req.cookies.userName
  User.findOne({userName:userName}, function (err,userInfo) {
      if(err){
          res.json({
             status:'10001',
             msg:'查询失败',
             result:''
          });
      }else{
         var orderList = userInfo.orderList;
         if(orderList.length>0){
           res.json({
             status:'10000',
             mes:'查询成功',
             result:orderList
           });
         }else{
           res.json({
             status:'120001',
             msg:'当前用户未创建订单',
             result:''
           });
         }
      }
  })
});


//根据订单Id查询订单信息
router.get("/searchByorderId", function (req,res,next) {
  var userName = req.cookies.userName,orderId = req.param("orderId");
  User.findOne({userName:userName}, function (err,userInfo) {
      if(err){
          res.json({
             status:'1',
             msg:'22',
             result:''
          });
      }else{
         var orderList = userInfo.orderList;
         var orderlist = [];
         if(orderList.length>0){
           orderList.forEach((item)=>{
              if(item.orderId == orderId){
                orderlist.push(item);
              }
           });

           if(orderlist.length !== 0){
             res.json({
               status:'2',
               msg:'查询成功',
               orderList:orderlist
             })
           }else{
             res.json({
               status:'1',
               msg:'暂无此订单',
               result:''
             });
           }
         }
      }
  })
});


// 查询订单信息
router.get("/orderDetail", function (req,res,next) {
  var userName = req.cookies.userName,orderId = req.param("orderId");
  User.findOne({userName:userName}, function (err,userInfo) {
      if(err){
          res.json({
             status:'1',
             msg:'22',
             result:''
          });
      }else{
         var orderList = userInfo.orderList;
         if(orderList.length>0){
           var orderTotal = 0;
           orderList.forEach((item)=>{
              if(item.orderId == orderId){
                orderTotal = item.orderTotal;
              }
           });

           if(orderTotal>0){
             res.json({
               status:'0',
               msg:'',
               result:{
                 orderId:orderId,
                 orderTotal:orderTotal
               },
               orderList:orderList
             })
           }else{
             res.json({
               status:'120002',
               msg:'无此订单',
               result:''
             });
           }
         }else{
           res.json({
             status:'120001',
             msg:'当前用户未创建订单',
             result:''
           });
         }
      }
  })
});

module.exports = router;
