var mongodb = require('./db');
var Ids = require('./id');
var date = new Date();

function Comment(email,name,content,articleId,id,time){
	this.email = email;
	this.name = name;
	this.content = content;
	this.articleId = articleId;
	if(time){
		this.time = time;
	}else{
		this.time=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
	}	
	this.id = id
}

module.exports = Comment;

Comment.prototype.save = function save(callback){
	var comment = {
		email:this.email,
		name:this.name,
		content:this.content,
		articleId:this.articleId,
		time:this.time
	}
	Ids.getId('comment',function(id,err){
		if(err){
			return callback(err);
		}
		comment.id = id+"";
		mongodb.open(function(err,db){
			if(err){
				mongodb.close();
				return callback(err);
			}
			db.collection('comment',function(err,collection){
				if(err){
					mongodb.close();
					return callback(err);
				}

				collection.ensureIndex({'articleId':1,'id':1},function(err){
					if(err){
						mongodb.close();
						return callback("wokao");
					}
				});
				 collection.insert(comment,{safe:true},function(err,comment){
					mongodb.close();
					
					callback(err,comment);
				});
			});
		});
	});
};

Comment.get = function get(articleId,callback){
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			callback(err);
		}
		db.collection('comment',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(articleId){
				query.articleId = articleId;
			}
			var comments = [];
			collection.find(query).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					callback(err,null);
				}	
				var comments = [];
				docs.forEach(function(doc,index){
					var comment = new Comment(doc.email,doc.name,doc.content,doc.articleId,doc.id,doc.time);
					comments.push(comment);
				});
				callback(null,comments);
			});
		});

	});
};
Comment.del = function del(id,callback){
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('comment',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err,num);
			}
			
			collection.remove({'id':id},function(err,num){
				console.log(num);
				mongodb.close();
				if(err){
					return callback(err,num);
				}
				//
				callback(null,num);
			});
		});
	});
}