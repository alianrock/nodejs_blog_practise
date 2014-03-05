;(function(window, undefined) {
	
	
	/**================================================$util对象 ==========================================*/
	var $util = {
	    //动态加载CSS文件
		loadCss : function(src, callback) {
	        _linkNode = document.createElement('link');
	        _linkNode.type = 'text/css';
	        _linkNode.rel = 'stylesheet';
	        _linkNode.href = src;
	        _linkNode.id = 'dynamic-link-node';
	        document.getElementsByTagName('head')[0].appendChild(_linkNode);
	        _linkNode.onload = callback||'';
	        return _linkNode;
		},
	    css : function(elem, key, value) {
			if(elem && key) {
				var index = key.indexOf('-');
				if(-1 != index) {
					var preHalf = key.substring(0, index);
					var backHalf = key.substring(index + 1);
					var toCase = backHalf.substring(0, 1).toUpperCase();
					key = preHalf + toCase + backHalf.substring(1);
				}
				if(arguments.length === 2) {
					return elem.style[key];
				}
				elem.style[key] = value;
			}
		},
	    //获取选中文本
	    getSelectedText : function() {
	    	if(window.getSelection) return window.getSelection().toString();//非IE
	    	return document.selection.createRange().text;
	    },
		//在光标处插入节点
		insertNodeAtCaret : function(node){
			if(window.getSelection) {
	            var selection = window.getSelection();
	            var range = selection.getRangeAt(0);
	            range.deleteContents();
	            range.insertNode(node);
	        } else {
	        	var text = (node.nodeType == 1) ? node.outerHTML : node.data;
	            var range = document.selection.createRange();
	            range.pasteHTML(text);
	        }
		},
		//添加样式 <span style=""></span>
		replaceNode : function(spanNode) {
			var text = this.getSelectedText();
			spanNode.innerHTML = text;
			this.insertNodeAtCaret(spanNode);
		},
	    //获取事件源节点
	    target : function(e) {
	        if(e && e.target) return e.target;
	        return window.event.srcElement;
	    },
	    addHandler : function(node, type, handler) {
	    	if(node.addEventListener) {
			    node.addEventListener(type, handler, false);
		    } else if(node.attachEvent) {
		        node.attachEvent('on' + type, handler);
		    }
	    },
	    //阻止事件冒泡
	    unbubble : function(e) {
	        if (e && e.stopPropagation) e.stopPropagation(); //非IE
	        else window.event.cancelBubble = true; //IE
	    },
	    //元素包含（两个元素为同一个元素时返回true）
	    contains : function(root, elem) {
	    	if(!root || !elem) return false;
	    	if(root === elem) return true;
	        if (root.compareDocumentPosition) {
	            return !!(root.compareDocumentPosition(elem) & 16) && root !== elem;
	        }
	        if (root.contains && elem.nodeType === 1){ //IE
	            return root.contains(elem) && root !== elem;
	        }
	        while (elem = elem.parentNode) {
	            if (elem === root) {
	                return true;
	            }
	        }
	        return false;
	    },
		
		extendPrototype : function(sub, func) {
			var F = function() {};
			F.prototype = func.prototype;
			var cprototype = new F();
			sub.prototype = cprototype;
			sub.prototype.constructor = sub;
		}
	};
	
	
	/** ==================================================基础类定义 ==========================================
	 * ToolBar构造函数，工具条
	 * @param 
	 * {
	 * 		container: node,
	 * 		fixed   : boolean,
	 * 		left    : left,
	 * 		top     : top,
	 * 		opacity : 1-100,
	 * 		visible : boolean,
	 * 		cssPath : path,
	 * 
	 * 		style   : {
	 * 			....
	 * 		}
	 * }
	 * =======================================================================================================*/
	var ToolBar = function(param) {
		param = param || {};
		this.param = param;
		this.init(param, this);
		this.setVisible(param.visible);
		this.setOpacity(param.opacity);
		this.setPosition(param.left, param.top);
		if(true === param.fixed) {
			this.setFixed(true);
			this.setVisible(true);
		}
	};
	ToolBar.prototype = {
		fixed : false, btns : {}, panels : {},
		
		init : function(param, _this) {
			var _dom = document.createElement('div');
			_dom.id = param.id || 'common-toolbar';
			_dom.setAttribute('unselectable', 'on');
			this.dom = _dom;
			this.addBtns(btns);
			
			this.click(function(event) {
				_this.handler.btnClickHandler(event, _this);
        		_this.handler.panelClickHandler(event, _this);
			});
			
			$util.addHandler(document, 'mouseup', function(event) {
				if(!$util.contains(_this.dom, $util.target(e))) {
					_this.panels.hide();
				}
				if(!_this.fixed) {
					var e = event || window.event;
					if(!$util.contains(_this.dom, $util.target(e))) {
						_this.hide();
					}
				}
			});
			
			//防止setOpacity后鼠标hover时的opacity失效，不兼容IE
			$util.addHandler(this.dom, 'mouseover', function(event) {
				_this.dom.style.opacity = '';
			});
			
			//加载CSS文件
			cssPath = param.cssPath || param.csspath;
			$util.loadCss(cssPath + 'fishEditor.css');
			
			for(key in param.style) {
				$util.css(this.dom, key, param.style[key]);
			}
			
			this.render(param.container || document.body);
		},
		
		show : function() {
			this.setVisible(true);
		},
		
		hide : function() {
			this.setVisible(false);
			this.panels.hide();
		},
		
		setFixed : function(bool) {
			this.fixed = (true === bool) ? true : false;
		},
		
		setPosition : function(left, top) {
			this.dom.style.left = left ? (parseInt(left) + 'px') : '';
			this.dom.style.top  = top ? (parseInt(top)  + 'px') : '';
		},
		
		setOpacity : function(opacity) {
			if(!opacity || 0 == opacity) {
				return false;
			}
			this.dom.style.opacity = parseInt(opacity) / 100;
			this.dom.style.filter = 'alpha(opacity='+opacity+')';
		},
		
		setVisible : function(bool) {
			(true === bool) ? this.dom.style.display = 'block' : this.dom.style.display = 'none';
		},
		
		width : function() {
			return this.getSize('width');
		},
		
		height : function() {
			return this.getSize('height');
		},
		
		getSize : function(wh) {
			this.dom.style.visibility = 'hidden';
    		this.show();
    		if('width' === wh) {
	    		this.dom.style.left = 0;
				var barSize = this.dom.clientWidth;
			} else if('height' === wh) {
				var barSize = this.dom.clientHeight;
			}
			this.dom.style.visibility = 'visible';
			this.hide();
			return barSize;
		},
		
		addBtn : function(toolBtn) {
			if(toolBtn instanceof ToolBtn) {
				this.dom.appendChild(toolBtn.wrap);
				this.btns[toolBtn.dom.id] = toolBtn;
				if(toolBtn.panel)
					this.panels[toolBtn.dom.id] = toolBtn.panel;
				return toolBtn;
			}
			if('\n' === toolBtn) {
				var clear = document.createElement('div');
				clear.style.clear = 'both';
				this.dom.appendChild(clear);
			} else {
				this.dom.appendChild(document.createTextNode(toolBtn));
			}
		},
		
		addBtns : function(btns) {
			for(var i = 0, len = btns.length; i < len; i++) {
				if('object' === typeof btns[i]) {
					this.addBtn(new ToolBtn(btns[i]));
					continue;
				}
				this.addBtn(btns[i]);
			}
		},
		
		click : function(callback) {
			this.dom.onclick = function(event) {
				callback(event||window.event);
			}
		},
		
		render : function(node) {
			if('object' == typeof node) {
				node.appendChild(this.dom);
			} else {
				document.getElementById(node).appendChild(this.dom);
			}
		}
	};
	
	/** ToolBtn构造函数，工具条上的按钮*/
	var ToolBtn = function(data) {
		var _wrap = document.createElement('div');
		var _dom = document.createElement('a');
		_dom.id = data.id;
		_dom.setAttribute('unselectable', 'on');
		_wrap.id = data.id + '-wrap';
		_wrap.className = 'toolbar-btn-wrap';
		_dom.className = 'toolbar-btn';
		_dom.setAttribute('href', 'javascript:;');
		_dom.setAttribute('title', data.title);
		_dom.innerHTML = data.text; //不加&nbsp;箭头margin-left无效
		_wrap.appendChild(_dom);
		this.dom = _dom;
		this.wrap = _wrap;
		data.arrows?this.addArrows(new Arrows()):'';
		data.panel?this.addPanel(data.panel):'';
	};
	ToolBtn.prototype = {
		click : function(callback) {
			this.dom.onclick = function(event) {
				callback(event||window.event);
			}
		},
		
		setText : function(text) {
			this.dom.innerHTML = text;
		},
		
		addArrows : function(arrObj) {
			this.dom.appendChild(arrObj.dom);
		},
		
		addPanel : function(penalObj) {
			this.panel = penalObj;
			this.wrap.appendChild(penalObj.dom);
		}
	};
	
	/** 箭头构造函数*/
	var Arrows = function() {
		_dom = document.createElement('span');
		_dom.className = 'toolbar-btn-arrows';
		this.dom = _dom;
	}
	
	/** ToolPanel构造函数，工具条上的面板*/
	var ToolPanel = function(id) {
		var _dom = document.createElement('div');
		_dom.id = id;
		_dom.className = 'toolbar-panel';
		this.dom = _dom;
	};
	ToolPanel.prototype = {
		show : function() {
			this.dom.style.display = 'block';
		},
		hide : function() {
			this.dom.style.display = 'none';
		}
	};
	
	/**==================================================拓展类定义 ==========================================*/
	/** ColorPanel构造函数，颜色选择面板*/
	var ColorPanel = function(id) {
		ToolPanel.call(this, id); //继承函数属性
		this.genColors();
	};
	$util.extendPrototype(ColorPanel, ToolPanel);//new ToolPanel(); //继承原型属性
	ColorPanel.prototype.genColors = function () { //拓展
		var colors = ['00', '33', '66' ,'99', 'FF'];
	  	var _html = '';
        for(var i = 0; i < 6; i++) {
            _html += '<table cellspacing=0 cellpadding=0>';
            for(var j = 0; j < 6; j++) {
                _html += '<tr>';
                for(var k = 0; k < 6; k++) {
                    if(i == 1 || i == 3 || i == 5 || j == 5 || k == 5) continue; //去掉重复颜色
                    var color = '#' + colors[i] + colors[j] + colors[k];
                    _html += '<td >';
                    _html += '<input type=button title='+color
                    			+' style="background-color:'+color+'" val='+color+' />';
                    _html += '</td>';
                }
                _html += '</tr>';
            }
            _html += '</table>';
        }
        this.dom.innerHTML = _html;
	};
	
	/** FontPanel构造函数，字体选择面板*/
	var FontPanel = function(id) {
		ToolPanel.call(this, id);
		this.genFonts();
	};
	$util.extendPrototype(FontPanel, ToolPanel);//new ToolPanel();
	FontPanel.prototype.genFonts = function () {
		var fonts = [
		'黑体', '宋体', '仿宋_GB2312', '楷体_GB2312', '微软雅黑' , 
		'Arial', 'Tahoma', 'Georgia', 'Helvetica', 'Sans-serif'];
        var _html = '<table cellspacing=0 cellpadding=0>';
        for(var i = 0; i < fonts.length; i++) {
            _html += '<tr><td >';
            _html += '<a href=javascript:; val='+fonts[i]
            			+' style="font-family:'+fonts[i] + '">'+fonts[i]+'</a>';
            _html += '</td></tr>';
        }
        _html += '</table>';
        this.dom.innerHTML = _html;
	};
	
	/** SizePanel构造函数，字号选择面板*/
	var SizePanel = function(id) {
		ToolPanel.call(this, id);
		this.genSizes();
	};
	$util.extendPrototype(SizePanel, ToolPanel);//new ToolPanel();
	SizePanel.prototype.genSizes = function () {
		var sizes = ['12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px'];
        var _html = '<table cellspacing=0 cellpadding=0>';
        for(var i = 0; i < sizes.length; i++) {
            _html += '<tr><td >';
            _html += '<a href="javascript:;" val='+sizes[i]
            			+' style="font-size:'+sizes[i]+'">'+sizes[i]+'</a>';
            _html += '</td></tr>';
        }
        _html += '</table>';
        this.dom.innerHTML = _html;
	};
	
	/** HrPanel构造函数，水平线插入面板*/
	var HrPanel = function(id) {
		ToolPanel.call(this, id);
		this.genHrs();
	};
	$util.extendPrototype(HrPanel, ToolPanel);//new ToolPanel();
	HrPanel.prototype.genHrs = function () {
		var hrs = [
        	'height:1px;border:none;border-top:1px dashed #CCC;', 
        	'height:1px;border:none;border-top:2px dashed #CCC;', 
        	'height:1px;border:none;border-top:3px dashed #CCC;', 
        	'height:1px;border:none;border-top:1px dotted #CCC;',
        	'height:1px;border:none;border-top:2px dotted #CCC;', 
        	'height:1px;border:none;border-top:3px dotted #CCC;',
        	'height:1px;border:none;border-top:1px solid  #CCC;', 
        	'height:1px;border:none;border-top:2px solid  #CCC;',
        	'height:1px;border:none;border-top:3px solid  #CCC;'
	    ];
        var _html = '<table cellspacing=0 cellpadding=0>';
        for(var j = 0; j < hrs.length; j++) {
            _html += '<tr><td >';
            _html += '<a unselectable=on href=javascript:; val="'+hrs[j]+'">'
            			+'<hr unselectable=on style="'+hrs[j]+'" width=70 val="'+hrs[j]+'"></a>';
            _html += '</td></tr>';
        }
        _html += '</table>';
        this.dom.innerHTML = _html;
	};
	
	/** CharPanel构造函数，特殊字符选择面板*/
	var CharPanel = function(id) {
		ToolPanel.call(this, id);
		this.genChars();
	};
	$util.extendPrototype(CharPanel, ToolPanel);//new ToolPanel();
	CharPanel.prototype.genChars = function () {
		var chars = [
            ['☆', '★', '○', '●', '◇', '◆', '□', '■', '△', '▲'],
            ['①','②', '③', '④','⑤', '⑥','⑦', '⑧', '⑨','⑩'],
            ['Ⅰ','Ⅱ', 'Ⅲ', 'Ⅳ','Ⅴ', 'Ⅵ','Ⅶ', 'Ⅷ', 'Ⅸ','Ⅹ'],
            ['◎','※', '→',  '←', '↑',  '↓', '┆', '￣', '＿', '√'],
            ['〓','℃', '∧', '∨','∝', '∞', '≈', '≌', '∽', '∈'],
            ['＋','－', '×',  '÷', '±',  '≤', '≥', '≠',  '∵', '∴'],
            ['α', 'β',  'γ',  'η', 'θ',  'λ', 'μ',  'ρ',  'σ', 'φ']
        ];
        var _html = '<table cellspacing=0 cellpadding=0>';
        for(var i = 0; i < chars.length; i++) {
            _html += '<tr>';
            for(var j = 0; j < chars[i].length; j++) {
                _html += '<td >';
                _html += '<a unselectable=on href=javascript:; val='+chars[i][j]+' >'+chars[i][j]+'</a>';
                _html += '</td>';
            }
            _html += '</tr>';
        }
        _html += '<tr><td colspan="10">'
        			+'<a id="special-char-more" href="javascript:;">更多&gt;&gt;</a></td></tr></table>'
        this.dom.innerHTML = _html;
	};
	
	
	/**=============================================toolbar拓展 ==========================================*/
	ToolBar.prototype.panels.hide = function() {
		for(key in this) {
			if('hide' != key) this[key].hide();
		}
	};
	
	//事件处理器
	ToolBar.prototype.handler = {
		btnClickHandler : function(event, toolbar) {
			var _target = $util.target(event||window.event);
	        var _btnId = _target.id || _target.parentNode.id;
		    var condition = _btnId.substring(12);
		    if(condition) toolbar.panels.hide();
	        switch(condition) { //点击工具栏
	            case 'bold' : 
	            case 'italic' : 
	            case 'underline' : 
	            case 'justifyLeft' : 
	            case 'justifyCenter' : 
	            case 'justifyRight' : 
	            case 'insertUnorderedList' : 
	            case 'insertOrderedList' : 
	            case 'indent' :  
	            case 'outdent' : 
	            case 'unlink' : 
	                document.execCommand(condition, false, null);return;
	            case 'createLink' : 
	            	var _url = prompt('请输入链接地址');
	            	document.execCommand(condition, false, _url);return;
	            case 'insertImage' : 
	            	var _url = prompt('请输入图片地址');
	            	document.execCommand(condition, false, _url);return;
	            case 'removeFormat' :  
	                document.execCommand(condition, false, null);
	                //兼容chrome、opera不能清除背景色
	            	document.execCommand('backColor', false, 'transparent'); return;
	            case 'foreColor' : 
	            case 'backColor' : 
	            case 'fontSize' : 
	            case 'fontName' : 
	            case 'specialChar' : 
	            case 'insertHorizontalRule' :
	            	toolbar.execKey = _btnId.substring(12);
					toolbar.panels[_btnId].show();return; //若包含panel，return；
	            default : break;
	        }
		},
		panelClickHandler : function(event, toolbar) {
			var _target = $util.target(event||window.event);
			var value = _target.getAttribute('val');
			if(!value) return false;
			switch(toolbar.execKey) {//点击面板按钮
	        	case 'foreColor' : 
	            case 'backColor' : 
	            case 'fontName' : 
	            	document.execCommand(toolbar.execKey, false, value);return;
	            case 'fontSize' : 
	            	try {
		            	var _spanNode = document.createElement('span');
		            	_spanNode.style.fontSize = value;
		            	$util.replaceNode(_spanNode); return;
	            	} catch(e) {
	            		return; //console.log('没有选中文本');
	            	}
	            case 'specialChar' : 
					try {
		            	var _spanNode = document.createElement('span');
		            	_spanNode.innerHTML = value;
		            	$util.insertNodeAtCaret(_spanNode); return;
	            	} catch(e) {
	            		return;//console.log('没有选中焦点');
	            	}
	            case 'insertHorizontalRule' :
		            try {
		            	var _hrNode = document.createElement('hr');
		            	_hrNode.style.cssText = value;
		            	$util.insertNodeAtCaret(_hrNode); return;
	            	} catch(e) {
	            		return; //console.log('没有选中焦点');
	            	}
	            default : break;
	        }
		}
	};

	ToolBar.prototype.edit = function(node) {
		if('string' == typeof node) {
			node = document.getElementById(node);
		}
		node = node || document.body;
		node.setAttribute('contenteditable', 'true');
		
		if(this.param.fixed) {
			return false;
		}
		
		var _this = this;
		node.onmouseup = function(event) {
			var e = event || window.event;
			_this.hide();
			var _scrollTop = document.documentElement.scrollTop || 
							window.pageYOffset || document.body.scrollTop;
			var bodyWidth = document.body.clientWidth;
			var barWidth = _this.width();
			var barHeight = _this.height();
			var clickTop = e.clientY + _scrollTop;
			
			var left = (bodyWidth - e.clientX) < barWidth ? bodyWidth - barWidth - 10 : e.clientX + 10;
			var top = clickTop < barHeight ? e.clientY + _scrollTop + 20 : e.clientY + _scrollTop - 80;
			_this.setPosition(left, top);
			
			_this.show();
			$util.unbubble(event);
		}
	};
	
	
	//定义buttons
	var btns = [
		{id:'toolbar-btn-bold',              title:'加粗',    text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-italic',            title:'斜体',    text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-underline',         title:'下划线',  text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-justifyLeft',       title:'左对齐',  text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-justifyCenter',     title:'剧中',    text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-justifyRight',      title:'右对齐',  text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-insertUnorderedList', title:'',      text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-insertOrderedList', title:'',        text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-indent',            title:'缩进',    text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-outdent',           title:'',        text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-createLink',        title:'链接',    text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-unlink',            title:'删除链接',text:'&nbsp;', arrows:false},
		'\n',
		{id:'toolbar-btn-insertImage',       title:'图片',     text:'&nbsp;', arrows:false},
		{id:'toolbar-btn-insertHorizontalRule',title:'水平线', text:'&nbsp;', arrows:true, panel:new HrPanel()},
		{id:'toolbar-btn-foreColor',         title:'前景色',   text:'&nbsp;', arrows:true, panel:new ColorPanel()},
		{id:'toolbar-btn-backColor',         title:'背景色',   text:'&nbsp;', arrows:true, panel:new ColorPanel()},
		{id:'toolbar-btn-fontSize',          title:'字号',     text:'字号',   arrows:true, panel:new SizePanel()},
		{id:'toolbar-btn-fontName',          title:'字体',     text:'字体',   arrows:true, panel:new FontPanel()},
		{id:'toolbar-btn-specialChar',       title:'特殊字符', text:'&nbsp;', arrows:true, panel:new CharPanel()},
		{id:'toolbar-btn-removeFormat',      title:'清除格式', text:'&nbsp;', arrows:false}
	];
	

	window.FishEditor = ToolBar;
	
})(window, undefined);
