
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var Article = require('../models/article');
var Comment = require('../models/comment');

module.exports = function(app){
	app.get('/',function(req,res){
			var page = req.query.page?parseInt(req.query.page) : 1; 
			Article.get(null,page,function(err,articles,total){
				if(err){
					articles = [];
				}
				res.render('index',{
					title:'alian\'blog',
					articles:articles,
					nowPage:page,
					total:total
				});
			});
			
	});
	app.get('/login',function(req,res){
		res.render('login',{title:'登陆'});
	});
	app.post('/login',function(req,res){
		var md5 = crypto.createHash('md5');
		var	password = md5.update(req.body.password).digest('hex');

		var newUser = new User({
			name:req.body.username,
			password:password
		});

		User.get(newUser.name,function(err,user){
			if(user){
				//如果存在
				if(user.password!= password){
					req.flash('error','密码不正确');
					res.redirect('/login');
				}else{
					req.session.user = user;
					req.flash('success','登陆成功！');
					res.redirect('/');
				}
			}else{
				req.flash('error','用户不存在');
				res.redirect('/login');
			}
		});
	});
	app.get('/reg',function(req,res){
		res.render('reg',{title:'注册'});
	});
	app.post('/reg',function(req,res){
		var name = req.body.username;
		var password = req.body.password;
		var repassword = req.body.repassword;
		//判断两次密码相不相等
		if(password != repassword){
			req.flash('error','两次输入的密码不一致');
			return res.redirect('/reg');
		}
		//对密码加密
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			name:req.body.username,
			password:password,
			email:req.body.email
		});
		//使用user.get()函数来读取用户信息
		User.get(newUser.name,function(err,user){
			//如果有返回值，存在用户
			if(user){
				err = "用户已处在";
			}
			if(err){
				//如果报错，记录错误信息，跳转页面
				req.flash('error',err);console.log('失败');
				return res.redirect('/reg');
			}
			newUser.save(function(err,user){
				if(err){
					req.flash('error',err);
					console.log('失败');
					return res.redirect('/reg');
				}
				//成功后，把用户信息存在req.session中，跳转到首页
				req.session.user = user;
				req.flash('success','注册成功');
				res.redirect('/');
			});
		});
	});

	app.get('/logout',function(req,res){
		req.session.user = null;
		req.flash('success','登出成功');
		res.redirect('/');
	});

	//写文章
	app.get('/write',function(req,res){
		res.render('write',{
			title:'编辑文章'
		});
	});
	app.post('/write',function(req,res){
		var currenUser = req.session.user;
		var article = new Article(currenUser.name,req.body.title,req.body.article);
		
		article.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/write');
			}
			req.flash('success','发表成功！');
			res.redirect('/');
		});
		
	});

	//查看文章
	app.get('/article/:id',function(req,res){
		Article.get({wold:'id',value:req.params.id},1,function(err,articles){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			Comment.get(req.params.id,function(err,comments){
				if(err){
					req.flash('error',err);
					return res.redirect('/article/'+req.params.id);
				}
				res.render('article',{
					title:articles[0].title,	
					articles:articles,
					comments:comments
				});
			});
		});
	});

	//评论
	app.post('/article/comment/:id',function(req,res){
		var id=req.params.id;
		var content = req.body.reply_content+req.body.content; 
		var comment = new Comment(req.body.email,req.body.name,content,id);
		comment.save(function(err,comment){
			if(err){
				req.flash('error',err);
				return res.redirect('/article/:'+req.params.id);
			}
			req.flash('success','发表成功！');
			res.redirect('/article/'+req.params.id);
		});
	});

	//删除文章
	app.post('/article/del',function(req,res){
		Article.del(req.body.id,function(err,num){
			if(err){
				return req.flash('error',err);
				res.redirect('/article/'+req.body.id);
			}
			req.flash('success','删除成功！');
			res.send({'status':1});
			
			//res.redirect('/');
		});
	});

	//编辑文章
	app.get('/article/edit/:id',function(req,res){
		Article.get({wold:'id',value:req.params.id},function(err,articles){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('edit',{
				title:articles.title,	
				articles:articles
			});
		});
	});
	//编辑提交
	app.post('/article/edit/:id',function(req,res){
		var currenUser = req.session.user;
		var article = new Article(currenUser.name,req.body.title,req.body.article,req.params.id);

		article.update(function(err,num){
			if(err){
				req.flash('error',err);
				return redirect('/article/'+req.params.id);
			}
			req.flash('success','修改成功！');
			res.redirect('/article/'+req.params.id);
		});
	});

	//评论删除
	app.post('/article/del',function(req,res){
		Article.del(req.body.id,function(err,num){
			if(err){
				req.flash('error',err);
				return res.redirect('/article/'+req.body.id);
			}
			req.flash('success','删除成功！');
			res.send({'status':1});
			
			//res.redirect('/');
		});
	});
	app.post('/comment/del',function(req,res){
		Comment.del(req.body.id,function(err,num){
			console.log(req.body.id);
			if(err){
				req.flash('error',err);
				return redirect('/article/'+req.body.id);
			}
			req.flash('success','删除成功！');
			res.send({'status':1});
		});
	});
}