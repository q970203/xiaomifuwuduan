let express = require('express')
let router = express.Router();
let fs = require('fs');
let pathLib = require('path');
let mgdb = require('../../utils/mgdb');

//添加
router.post("/",(req,res,next)=>{
	let {price,desc,title,img,opt1,opt2,num,checked}=req.body;
		if (!title || !price ) {
	    res.send({
	      err: 1,
	      msg: 'title、价格为必传参数'
	    })
	    return;
	  }
	  mgdb.open({
	    dbName: 'xiaomi',
	    collectionName: 'cart'
	  }).then(
	    ({ collection, client }) => {
	      //4.2 查询
	      collection.find({ title }).toArray((err, result) => {
	        if (err) {
	          res.send({ err: 1, msg: '失败' })
	          client.close()
	        } else {
	          if (result.length === 0) {
	            collection.insertOne({
	              price,desc,title,img,opt1,opt2,num,checked,date:new Date()
	            }, (err, result) => {
	              if (!err) {
	                res.send({
	                  err: 0, msg: '加入成功',
	                  data: result.ops
	                })
	              } else {//入库失败
	                res.send({ err: 1, msg: '加入失败' })
	              }
	              client.close()
	            })
	          } else {
	            collection.updateOne(
								{title:title},{$set:{"num":num,date:new Date()}},
							),(err,result)=>{
								if(!err){
									res.send({
										err:0,msg:"数据增加",
										data:result.ops
									})
								}else{
									res.send({ err: 1, msg: '数据增加失败' })
								}
								client.close()

							}
	          }
	        }
	      })
	    }
	  ).catch(
	    err => {
	      res.send({err:1,msg:'集合操作失败'})
	    }
	  )
	})
	
	//删除
	router.delete('/:_id', (req, res, next) => {
	  let _id = req.params._id;
	  if (!_id) {
	    res.send({ err: 1, msg: '_id为必传参数' })
	    return;
	  }
	  mgdb.open({
	    collectionName: 'cart'
	  }).then(
	    ({ collection, client, ObjectId }) => {
	      collection.deleteOne({//删除
	        _id: ObjectId(_id)
	      }, (err, result) => {
	        if (result.result.n > 0) {
	          res.send({ err: 0, msg: '删除成功' })// 后台管理系统是前端渲染  返回json
	          // res.render('ejs模板',{err:0,msg:'删除成功'})//后台管理系统是后的端渲染  操作ejs
	        } else {
	          res.send({ err: 1, msg: '删除失败' })
	        }
	        client.close()
	      })
	    }
	  )
	
	
	})
	
	module.exports = router;