var mongodb = require('./db');
var Ids = require('./id');

var date = new Date();
function Article(username,title,article,id,time){
	this.username = username;
	this.title = title;
	this.article = article;
	if(time){
		this.time = time;
	}else{
		this.time = {
			data:date,
			year:date.getFullYear(),
			month:date.getFullYear()+"-"+(date.getMonth()+1),
			day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
			minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()
		};
	}
	this.id=id;
}
module.exports = Article;

Article.prototype.save = function save(callback){
	//存入Mongo文档
	var article = {
		username:this.username,
		title:this.title,
		article:this.article,
		time:this.time,
	}

	Ids.getId('article',function(id,err){
		if(err){
			return callback(err);
		}
		article.id = ""+id;
		mongodb.open(function(err,db){
			if(err){
				return callback(err);
			}
			
			//读取article集合
			db.collection('article',function(err,collection){
				if(err){
					mongodb.close();
					return callback(err);
				}

				//为username添加索引
				collection.ensureIndex({'username':1,'id':1},function(err){
					if(err){
						mongodb.close();
						return callback("wokao");
					}
				});
				//写入article文档
				collection.insert(article,{safe:true},function(err,article){
					mongodb.close();
					callback(err,article);
				});
			});
		});
	});
};
 
Article.get = function get(queryword,page,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);	
		}
		//读取 article集合
		db.collection('article',function(err,collection){
			if(err){
				mongodb.close()
				return callback(err);
			}
			var query ={};
			if(queryword){
				var wold = queryword.wold;
				query[wold] = queryword.value;
			}
			collection.count(query,function(err,total){
				collection.find(query,{skip: (page - 1)*10,limit: 10}).sort({time:-1}).toArray(function(err,docs){
					mongodb.close();
					if(err){
						callback(err,null);
					}
					//封装article为Article对象
					var articles = [];
					docs.forEach(function(doc,index){
						var article = new Article(doc.username,doc.title,doc.article,doc.id,doc.time);
						articles.push(article);
					});
					callback(null,articles,total);
				});
			});
			
		});
	});
};
Article.del = function del(id,callback){
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('article',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.remove({"id":id},function(err,num){
				//mongodb.close();
				if(err){
					mongodb.close();
					return callback(err,num);
				}
				//删除评论
				db.collection('comment',function(err,collection){
					if(err){
						mongodb.close();
						return callback(err,num);
					}
					collection.remove({'articleId':id},function(err,num){
						mongodb.close();
						if(err){
							return callback(err,num);
						}
						callback(null,num);
					});
				});
			});
		});
	});
};
Article.prototype.update = function update(callback){
	var article = {
		username:this.username,
		title:this.title,
		article:this.article,
		time:this.time,
		id:this.id
	}
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('article',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.update({"id":article.id},article,function(err,article){
				mongodb.close();
				callback(err,article);
			});
		});
	});
}



