var mongodb = require('./db');

function User(user){
	//注册用户需要的信息name，password,email等
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
	this.imgUrl = user.imgUrl;
}
module.exports = User;
User.prototype.save = function(callback){
	var user = {
		name:this.name,
		password:this.password,
		email:this.email,
		imgUrl:this.imgUrl
	};
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			//返回错误信息给回调函数
			return callback(err);
		}
		//连接数据库中名为user的表，没有就创建
		db.collection('user',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//为name 属性添加索引
			collection.ensureIndex('name',{unique:true},function(err){
				//console.log('123');
				if(err){
					callback(err);
				}
			});
			//插入新的数据
			collection.insert(user,{safe:true},function(err,result){
				//不管是否成功都关闭数据库
				mongodb.close();
				callback(err,user);
			});
		});
	})
}
//读取用户信息
User.get = function(name,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取users集合
		db.collection('user',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查找用户名为name值的name文档
			collection.findOne({name:name},function(err,doc){
				mongodb.close();
				if(doc){
					var user = new User(doc);console.log('123');
					callback(err,user);
				}else{
					callback(err,null);
				}
			});
		});
	});
}







