let express = require('express')
let router = express.Router();
let mgdb = require('../../utils/mgdb')
let bcrypt = require('../../utils/bcrypt')
router.get('/', (req, res, next) => {
	//开库
	mgdb.open({
		collectionName: 'user'
	}).then(
		({
			collection,
			client,
			ObjectId
		}) => {
			//查询库，根据token
			collection.find({
				// username: req.query.decode.username,
				_id: ObjectId(req.query.decode._id)
			}).toArray((err, result) => {
				if (err) {
					res.send({
						err: 1,
						msg: '集合操作失败'
					})
				} else {
					//判断用户是否存在
					if (result.length > 0) {
						//自动登录成功，需要返回数据给客户端，不含username、password
						delete result[0].password
						res.send({
							err: 0,
							msg: '自动登陆成功',
							data: result[0]
						})

					} else {
						res.send({
							err: 1,
							msg: '自动登录失败'
						})
					}
				}
				client.close()
			})
		}
	)
})

// //修改
router.post('/', (req, res, next) => {
			let {
				_id,
				username,
				password,
				tel
			} = req.body
			password = bcrypt.hashSync(password)
			if (!_id) {
				res.send({
					err: 1,
					msg: '_id为必传参数'
				})
				return;
			}

			mgdb.open({
				collectionName: 'user'
			}).then(
				({
					collection,
					client,
					ObjectId
				}) => {
					collection.find({
						_id: ObjectId(_id)
					}).toArray((err, result) => {
						collection.updateOne({
							_id: ObjectId(_id)
						}, {
							$set: {
								password,
								tel,
								username
							}
						}, {
							upsert: false,
							projection: false,
						}, (err, result) => {
							if (result.result.n > 0) {
								res.send({
									err: 0,
									msg:"修改成功",
									data:{_id,username,tel}
								})
							} else {
								res.send({
									err: 1,
									msg: '修改失败'
								})
							}
							client.close()
						})
					})
				})
				})
			module.exports = router;
