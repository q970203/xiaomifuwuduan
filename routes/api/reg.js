let express = require('express')
let router = express.Router();
let fs = require('fs');
let pathLib = require('path');
let mgdb = require('../../utils/mgdb');
let bcrypt = require('../../utils/bcrypt')

//注册
router.post('/', (req, res, next) => {
  //1. 获取 username、password、nikename、icon、
  let { tel, password,username} = req.body;

  //2. 必传参数做校验 username、password
  if (!tel || !password) {
    res.send({
      err: 1,
      msg: '手机号、密码为必传参数'
    })
    return;
  }

  mgdb.open({
    dbName: 'xiaomi',
    collectionName: 'user'
  }).then(
    ({ collection, client }) => {

      // console.log('56',collection,client)
      //4.2 查询
      collection.find({ tel }).toArray((err, result) => {

        if (err) {
          res.send({ err: 1, msg: '集合操作失败' })
          client.close()
        } else {
          if (result.length === 0) {
            //4.2.2 用户不存在  参数入库

            //密码加密
            password = bcrypt.hashSync(password)
            console.log(password)
            //入库
            collection.insertOne({
              tel, password,username
            }, (err, result) => {
              if (!err) {

                //插入后的信息，返回给客户端，不含username,password
                // delete result.ops[0].tel;
                delete result.ops[0].password;

                res.send({
                  err: 0, msg: '注册成功',
                  data: result.ops[0]
                })
              } else {//入库失败
                res.send({ err: 1, msg: '注册失败' })
              }
              client.close()
            })
          } else {
            //4.2.1 用户存在 删除后的头像 不能删除默认头像
            // if (icon.indexOf('default') === -1) {
            //   fs.unlinkSync('./public' + icon)
            // }
            res.send({ err: 1, msg: '用户名已存在' })
            client.close()
          }


        }

      })

    }
  ).catch(
    err => {
      // console.log('106',err)
      res.send({err:1,msg:'集合操作失败'})
    }
  )



})

module.exports = router;