//资源目录
var BASEURL;
//加载中视图的全局变量
var loadingIndicator;
//音乐播放列表
var audioList;
//推荐页面的
var singerInt;
//专辑的播放列表
var audioAlbumList;
//加载中视图的XML
var sortGeneral;
var pageGeneral;
var languageGeneral;
var yearGeneral;
var typeGeneral;
var genreGeneral;
var companyGeneral;
var ceilGeneral;
var sortsGeneral;
//自动翻页的全局变量
var autoTurnCurrentIndex;
var autoTurnLockupInt;
var loadingTemplate=`<?xml version="1.0" encoding="UTF-8" ?>
        <document>
          <loadingTemplate>
            <activityIndicator>
              <text>加载中...</text>
            </activityIndicator>
          </loadingTemplate>
        </document>`;
//推送XML到Stack(把XML显示在界面上)
function pushDoc(document)
{
    var parser = new DOMParser();
    var aDoc = parser.parseFromString(document, "application/xml");
    navigationDocument.pushDocument(aDoc);
}

//解析字符成XML
function loadDoc(document)
{
    var parser = new DOMParser();
    var aDoc = parser.parseFromString(document, "application/xml");
    return aDoc;
}

//TVJS的内置启动函数
App.onLaunch = function(options) {
	//objective-c传入TVJS的资源目录值
	BASEURL=options.BASEURL;
	//QQ音乐首页
	musicHome();
};

//新歌首发-华语和欧美
function newMusic(itemid,page)
{
	//显示 加载中视图 到当前界面中
	showLoadingIndicator();
	var d=newMusicPage(itemid,page);
	//indexOf 寻找字符中指定的字符
	if(d.indexOf("http")>-1)
	{
		var itemidStr="华语";
		if(itemid=="2")
		{
			itemidStr="欧美";
		}
		//下方 xml变量的赋值,是TVML中的Stack类型模版
		//其中 ` 返单引号是TVJS中规定的多行表示字符的一种方式
		//其中 ${BASEURL},这个是在反单引号中 使用的一个变量表示方式
		// ${BASEURL} 中的BASEURL就是刚声明的资源目录
		//下方style的标记是定制XML的样式的
		var xml=`<document>
  <head>
    <style>
      .lightBackgroundColor {
        background-color: #e49c36;
      }
    </style>
  </head>
  <stackTemplate theme="light" class="lightBackgroundColor" >
    <identityBanner>
      <heroImg src="${BASEURL}heroimg.png" width="1" height="1" />
      <title id="new">新歌首发</title>
      <row>
        <buttonLockup>
          <badge src="resource://button-rate" />
          <title>收藏</title>
        </buttonLockup>
        <buttonLockup onselect="showClearAudieListModal()">
          <badge src="${BASEURL}remove.png" width="80" height="80"/>
          <title>清空</title>
        </buttonLockup>
      </row>
    </identityBanner>
    <collectionList>
    <grid>
        <header>
          <title>${itemidStr}</title>
        </header>
        <section>${d}
      </section>
      </grid>
    </collectionList>
  </stackTemplate>
</document>`;
//在显示 加载中视图之后,进行的新歌首发XML解析并显示到当前界面
defaultPresenter(loadDoc(xml));
	}else
	{
		//如果遇到打开内容不符合要求,进行错误提示
		urlError(d,"最新华语出现错误!");
	}
}

//解析新歌首发-华语和欧美 的lockup
function newMusicPage(itemid,page)
{
	//javascriptTools.httpGetPhone是内定的打开网址的函数
	var d=javascriptTools.httpGetPhone("http://s.plcloud.music.qq.com/fcgi-bin/fcg_shoufa_cache.fcg?pagesize=30&typeid=10001&itemid="+itemid+"&page="+page+"&callback=jsonp"+itemid);
	if(d.indexOf("http")>-1)
	{
		audioList=[];
		
		var items="";
		//replace进行替换字符中指定的字符
		var dHtml=d.replace("jsonp1(", "");
		dHtml=dHtml.replace("jsonp2(", "");
		dHtml=dHtml.replace("})", "}");
		//JSON.parse进行JSON的解析
		//由于网址内容不完全符合JSON,所以要去掉一些不相干的字符
		var songlist=JSON.parse(dHtml)["songlist"];
		for(var i=0;i<songlist.length;i++)
		{
			//MediaItem是的一个音频项目(其中可以定义音频的标题,副标题,图片等)
			//MediaItem一个音频项目放入到播放列表中就能做成播放器
			var mediaItem = new MediaItem("audio", "http://ws.stream.qqmusic.qq.com/"+songlist[i]["songid"]+".m4a?fromtag=30");
			mediaItem.artworkImageURL="http://imgcache.qq.com/music/photo_new/T002R500x500M000"+songlist[i]["albummid"]+".jpg";
			mediaItem.title=songlist[i]["songname"];
			mediaItem.subtitle=songlist[i]["singername"];
			//mediaItem对象向后插入到audioList数组中
			audioList.push(mediaItem);
			//+= 拼接字符
			items+=`<lockup onselect="singlePlayer(${i})">
            <img src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${songlist[i]["albummid"]}.jpg" width="500" height="500" />
            <title class="scrollTextOnHighlight"><![CDATA[${songlist[i]["songname"]}]]></title>
            <subtitle><![CDATA[${songlist[i]["singername"]}]]></subtitle>
          </lockup>`;
		}
		return items;
	}
}

function recommendHome()
{
	showLoadingIndicator();
	//模拟PC的内置打开网址函数
	var d=javascriptTools.httpGetPC("http://i.y.qq.com/v8/fcg-bin/v8_4web.fcg?g_tk=5381&loginUin=0&hostUin=0&format=json&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=recomcallback&needNewCode=0");
	if(d.indexOf("albummid")>-1)
	{
		audioList=[];
		singerInt=0;
		d=d.replace(" recomcallback(", "");
		d=d.replace("})", "}");
		var data=JSON.parse(d)["data"];
		var xml=`<document>
  <head>
    <style>
      .lightBackgroundColor {
        background-color: #e49c36;
      }
      .titleMargin{
	    padding: 0;
      }
      .titleBackgroudColor{
      background-color: rgba(0,0,0,0.6);
      color: #FFFFFF;
      text-align: center;
      width: 300;
      }
    </style>
  </head>
  <stackTemplate theme="light" class="lightBackgroundColor" >
    <identityBanner>
      <heroImg src="${BASEURL}heroimg.png" width="1" height="1" />
      <title id="recomm">推荐</title>
      <row>
        <buttonLockup>
          <badge src="resource://button-rate" />
          <title>收藏</title>
        </buttonLockup>
        <buttonLockup onselect="showClearAudieListModal()">
          <badge src="${BASEURL}remove.png" width="80" height="80"/>
          <title>清空</title>
        </buttonLockup>
      </row>
    </identityBanner>
    <collectionList>
    </collectionList>
  </stackTemplate>
</document>`;
defaultPresenter(loadDoc(xml));
        //javscript 函数的定制
		recommObjectFun(data["ala1"],'ala1','album','shelf');
		recommObjectFun(data["slzx"],'slzx','','shelf');
		recommObjectFun(data["slk"],'slk','','shelf');
		recommObjectFun(data["sleu"],'sleu','','shelf');
		recommObjectFun(data["slzr"],'slzr','','shelf');
		recommObjectFun(data["slzhi"],'slzhi','','shelf');
		recommObjectFun(data["slneidi"],'slneidi','','shelf');
		recommObjectFun(data["slgangtai"],'slgangtai','','shelf');
		recommObjectFun(data["sloumei"],'sloumei','','shelf');
		recommObjectFun(data["slhanguo"],'slhanguo','','shelf');
	}else
	{
		urlError(d,"推荐页面出现错误!");
	}
}

function recommObjectFun(data,ids,action,grid,append)
{
	var objTitle=recomCategory(ids);
	
	var dataItems="<"+grid+"><header><title>"+objTitle+"</title></header><section>";
			
	for(var i=0;i<data.length;i++)
	{
		var albumid="";
		if(data[i]["mid"])
		{
			albumid=data[i]["mid"];
		}else if(data[i]["albumid"])
		{
			albumid=data[i]["albummid"];
		}
		
		var subtitleStr="";
		if(data[i]["name"])
		{
			subtitleStr=data[i]["name"];
		}else if(data[i]["songname"])
		{
			subtitleStr=data[i]["songname"];
		}
		
		if(action=="album")
		{
			dataItems+=`<lockup onselect="albummidHome('${albumid}')">
            <img src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${albumid}.jpg" width="300" height="300" />
            <title><![CDATA[${data[i]["singer"][0]["name"]}]]></title>
            <overlay class="titleMargin">
            <subtitle class="titleBackgroudColor"><![CDATA[${subtitleStr}]]></subtitle>
            </overlay>
          </lockup>`;
		}else if(action=="radio")
		{
			var mediaItem = new MediaItem("audio", "http://ws.stream.qqmusic.qq.com/"+data[i]["songid"]+".m4a?fromtag=30");
			mediaItem.artworkImageURL="http://imgcache.qq.com/music/photo_new/T002R500x500M000"+albumid+".jpg";
			mediaItem.title=data[i]["singer"][0]["name"];
			mediaItem.subtitle=subtitleStr;
			audioList.push(mediaItem);
			dataItems+=`<lockup onselect="singlePlayer(${i},'radio','${ids}')">
            <img src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${albumid}.jpg" width="300" height="300" />
            <title><![CDATA[${data[i]["singer"][0]["name"]}]]></title>
            <overlay class="titleMargin">
            <subtitle class="titleBackgroudColor"><![CDATA[${subtitleStr}]]></subtitle>
            </overlay>
          </lockup>`;
		}else
		{
			var mediaItem = new MediaItem("audio", "http://ws.stream.qqmusic.qq.com/"+data[i]["songid"]+".m4a?fromtag=30");
			mediaItem.artworkImageURL="http://imgcache.qq.com/music/photo_new/T002R500x500M000"+albumid+".jpg";
			mediaItem.title=data[i]["singer"][0]["name"];
			mediaItem.subtitle=subtitleStr;
			audioList.push(mediaItem);
			dataItems+=`<lockup onselect="singlePlayer(${singerInt})">
            <img src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${albumid}.jpg" width="300" height="300" />
            <title><![CDATA[${data[i]["singer"][0]["name"]}]]></title>
            <overlay class="titleMargin">
            <subtitle class="titleBackgroudColor"><![CDATA[${subtitleStr}]]></subtitle>
            </overlay>
          </lockup>`;
          singerInt++;
		}
			
	}
	dataItems+="</section></"+grid+">";
	//下面是 javascript 高级语言中的一个推送一段XML到当前的界面中
	//具体是百度parseWithContext就能看到一点介绍
	//由于这个大部分在一本高级语言的书中,关于这个具体介绍比较少
	//可能是和语言的热门程度有关系吧
	var doc=navigationDocument.documents.pop();
	if(append=="append")
	{
	if(doc.getElementById("radio"))
	{
		var domImplementation = doc.implementation;
    var lsParser = domImplementation.createLSParser(1, null);
    var lsInput = domImplementation.createLSInput();
    lsInput.stringData=dataItems;
    lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2);
	}
	}else
	{
		var domImplementation = doc.implementation;
    var lsParser = domImplementation.createLSParser(1, null);
    var lsInput = domImplementation.createLSInput();
    lsInput.stringData=dataItems;
    lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 1);
	}
}

//显示电台首页的函数
function radioHome(ids)
{
	showLoadingIndicator();
	//获取时间戳
	var timestamp=new Date().getTime();
	var d=javascriptTools.httpGetPC("http://radio.cloud.music.qq.com/fcgi-bin/qm_guessyoulike_cp.fcg?start=-1&num=20&uin=0&labelid="+ids+"&rnd="+timestamp+"&g_tk=5381&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=FmJsonpCallBack&needNewCode=1");
	if(d.indexOf("albummid")>-1)
	{
		audioList=[];
		singerInt=0;
		d=d.replace("FmJsonpCallBack(", "");
		d=d.replace("})", "}");
		var songs=JSON.parse(d)["songs"];
		var cateStr=recomCategory(ids);
		var xml=`<document>
  <head>
    <style>
      .lightBackgroundColor {
        background-color: #e49c36;
      }
      .titleMargin{
	    padding: 0;
      }
      .titleBackgroudColor{
      background-color: rgba(0,0,0,0.6);
      color: #FFFFFF;
      text-align: center;
      width: 300;
      }
    </style>
  </head>
  <stackTemplate theme="light" class="lightBackgroundColor" >
    <identityBanner>
      <heroImg src="${BASEURL}heroimg.png" width="1" height="1" />
      <title id="radio">电台-${cateStr}</title>
      <row>
        <buttonLockup>
          <badge src="resource://button-rate" />
          <title>收藏</title>
        </buttonLockup>
        <buttonLockup onselect="showClearAudieListModal()">
          <badge src="${BASEURL}remove.png" width="80" height="80"/>
          <title>清空</title>
        </buttonLockup>
      </row>
    </identityBanner>
    <collectionList>
    </collectionList>
  </stackTemplate>
</document>`;
defaultPresenter(loadDoc(xml));
		recommObjectFun(songs,ids,'radio','grid');
	}else
	{
		urlError(d,"电台-"+recomCategory(ids)+" 首页出错!");
	}
}

//显示排行榜首页的函数
function topListHome(ids,validDate)
{
	showLoadingIndicator();
	var myDate = new Date();
	var formatTime="";
	if(validDate!="")
	{
		monthNum=validDate;
	}else
	{
	var dateNum=Number(myDate.getDate())-1;
	var monthNum=Number(myDate.getMonth())+1;
	if(monthNum<10)
	{
		monthNum="0"+monthNum;
	}
	formatTime=myDate.getFullYear()+"-"+monthNum+"-"+dateNum;
	}
	
	var timestamp=myDate.getTime();
	var d=javascriptTools.httpGetPC("http://i.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?tpl=20&page=detail&date="+formatTime+"&type=top&topid="+ids+"&g_tk=5381&loginUin=0&hostUin=0&format=json&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=toplistSongList"+timestamp+"&needNewCode=0");
	if(d.indexOf("albummid")>-1)
	{
		audioList=[];
		d=d.replace(" toplistSongList"+timestamp+"(", "");
		d=d.replace("}\n)", "}");
	
		var songs=JSON.parse(d)["songlist"];
		
		var cateStr=recomCategory(ids);
		var xml=`<document>
  <head>
    <style>
      .lightBackgroundColor {
        background-color: #e49c36;
      }
      .titleMargin{
	    padding: 0;
      }
      .titleHighlight{
	    tv-text-max-lines: 3;
      }
      .titleBackgroudColor{
      background-color: rgba(0,0,0,0.6);
      color: #FFFFFF;
      text-align: center;
      width: 300;
      }
    </style>
  </head>
  <stackTemplate theme="light" class="lightBackgroundColor" >
    <identityBanner>
      <heroImg src="${BASEURL}heroimg.png" width="1" height="1" />
      <title id="top">排行榜-${cateStr}</title>
      <row>
        <buttonLockup>
          <badge src="resource://button-rate" />
          <title>收藏</title>
        </buttonLockup>
        <buttonLockup onselect="showClearAudieListModal()">
          <badge src="${BASEURL}remove.png" width="80" height="80"/>
          <title>清空</title>
        </buttonLockup>
      </row>
    </identityBanner>
    <collectionList>
    </collectionList>
  </stackTemplate>
</document>`;
defaultPresenter(loadDoc(xml));
topListOjectFun(songs,ids,'','grid');
	}else
	{
		urlError(d,"排行榜-"+recomCategory(ids)+" 首页出错!");
	}
}

function topListOjectFun(data,ids,action,grid)
{
	var objTitle=recomCategory(ids);

			var dataItems="<"+grid+"><header><title>"+objTitle+"</title></header><section>";
	for(var i=0;i<data.length;i++)
	{
		var cuttrentData=data[i]["data"];
		var albumid="";
		if(cuttrentData["albummid"])
		{
			albumid=cuttrentData["albummid"];
		}
		
		var subtitleStr="";
		if(cuttrentData["songname"])
		{
			subtitleStr=cuttrentData["songname"];
		}
		
		var singerStr="";
		if(cuttrentData["singer"][0]["name"])
		{
			singerStr=cuttrentData["singer"][0]["name"];
		}
		
		var mediaItem = new MediaItem("audio", "http://ws.stream.qqmusic.qq.com/"+cuttrentData["songid"]+".m4a?fromtag=30");
			mediaItem.artworkImageURL="http://imgcache.qq.com/music/photo_new/T002R500x500M000"+albumid+".jpg";
			mediaItem.title=subtitleStr;
			mediaItem.subtitle=singerStr;
			audioList.push(mediaItem);
		
		dataItems+=`<lockup onselect="singlePlayer(${i})">
            <img src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${albumid}.jpg" width="300" height="300" />
            <title class="titleHighlight"><![CDATA[${subtitleStr}]]></title>
            <overlay class="titleMargin">
            <subtitle class="titleBackgroudColor"><![CDATA[${singerStr}]]></subtitle>
            </overlay>
          </lockup>`;	
	}
	dataItems+="</section></"+grid+">";
	var doc=navigationDocument.documents.pop();
		var domImplementation = doc.implementation;
    var lsParser = domImplementation.createLSParser(1, null);
    var lsInput = domImplementation.createLSInput();
    lsInput.stringData=dataItems;
    lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 1);
} 

//在显示 "加载中"视图之后,推送XML到当前界面中
function defaultPresenter(xml) {
	if(this.loadingIndicatorVisible) {
		navigationDocument.replaceDocument(xml,loadingIndicator);
		this.loadingIndicatorVisible = false;
	} else {
		navigationDocument.pushDocument(xml);
	}
}

//所有ID的类别分类
function recomCategory(ids)
{
	if(ids=="ala1")
	{
		return "在线首发-专辑";
	}else if(ids=="slzx")
	{
		return "最新推荐华语-单曲";
	}else if(ids=="slk")
	{
		return "最新推荐韩语-单曲";
	}else if(ids=="sleu")
	{
		return "最新推荐欧美-单曲";
	}else if(ids=="slzr")
	{
		return "最热推荐-单曲";
	}else if(ids=="slzhi")
	{
		return "巅峰榜-流行";
	}else if(ids=="slneidi")
	{
		return "巅峰榜-内地";
	}else if(ids=="slgangtai")
	{
		return "巅峰榜-港台";
	}else if(ids=="sloumei")
	{
		return "巅峰榜-欧美";
	}else if(ids=="slhanguo")
	{
		return "巅峰榜-韩国";
	}else if(ids=="118")
	{
		return "华语";
	}else if(ids=="119")
	{
		return "粤语";
	}else if(ids=="120")
	{
		return "欧美";
	}else if(ids=="150")
	{
		return "韩语";
	}else if(ids=="149")
	{
		return "日语";
	}else if(ids=="272")
	{
		return "闽南语";
	}else if(ids=="4")
	{
		return "巅峰榜-流行排行";
	}else if(ids=="26")
	{
		return "巅峰榜-热歌排行";
	}else if(ids=="27")
	{
		return "巅峰榜-新歌排行";
	}else if(ids=="28")
	{
		return "巅峰榜-网络热歌排行";
	}else if(ids=="5")
	{
		return "巅峰榜-内地排行";
	}else if(ids=="6")
	{
		return "巅峰榜-香港排行";
	}else if(ids=="3")
	{
		return "巅峰榜-欧美排行";
	}else if(ids=="16")
	{
		return "巅峰榜-韩国排行";
	}else if(ids=="29")
	{
		return "巅峰榜-影视金曲排行";
	}else if(ids=="20")
	{
		return "巅峰榜-全民K歌排行";
	}else if(ids=="17")
	{
		return "巅峰榜-日本排行";
	}else if(ids=="23")
	{
		return "巅峰榜-畅销排行";
	}else if(ids=="19")
	{
		return "巅峰榜-摇滚排行";
	}else if(ids=="18")
	{
		return "巅峰榜-民谣排行";
	}else if(ids=="169")
	{
		return "巅峰榜-vido手机排行";
	}else if(ids=="165")
	{
		return "巅峰榜-粤语排行";
	}else if(ids=="161")
	{
		return "巅峰榜-动漫排行";
	}else if(ids=="163")
	{
		return "巅峰榜-双语排行";
	}else if(ids=="113")
	{
		return "巅峰榜-香港电台排行";
	}
	return "";
}

//打开网址错误之后,发生相关代码的错误信息
function urlError(errorId,errorCategory)
{
	switch(errorId)
	{
		case '-1000':
		errorAlert("错误","坏的链接!");
		break;
		case '-1001':
		errorAlert("错误","连接超时!");
		break;
		case '-1003':
		errorAlert("错误","不能找到主机!");
		break;
		case '-1004':
		errorAlert("错误","不能连接上主机!");
		break;
		case '-1006':
		errorAlert("错误","DNS查询错误!");
		break;
		case '-1009':
		errorAlert("错误","你的Apple TV4没有连接互联网!");
		break;
		case '-1100':
		errorAlert("错误","文件资源不存在!");
		break;
		case '-1101':
		errorAlert("错误","文件是一个目录!");
		break;
		case '-1102':
		errorAlert("错误","文件没有读取权限!");
		break;
		case '-1200':
		errorAlert("错误","SSL连接错误!");
		break;
		case '-1205':
		errorAlert("错误","SSL证书被拒绝!");
		break;
		case '-2000':
		errorAlert("错误","SSL不能网络负载!");
		break;
		case '-997':
		errorAlert("错误","Session被关闭!");
		break;
		default:
		errorAlert("错误 "+errorId,errorCategory);
	}
}

//显示"加载中"视图到当前界面中
function showLoadingIndicator() {
	this.loadingIndicatorVisible=false;
        /*
        You can reuse documents that have previously been created. In this implementation
        we check to see if a loadingIndicator document has already been created. If it 
        hasn't then we create one.
        */
        if (!loadingIndicator) {
            loadingIndicator = loadDoc(loadingTemplate);
        }
        
        /* 
        Only show the indicator if one isn't already visible and we aren't presenting a modal.
        */
        if (!this.loadingIndicatorVisible) {
            navigationDocument.pushDocument(loadingIndicator);
            this.loadingIndicatorVisible = true;
        }
    }

//从视图堆栈Stack中 移除"加载中"视图
function removeLoadingIndicator() {
        if (this.loadingIndicatorVisible) {
            navigationDocument.removeDocument(loadingIndicator);
            this.loadingIndicatorVisible = false;
        }
    }

//在加载过程中错误时候,调用该函数
function errorAlert(title,description)
{
	removeLoadingIndicator();
	var alertString = `<document>
          <alertTemplate>
            <title><![CDATA[${title}]]></title>
            <description><![CDATA[${description}]]></description>
          </alertTemplate>
        </document>`;
    var parser = new DOMParser();
    var alertDoc = parser.parseFromString(alertString, "application/xml");
    navigationDocument.presentModal(alertDoc);
}

//音乐首页
function musicHome()
{
	var xml=`<document>
  <head>
    <style>
      .lightBackgroundColor {
        background-color: #e49c36;
      }
      .circleImg{
	      tv-img-treatment: corner-small;
      }
      .highlightText{
	      tv-text-highlight-style: show-on-highlight;
      }
    </style>
  </head>
  <stackTemplate theme="light" class="lightBackgroundColor" >
    <identityBanner>
      <heroImg src="${BASEURL}heroimg.png" width="200" height="200" />
      <title id="qqHome">QQ音乐</title>
      <subtitle>你的音乐</subtitle>
      <row>
        <buttonLockup>
          <badge src="resource://button-rate" />
          <title>收藏</title>
        </buttonLockup>
        <buttonLockup onselect="showClearAudieListModal()">
          <badge src="${BASEURL}remove.png" width="80" height="80"/>
          <title>清空</title>
        </buttonLockup>
      </row>
    </identityBanner>
    <collectionList>
      <shelf>
        <header>
          <title>新歌首发</title>
        </header>
        <section>
          <lockup onselect="newMusic('1','1')">
            <img class="circleImg" src="${BASEURL}fist_Chinese.png" width="230" height="230" />
            <title class="highlightText">华语</title>
          </lockup>
          <lockup onselect="newMusic('2','1')">
            <img class="circleImg" src="${BASEURL}fist_occident.png" width="230" height="230" />
            <title class="highlightText">欧美</title>
          </lockup>
          <lockup onselect="recommendHome()">
            <img class="circleImg" src="${BASEURL}fisr_recom.png" width="230" height="230" />
            <title class="highlightText">推荐</title>
          </lockup>
          <lockup onselect="albumFilterHome()">
            <img class="circleImg" src="${BASEURL}zhuanji.png" width="230" height="230" />
            <title class="highlightText">专辑</title>
          </lockup>
          <lockup onselect="songListHome()">
            <img class="circleImg" src="${BASEURL}gedan.png" width="230" height="230" />
            <title class="highlightText">歌单</title>
          </lockup>
          <lockup onselect="searchHome()">
            <img class="circleImg" src="${BASEURL}fisr_search.png" width="230" height="230" />
            <title class="highlightText">搜索</title>
          </lockup>
          <lockup>
            <img class="circleImg" src="${BASEURL}fav.png" width="230" height="230" />
            <title class="highlightText">收藏</title>
          </lockup>
        </section>
      </shelf>
      <shelf>
        <header>
          <title>电台</title>
        </header>
        <section>
          <lockup onselect="radioHome('118')">
            <img class="circleImg" src="${BASEURL}radio_hua.png" width="230" height="230" />
            <title class="highlightText">华语</title>
          </lockup>
          <lockup onselect="radioHome('119')">
            <img class="circleImg" src="${BASEURL}radio_yue.png" width="230" height="230" />
            <title class="highlightText">粤语</title>
          </lockup>
          <lockup onselect="radioHome('120')">
            <img class="circleImg" src="${BASEURL}radio_ou.png" width="230" height="230" />
            <title class="highlightText">欧美</title>
          </lockup>
          <lockup onselect="radioHome('150')">
            <img class="circleImg" src="${BASEURL}radio_han.png" width="230" height="230" />
            <title class="highlightText">韩语</title>
          </lockup>
          <lockup onselect="radioHome('149')">
            <img class="circleImg" src="${BASEURL}radio_jp.png" width="230" height="230" />
            <title class="highlightText">日语</title>
          </lockup>
          <lockup onselect="radioHome('272')">
            <img class="circleImg" src="${BASEURL}radio_min.png" width="230" height="230" />
            <title class="highlightText">闽南语</title>
          </lockup>
        </section>
      </shelf>
      <shelf>
        <header>
          <title>排行榜</title>
        </header>
        <section>
          <lockup onselect="topListHome('4','2016-03-19')">
            <img class="circleImg" src="${BASEURL}liuxing.png" width="280" height="149" />
            <title class="highlightText">流行</title>
          </lockup>
          <lockup onselect="topListHome('5','2016_10')">
            <img class="circleImg" src="${BASEURL}neidi-2.png" width="280" height="149" />
            <title class="highlightText">内地</title>
          </lockup>
          <lockup onselect="topListHome('6','2016_10')">
            <img class="circleImg" src="${BASEURL}gang.png" width="280" height="149" />
            <title class="highlightText">香港</title>
          </lockup>
          <lockup onselect="topListHome('16','2016_10')">
            <img class="circleImg" src="${BASEURL}hanguo.png" width="280" height="149" />
            <title class="highlightText">韩国</title>
          </lockup>
          <lockup onselect="topListHome('3','2016_10')">
            <img class="circleImg" src="${BASEURL}oumei.png" width="280" height="149" />
            <title class="highlightText">欧美</title>
          </lockup>
          <lockup onselect="topListHome('17','2016_10')">
            <img class="circleImg" src="${BASEURL}riben.png" width="280" height="149" />
            <title class="highlightText">日本</title>
          </lockup>
          <lockup onselect="topListHome('113','2016_10')">
            <img class="circleImg" src="${BASEURL}xgdt.png" width="280" height="149" />
            <title class="highlightText">香港电台</title>
          </lockup>
          <lockup onselect="topListHome('29','2016_10')">
            <img class="circleImg" src="${BASEURL}ysjq.png" width="280" height="149" />
            <title class="highlightText">影视金曲</title>
          </lockup>
          <lockup onselect="topListHome('161','2016-03-10')">
            <img class="circleImg" src="${BASEURL}dmq.png" width="280" height="149" />
            <title class="highlightText">动漫曲</title>
          </lockup>
        </section>
      </shelf>
    </collectionList>
  </stackTemplate>
</document>`;
pushDoc(xml);
}

//单独音乐播放器
//不管你选择列表中的哪首歌曲播放之后,都能显示前面的歌曲
//如果第一次选择第5手首歌播放之后,第二次选择第2首歌曲.会重新从第二首开始
//==============================================
//整个思路就是播放器只能从第一个开始播放
//如果选择第5首歌,就删除前面4首歌曲,把前面4首的mediaitem array删除并备份出来
//这个时候从第5首开始播放了
//但是歌单第5首变成第一个了,前面的4首也没了
//在播放歌曲之后再放入之前删除的歌单mediaitem array
function singlePlayer(ids,action,labelid)
{
	//复制audioList数组中一个范围的mediaitem,变成新的数组
   var tempArray=audioList.slice(0,ids);
   //创建新的播放器
   var player = new Player();
   //创建播放器的播放列表
   player.playlist = new Playlist();
   //插入mediaitem Array数组
   //splice第一个参数的添加删除位置
   //splice第二个参数的是删除的数量,为0就是添加
   player.playlist.splice(0,0,audioList);
   //先删除一个范围的mediaitem
   player.playlist.splice(0,ids);
   //开始播放
   player.present();
   //在播放之后在第一个位置插入刚删除部分的mediaitem Array数组
   player.playlist.splice(0,0,tempArray);

   if(action=="radio")
   {
	   player.addEventListener("mediaItemDidChange", function(event){
		   if(event.target.nextMediaItem==undefined)
		   {
			   var timestamp=new Date().getTime();
		   var d=javascriptTools.httpGetPC("http://radio.cloud.music.qq.com/fcgi-bin/qm_guessyoulike_cp.fcg?start=-1&num=20&uin=0&labelid="+labelid+"&rnd="+timestamp+"&g_tk=5381&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=FmJsonpCallBack&needNewCode=1");
		   if(d.indexOf("albumid")>-1)
		   {
			   audioList=[];
			   singerInt=0;
			   d=d.replace("FmJsonpCallBack(", "");
			   d=d.replace("})", "}");
			   var songs=JSON.parse(d)["songs"];
			   recommObjectFun(songs,labelid,'radio','grid','append');
			   singlePlayer(0,'radio',labelid);
		   }
		   }
	   });
   }
}

//专辑首页
function albummidHome(ids)
{
	showLoadingIndicator();
	var myDate = new Date();
	var timestamp=myDate.getTime();
	var d=javascriptTools.httpGetPC("http://i.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg?albummid="+ids+"&g_tk=5381&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=albumSonglist"+timestamp+"&needNewCode=0");
	if(d.indexOf("albumid")>-1)
	{
		audioAlbumList=[];
		d=d.replace(" albumSonglist"+timestamp+"(", "");
		d=d.replace("})", "}");
		var data=JSON.parse(d)["data"];
		var xml=`<document>
  <head>
    <style>
    .showTextOnHighlight {
      tv-labels-state: show-on-highlight;
    }
    @media -tv-template and (-tv-uber) {
      .darkBackgroundColor {
        background-color: rgb(4, 27, 97);
      }
    }
    .monogramCircle{
	    tv-img-treatment: circle;
	    tv-align: center;
    }
    .titleMargin{
	    padding: 0;
      }
      .titleBackgroudColor{
      background-color: rgba(134,195,81,0.6);
      color: #FFFFFF;
      text-align: center;
      width: 300;
      }
      .shelfLayout {
      padding: 40 40 40 90;
    }
    </style>
  </head>
  <stackTemplate class="darkBackgroundColor" theme="dark">
    <banner>
        <heroImg class="monogramCircle" src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${ids}.jpg" width="250" height="250" />
      <description><![CDATA[${data["desc"]}]]></description>
      <title><![CDATA[${data["company"]}]]></title>
      <title><![CDATA[${data["aDate"]}]]></title>
    </banner>
    <collectionList></collectionList>
  </stackTemplate>
</document>`;
defaultPresenter(loadDoc(xml));
albumObjectFun(data["list"],'grid');
	}else
	{
		urlError(d,"打开专辑首页出错!");
	}
}

//专辑部分解析成lockup
function albumObjectFun(data,grid)
{
	var dataItems="<"+grid+" class=\"shelfLayout\"><header><title></title></header><section>";
			
	for(var i=0;i<data.length;i++)
	{
		var albumid="";
		if(data[i]["mid"])
		{
			albumid=data[i]["mid"];
		}else if(data[i]["albumid"])
		{
			albumid=data[i]["albummid"];
		}
		
		var subtitleStr="";
		if(data[i]["name"])
		{
			subtitleStr=data[i]["name"];
		}else if(data[i]["songname"])
		{
			subtitleStr=data[i]["songname"];
		}
		
			var mediaItem = new MediaItem("audio", "http://ws.stream.qqmusic.qq.com/"+data[i]["songid"]+".m4a?fromtag=30");
			mediaItem.artworkImageURL="http://imgcache.qq.com/music/photo_new/T002R500x500M000"+albumid+".jpg";
			mediaItem.title=data[i]["singer"][0]["name"];
			mediaItem.subtitle=subtitleStr;
			audioAlbumList.push(mediaItem);
			dataItems+=`<lockup onselect="albumPlayer(${i})">
            <img src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${albumid}.jpg" width="300" height="300" />
            <title><![CDATA[${data[i]["singer"][0]["name"]}]]></title>
            <overlay class="titleMargin">
            <subtitle class="titleBackgroudColor"><![CDATA[${subtitleStr}]]></subtitle>
            </overlay>
          </lockup>`;	
	}
	dataItems+="</section></"+grid+">";
	var doc=navigationDocument.documents.pop();
		var domImplementation = doc.implementation;
    var lsParser = domImplementation.createLSParser(1, null);
    var lsInput = domImplementation.createLSInput();
    lsInput.stringData=dataItems;
    lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 1);
}

//专辑的音乐播放器
function albumPlayer(ids)
{ 
   var tempArray=audioAlbumList.slice(0,ids);
   var player = new Player();
   player.playlist = new Playlist();
   player.playlist.splice(0,0,audioAlbumList);
   player.playlist.splice(0,ids);
   player.present();
   player.playlist.splice(0,0,tempArray);  
}

//显示清空播放列表的提示框
function showClearAudieListModal()
{
	var alertString = `<document>
  <alertTemplate>
  	<title>清空</title>
    <description>清空播放列表</description>
    //关闭透明弹窗
    <button onselect="dismissModal()">
    <title>否</title>
    </button>
    <button onselect="emptyAudieList()">
    <title>是(?)</title>
    </button>
  </alertTemplate>
</document>`

    var parser = new DOMParser();
    var alertDoc = parser.parseFromString(alertString, "application/xml");
    //弹出透明弹窗
    navigationDocument.presentModal(alertDoc);
}

function emptyAudieList()
{
	audioAlbumList=[];
	audioList=[];
	dismissModal();
}

//关闭presentModal
function dismissModal()
{
	navigationDocument.dismissModal();
}

function albumSiftHome()
{
	showLoadingIndicator();
	var d=javascriptTools.httpGetPC("http://i.y.qq.com/v8/fcg-bin/album_library?g_tk=5381&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=GetAlbumListJsonCallback&needNewCode=0&cmd=get_album_info&page=0&pagesize=30&sort=2&language=-1&genre=0&year=1&pay=0&type=-1&company=-1");
	if(d.indexOf("albumid")>-1)
	{
		
	}else
	{
		urlError(d,"打开专辑分类筛选首页出错!");
	}
}

//专辑分类首页
function albumFilterHome()
{
	var xml=`<document>
    <head>
      <style>
      .greyText {
        color: rgba(137, 141, 146,1);
      }
      .pageText {
        color: rgb(255, 155, 58);
      }
      .sortText {
        color: rgb(61, 205, 53);
      }
      .clearText {
        color: rgb(173, 182, 253);
      }
      .showTextOnHighlight {
      tv-text-highlight-style: marquee-on-highlight;
      }
      .titleMargin{
	    padding: 0;
	    margin: 0;
      }
      .titleBackgroudColor{
      background-color: rgba(0,0,0,0.6);
      color: #FFFFFF;
      text-align: center;
      width: 300;
      padding: 0;
	    margin: 0;
      }
      </style>
    </head>
    <catalogTemplate>
      <banner>
        <title>专辑</title>
      </banner>
      <list>
      <relatedContent>
      </relatedContent>
        <section>
          <header>
            <title>专辑筛选</title>
          </header>
          <listItemLockup onselect="albumFilterAlert('排序','0','2,最热|1,最新')">
            <title class="sortText">排序</title>
            <decorationLabel>最新</decorationLabel>
          </listItemLockup>
          <listItemLockup onselect="nextPageAlert()">
            <title class="pageText">页码</title>
            <decorationLabel>1</decorationLabel>
          </listItemLockup>
          <listItemLockup onselect="clearnOpitonAlert()">
            <title class="clearText">清空条件</title>
          </listItemLockup>
          <listItemLockup onselect="albumFilterAlert('语言','1','-1,全部|0,国语|1,粤语|5,英语|4,韩语|3,日语|6,法语|16,西班牙语')">
            <title class="greyText">语言</title>
            <decorationLabel>全部</decorationLabel>
          </listItemLockup>
          <listItemLockup onselect="albumFilterAlert('流派','2','0,全部|1,流行|2,古典|3,爵士|36,摇滚|22,电子|27,拉丁|21,轻音乐|39,世界|34,嘻哈|37,影视原声|19,乡村|20,舞曲|33,R&amp;B|23,民谣|28,金属')">
            <title class="greyText">流派</title>
            <decorationLabel>全部</decorationLabel>
          </listItemLockup>
          <listItemLockup onselect="albumFilterAlert('年代','3','1,全部|2,10年代|3,00年代|4,90年代|5,80年代|6,70年代')">
            <title class="greyText">年代</title>
            <decorationLabel>全部</decorationLabel>
          </listItemLockup>
          <listItemLockup onselect="albumFilterAlert('类别','4','-1,全部|0,专辑|11,EP|10,Single|1,演唱会|3,动漫|4,游戏')">
            <title class="greyText">类别</title>
            <decorationLabel>全部</decorationLabel>
          </listItemLockup>
          <listItemLockup onselect="albumFilterAlert('唱片公司','5','-1,全部|3,华纳唱片|5,索尼唱片|35,环球唱片|2317,杰威尔音乐|2,英皇唱片|10,福茂唱片|373,金牌大风|1021,YG|1360,少城时代|20,华谊兄弟|1065,当然娱乐|7913,梦响强音|2597,梦响当然|1020,乐华圆娱|6958,Cube')">
            <title class="greyText">唱片公司</title>
            <decorationLabel>全部</decorationLabel>
          </listItemLockup>
        </section>
      </list>
    </catalogTemplate>
  </document>`;
pushDoc(xml);
albumFilterPush('0','1','-1','0','1','-1','-1');
}

function albumFilterPush(page,sort,language,genre,year,type,company)
{
	var d=javascriptTools.httpGetPC("http://i.y.qq.com/v8/fcg-bin/album_library?g_tk=5381&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=GetAlbumListJsonCallback&needNewCode=0&cmd=get_album_info&page="+page+"&pagesize=100&sort="+sort+"&language="+language+"&genre="+genre+"&year="+year+"&pay=0&type="+type+"&company="+company);
	if(d.indexOf("album_id")>-1)
	{
		pageGeneral=page;
		sortGeneral=sort;
		languageGeneral=language;
		typeGeneral=type;
		yearGeneral=year;
		genreGeneral=genre;
		companyGeneral=company;
		d=d.replace("GetAlbumListJsonCallback(", "");
		d=d.replace("})", "}");
		var data=JSON.parse(d)["data"];

		var pagesize=data["pagesize"];
		var sum=data["sum"];
		var pageRem=Number(sum)/Number(pagesize);
		
		ceilGeneral=Math.ceil(pageRem);
		
		var albumlist=data["albumlist"];
		var items="";
		var varGrid="<grid><section>";
		for(var i=0;i<albumlist.length;i++)
		{
			var album_mid=albumlist[i]["album_mid"];
			var album_name=albumlist[i]["album_name"];
			var public_time=albumlist[i]["public_time"];
			var singer_name=albumlist[i]["singers"][0]["singer_name"];
			items+=`<lockup onselect="albummidHome('${album_mid}')">
            <img src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${album_mid}.jpg" width="300" height="300" />
            <title class="showTextOnHighlight"><![CDATA[${album_name}]]></title>
            <subtitle><![CDATA[${singer_name}]]></subtitle>
          </lockup>`;
		}
		varGrid+=items;
		varGrid+="</section></grid>";
	
		var doc=navigationDocument.documents.pop();
		var domImplementation = doc.implementation;
		var lsParser = domImplementation.createLSParser(1, null);
		var lsInput = domImplementation.createLSInput();
		lsInput.stringData=varGrid;
		lsParser.parseWithContext(lsInput, doc.getElementsByTagName("relatedContent").item(0), 2);
	}
}

function albumFilterAlert(titlea,cale,ids)
{
	var ctArray=ids.split("|");
	var items="";
	for(var i=0;i<ctArray.length;i++)
	{
		var cutString=ctArray[i].split(",");
		var currenttitles=cutString[1].replace("&", "&amp;");
		items+=`<button onselect="filterID('${cale}','${cutString[0]}','${currenttitles}')">
                <title>${currenttitles}</title>
                </button>`;
	}
	var alertString = `<document>
  <alertTemplate>
  	<title>${titlea}</title>${items}
  </alertTemplate>
</document>`
    var parser = new DOMParser();
    var alertDoc = parser.parseFromString(alertString, "application/xml");
    //弹出透明弹窗
    navigationDocument.presentModal(alertDoc);
}

function clearnOpitonAlert()
{
	var alertString = `<document>
  <alertTemplate>
  	<title>清空筛选条件</title>
  	<button onselect="dismissModal()">
    <title>否</title>
    </button>
    <button onselect="clearnFilterOption()">
    <title>是(?)</title>
    </button>
  </alertTemplate>
</document>`
    var parser = new DOMParser();
    var alertDoc = parser.parseFromString(alertString, "application/xml");
    //弹出透明弹窗
    navigationDocument.presentModal(alertDoc);
}

function nextPageAlert()
{
	var items="";
	for(var i=0;i<ceilGeneral;i++)
	{
		if(i<100)
		{
			items+=`<button onselect="nextPageFun(${i})">
    <title>第${i+1}页</title>
    </button>`;
		}
	}
	var alertString = `<document>
  <alertTemplate>
  	<title>翻页</title>${items}
  </alertTemplate>
</document>`;
    var parser = new DOMParser();
    var alertDoc = parser.parseFromString(alertString, "application/xml");
    //弹出透明弹窗
    navigationDocument.presentModal(alertDoc);
}

function nextPageFun(ids)
{
	dismissModal();
albumFilterPush(ids,sortGeneral,languageGeneral,genreGeneral,yearGeneral,typeGeneral,companyGeneral);
var lastNav=navigationDocument.documents.pop();

lastNav.getElementsByTagName("decorationLabel").item(1).textContent=ids+1;
}

function clearnFilterOption()
{
	var alertString = `<document>
  <alertTemplate>
  	<title>清空筛选条件</title>
  	<button onselect="dismissModal()">
    <title>否</title>
    </button>
    <button onselect="clearnFilterOption()">
    <title>是(?)</title>
    </button>
  </alertTemplate>
</document>`
    var parser = new DOMParser();
    var alertDoc = parser.parseFromString(alertString, "application/xml");
    //弹出透明弹窗
    navigationDocument.presentModal(alertDoc);
}

function filterID(cale,selectIndex,selectTitle)
{
	if(cale=="0")
	{
		dismissModal();
		albumFilterPush('0',selectIndex,languageGeneral,genreGeneral,yearGeneral,typeGeneral,companyGeneral);
		var lastNav=navigationDocument.documents.pop();
		 lastNav.getElementsByTagName("decorationLabel").item(0).textContent=selectTitle;
		 lastNav.getElementsByTagName("decorationLabel").item(1).textContent="1";
	}else if(cale=="1")
	{
		dismissModal();
		albumFilterPush('0',sortGeneral,selectIndex,genreGeneral,yearGeneral,typeGeneral,companyGeneral);
		var lastNav=navigationDocument.documents.pop();
		 lastNav.getElementsByTagName("decorationLabel").item(2).textContent=selectTitle;
		 lastNav.getElementsByTagName("decorationLabel").item(1).textContent="1";
	}else if(cale=="2")
	{
		dismissModal();
		albumFilterPush('0',sortGeneral,languageGeneral,selectIndex,yearGeneral,typeGeneral,companyGeneral);
		var lastNav=navigationDocument.documents.pop();
		 lastNav.getElementsByTagName("decorationLabel").item(3).textContent=selectTitle;
		 lastNav.getElementsByTagName("decorationLabel").item(1).textContent="1";
	}else if(cale=="3")
	{
		dismissModal();
		albumFilterPush('0',sortGeneral,languageGeneral,genreGeneral,selectIndex,typeGeneral,companyGeneral);
		var lastNav=navigationDocument.documents.pop();
		 lastNav.getElementsByTagName("decorationLabel").item(4).textContent=selectTitle;
		 lastNav.getElementsByTagName("decorationLabel").item(1).textContent="1";
	}else if(cale=="4")
	{
		dismissModal();
		albumFilterPush('0',sortGeneral,languageGeneral,genreGeneral,yearGeneral,selectIndex,companyGeneral);
		var lastNav=navigationDocument.documents.pop();
		 lastNav.getElementsByTagName("decorationLabel").item(5).textContent=selectTitle;
		 lastNav.getElementsByTagName("decorationLabel").item(1).textContent="1";
	}else if(cale=="5")
	{
		dismissModal();
		albumFilterPush('0',sortGeneral,languageGeneral,genreGeneral,yearGeneral,typeGeneral,selectIndex);
		var lastNav=navigationDocument.documents.pop();
		 lastNav.getElementsByTagName("decorationLabel").item(6).textContent=selectTitle;
		 lastNav.getElementsByTagName("decorationLabel").item(1).textContent="1";
	}else if(cale=="6")
	{
		dismissModal();
		albumFilterPush(selectIndex,sortGeneral,languageGeneral,genreGeneral,yearGeneral,typeGeneral,companyGeneral);
	}
}

function songListHome()
{
	showLoadingIndicator();
	var xml=`<document>
  <head>
    <style>
      .lightBackgroundColor {
        background-color: #e49c36;
      }
      .titleMargin{
	    padding: 0;
      }
      .titleHighlight{
	    tv-text-max-lines: 3;
      }
      .titleBackgroudColor{
      background-color: rgba(41,151,37,0.8);
      color: #FFFFFF;
      text-align: center;
      width: 300;
      }
    </style>
  </head>
  <stackTemplate theme="light" class="lightBackgroundColor" >
    <identityBanner>
      <heroImg src="${BASEURL}heroimg.png" width="1" height="1" />
      <title id="top">歌单广场</title>
      <row>
        <buttonLockup onselect="sortSongListAlert()">
          <badge src="resource://button-rate" />
          <title>排序</title>
        </buttonLockup>
        <buttonLockup>
          <badge src="resource://button-rate" />
          <title>收藏</title>
        </buttonLockup>
        <buttonLockup onselect="showClearAudieListModal()">
          <badge src="${BASEURL}remove.png" width="80" height="80"/>
          <title>清空</title>
        </buttonLockup>
      </row>
    </identityBanner>
    <collectionList>
    </collectionList>
  </stackTemplate>
</document>`;
var loadXML=loadDoc(xml);
autoTurnLockupInt=0;
autoTurnCurrentIndex=1;
defaultPresenter(loadXML);
songlistFun('1',1,1,"collectionList");
loadXML.addEventListener("highlight", function(event){
	var hightInt=event.target.getAttribute("id");
	//计算每次载入的最下方的lockup
	if(hightInt>autoTurnLockupInt-6)
	{
		autoTurnCurrentIndex++;
		songlistFun(sortsGeneral,autoTurnCurrentIndex,1,"section",1);
	}
});
}

function songlistFun(sorts,page,appendMode,tagName,headers)
{
	var index=page;
	var RecordsPerPage=20;
	var total_page=730;
	index < 1 ? index = 1 : index;
	index > total_page ? index = total_page : index;
	var startIndex = (index - 1) * RecordsPerPage;
	var endIndex = index * RecordsPerPage - 1;
	sortsGeneral=sorts;
	var d=javascriptTools.httpGetPCSongList("http://i.y.qq.com/s.plcloud/fcgi-bin/fcg_get_diss_by_tag.fcg?categoryId=10000000&sortId="+sorts+"&sin="+startIndex+"&ein="+endIndex+"&format=jsonp&g_tk=5381&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=MusicJsonCallback&needNewCode=0");
	if(d.indexOf("imgurl")>-1)
	{
		d=d.replace("MusicJsonCallback(", "");
		d=d.replace("})", "}");
		var data=JSON.parse(d)["data"];
		var list=data["list"];
		var items="";
		var varGrid="";
		if(headers!=1)
		{
			varGrid="<grid><header><title></title></header><section>";
		}
		
		for(var i=0;i<list.length;i++)
		{
			var currentLockInt=(page-1)*20+i;
			var tiles=list[i]["creator"]["name"];
			if(tiles.indexOf("&#")<0)
			{
				tiles="<![CDATA["+tiles+"]]>";
			}
			//tiles=tiles.replace("。", "");
			var dissname=list[i]["dissname"];
			if(dissname.indexOf("&#")<0)
			{
				dissname="<![CDATA["+dissname+"]]>";
			}
			//dissname=dissname.replace("。", "");
			//dissname=dissname.replace("！", "");
			//dissname=dissname.replace("【", "");
			//dissname=dissname.replace("】", "");
			
			var imgPic=HTMLEnCode(list[i]["imgurl"]);
			items+=`<lockup id="${currentLockInt}" onselect="disstidHome('${list[i]["dissid"]}')">
            <img src="${imgPic}" width="300" height="300" />
            <title>${tiles}</title>
            <overlay class="titleMargin">
            <subtitle class="titleBackgroudColor">${dissname}</subtitle>
            </overlay>
          </lockup>`;
          autoTurnLockupInt=currentLockInt;
		}
		varGrid+=items;
		if(headers!=1)
		{
			varGrid+="</section></grid>";
		}
		
		if(list.length>0)
		{
			var doc=navigationDocument.documents.pop();
			var domImplementation = doc.implementation;
			var lsParser = domImplementation.createLSParser(1, null);
			var lsInput = domImplementation.createLSInput();
			lsInput.stringData=varGrid;
			
			lsParser.parseWithContext(lsInput, doc.getElementsByTagName(tagName).item(0), appendMode);
		}
	}
}

function HTMLEnCode(str)
{
var s = "";
if (str.length == 0)
return "";
s = str.replace(/&/g, "&amp;");
return s;
}

function disstidHome(ids)
{
	showLoadingIndicator();
	var d=javascriptTools.httpGetPCSongList("http://i.y.qq.com/qzone-music/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&jsonpCallback=jsonCallback&nosign=1&disstid="+ids+"&g_tk=5381&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=jsonCallback&needNewCode=0");
	if(d.indexOf("songids")>-1)
	{
		audioList=[];
		d=d.replace("jsonCallback(", "");
		d=d.replace("})", "}");
		var cdlist=JSON.parse(d)["cdlist"][0];
		var songlist=cdlist["songlist"];
		var items="";
		var descStr=cdlist["desc"];
		//descStr=descStr.replace("&lt;br&gt;", "");
		for(var i=0;i<songlist.length;i++)
		{
			var mediaItem = new MediaItem("audio", "http://ws.stream.qqmusic.qq.com/"+songlist[i]["songid"]+".m4a?fromtag=30");
			mediaItem.artworkImageURL="http://imgcache.qq.com/music/photo_new/T002R500x500M000"+songlist[i]["albummid"]+".jpg";
			mediaItem.title=songlist[i]["songname"];
			mediaItem.subtitle=songlist[i]["albumname"];
			mediaItem.description=songlist[i]["albumname"];
			//mediaItem对象向后插入到audioList数组中
			audioList.push(mediaItem);
			items+=`<listItemLockup onselect="singlePlayer('${i}')">
            <title><![CDATA[${songlist[i]["albumname"]}]]></title>
            <subtitle><![CDATA[${songlist[i]["singer"][0]["name"]}]]></subtitle>
            <relatedContent>
        <itemBanner>
          <heroImg src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${songlist[i]["albummid"]}.jpg" />
          <row>
            <buttonLockup>
              <badge src="resource://button-rate" class="whiteButton" />
              <title>收藏</title>
            </buttonLockup>
          </row>
        </itemBanner>
      </relatedContent>
          </listItemLockup>`;
		}
		
		
		var xml=`<document>
  <head>
    <style>
    .ordinalLayout {
      margin: 8 0 0 9;
    }
    .whiteButton {
      tv-tint-color: rgb(255, 255, 255);
    }
    </style>
  </head>
  <compilationTemplate theme="dark">
    <list>
      <relatedContent>
        <itemBanner>
          <heroImg src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${cdlist["songlist"][0]["albummid"]}.jpg" />
        </itemBanner>
      </relatedContent>
      <header>
        <title><![CDATA[${cdlist["dissname"]}]]></title>
        <subtitle><![CDATA[${cdlist["nick"]}]]></subtitle>
        <row>
          <text>${descStr}</text>
        </row>
      </header>
      <section>
        <header>
          <title>Title</title>
        </header>${items}
      </section>
    </list>
  </compilationTemplate>
</document>`;
		defaultPresenter(loadDoc(xml));
	}else
	{
		urlError(d,"打开歌单广场的专辑首页出错!");
	}
}

function sortSongListAlert()
{
	var alertString = `<document>
  <alertTemplate>
  	<title>歌单排序</title>
  	<button onselect="sortSongListFun('1')">
    <title>推荐</title>
    </button>
    <button onselect="sortSongListFun('2')">
    <title>最新</title>
    </button>
    <button onselect="sortSongListFun('3')">
    <title>最热</title>
    </button>
    <button onselect="sortSongListFun('4')">
    <title>好评</title>
    </button>
  </alertTemplate>
</document>`
    var parser = new DOMParser();
    var alertDoc = parser.parseFromString(alertString, "application/xml");
    //弹出透明弹窗
    navigationDocument.presentModal(alertDoc);
}

function sortSongListFun(ids)
{
	dismissModal();
	autoTurnLockupInt=0;
	autoTurnCurrentIndex=1;
	songlistFun(ids,1,2,"collectionList");
}

function searchHome()
{
	//javascriptTools.httpGetPC("");
	showLoadingIndicator();
	var xml=`<document>
    <head>
      <style>
        .suggestionListLayout {
          margin: -150 0;
        }
        .titleHighlight{
	        tv-text-highlight-style: marquee-on-highlight;
        }
      </style>
    </head>
    <searchTemplate>
      <searchField/>
      <collectionList>
      <list>
      <section>
        <header>
          <title>请输入拼音首字母搜索</title>
        </header>
      </section>
    </list>
      </collectionList>
    </searchTemplate>
  </document>`;
  var loadXML=loadDoc(xml);
  defaultPresenter(loadXML);
  var searchField = loadXML.getElementsByTagName("searchField").item(0);
  var keyboard = searchField.getFeature("Keyboard");
  keyboard.onTextChange = function() {
	  var searchText = keyboard.text;
	  //改变输入时搜索
	  bresrchResults(loadXML, searchText);
  };
}

function bresrchResults(doc,searchText)
{
	if(searchText.length>0)
	{
		var seachkeyWords=encodeURI(searchText);
		var domImplementation = doc.implementation;
    var lsParser = domImplementation.createLSParser(1, null);
    var lsInput = domImplementation.createLSInput();
    lsInput.stringData = `<list>
      <section>
        <header>
          <title>无 搜索结果</title>
        </header>
      </section>
    </list>`;
    var d=javascriptTools.httpGetPC("http://i.y.qq.com/s.plcloud/fcgi-bin/smartbox_new.fcg?utf8=1&is_xml=0&key="+seachkeyWords+"&g_tk=5381&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=MusicJsonCallBack&needNewCode=0");
    if(d.indexOf("mid")>-1)
    {
	    d=d.replace("MusicJsonCallBack(", "");
	    d=d.replace("}\n)", "}");
	    var data=JSON.parse(d)["data"];
	    var song=data["song"];
	    var singer=data["singer"];
	    var album=data["album"];
	    var songItmes="";
	    var singerItmes="";
	    var albumItmes="";
	    if(song!=undefined)
	    {
		    var sItems="";
		    var itemlist=song["itemlist"];
		    songItmes="<shelf><header><title>单曲</title></header><section>";
		    for(var i=0;i<itemlist.length;i++)
		    {
			    sItems+=`<lockup onselect="searchAddSong('${itemlist[i]["mid"]}','${itemlist[i]["id"]}')">
              <img src="${BASEURL}musicBaidu.png" width="300" height="300" />
              <title class="titleHighlight">${itemlist[i]["name"]}</title>
            </lockup>`;
		    }
		    songItmes+=sItems;
		    songItmes+="</section></shelf>";
	    }
	    
	    if(singer!=undefined)
	    {
		    var sItems="";
		    var itemlist=singer["itemlist"];
		    singerItmes="<shelf><header><title>歌手</title></header><section>";
		    for(var i=0;i<itemlist.length;i++)
		    {
			    sItems+=`<lockup onselect="searchSingerHome('${itemlist[i]["mid"]}','${itemlist[i]["name"]}')">
              <img src="${BASEURL}musicBaidu.png" width="300" height="300" />
              <title>${itemlist[i]["name"]}</title>
            </lockup>`;
		    }
		    singerItmes+=sItems;
		    singerItmes+="</section></shelf>";
	    }
	    
	    if(album!=undefined)
	    {
		    var sItems="";
		    var itemlist=album["itemlist"];
		    albumItmes="<shelf><header><title>专辑</title></header><section>";
		    for(var i=0;i<itemlist.length;i++)
		    {
			    sItems+=`<lockup onselect="albummidHome('${itemlist[i]["mid"]}')">
              <img src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${itemlist[i]["mid"]}.jpg" width="300" height="300" />
              <title>${itemlist[i]["name"]}</title>
            </lockup>`;
		    }
		    albumItmes+=sItems;
		    albumItmes+="</section></shelf>";
	    }
	    
	    lsInput.stringData=songItmes+singerItmes+albumItmes;
	    lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2);
    }
	}else
	{
		var domImplementation = doc.implementation;
    var lsParser = domImplementation.createLSParser(1, null);
    var lsInput = domImplementation.createLSInput();
    lsInput.stringData = `<list>
      <section>
        <header>
          <title>请输入拼音首字母搜索</title>
        </header>
      </section>
    </list>`;
    lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2);
	}
}

function searchAddSong(songMid,songId)
{
	if(audioList==undefined)
	{
		audioList=[];
	}
	var d=javascriptTools.searchSongMid(songMid);
	var resultMid=d.split(",");
	var mediaItem = new MediaItem("audio", "http://ws.stream.qqmusic.qq.com/"+songId+".m4a?fromtag=30");
	mediaItem.artworkImageURL="http://imgcache.qq.com/music/photo_new/T002R500x500M000"+resultMid[0]+".jpg";
	mediaItem.title=resultMid[1];
	audioList.push(mediaItem);
	singlePlayer(audioList.length-1,'','');
}

function searchSingerHome(ids,singerName)
{
	showLoadingIndicator();
	var d=javascriptTools.httpGetPC("http://i.y.qq.com/v8/fcg-bin/fcg_v8_singer_detail_cp.fcg?tpl=20&singermid="+ids);
	if(d.indexOf("专辑_QQ音乐")>-1)
	{
		autoTurnLockupInt=0;
		autoTurnCurrentIndex=1;
		audioList=[];
		audioAlbumList=[];
		var songlistStr="";
		var songlistArray=d.split("\n");
		for(var i=0;i<songlistArray.length;i++)
		{
			if(songlistArray[i].indexOf("songlist")>-1&&songlistArray[i].indexOf("albumid")>-1)
			{
				songlistStr=songlistArray[i];
				break;
			}
		}
		var songlistItems="";
		var songlistGrid="<grid><header><title>热门单曲</title></header><section>";
		songlistStr=songlistStr.substring(12, songlistStr.length-2);
		var jsonlist=JSON.parse(songlistStr);
		for(var b=0;b<jsonlist.length;b++)
		{
			var mediaItem = new MediaItem("audio", "http://ws.stream.qqmusic.qq.com/"+jsonlist[b]["songid"]+".m4a?fromtag=30");
	mediaItem.artworkImageURL="http://imgcache.qq.com/music/photo_new/T002R500x500M000"+jsonlist[b]["albummid"]+".jpg";
	mediaItem.title=jsonlist[b]["songname"];
	audioList.push(mediaItem);
			songlistItems+=`<lockup id="${autoTurnLockupInt}" onselect="singlePlayer('${b}')">
            <img src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${jsonlist[b]["albummid"]}.jpg" width="300" height="300" />
            <title class="titleHight"><![CDATA[${jsonlist[b]["songname"]}]]></title>
            <overlay class="titleMargin">
            <subtitle class="titleBackgroudColor"><![CDATA[${jsonlist[b]["albumname"]}]]></subtitle>
            </overlay>
          </lockup>`;
          autoTurnLockupInt++;
		}
		songlistGrid+=songlistItems;
		songlistGrid+="</section></grid>";
		var xml=`<document>
  <head>
    <style>
      .lightBackgroundColor {
        background-color: #e49c36;
      }
      .titleMargin{
	    padding: 0;
      }
      .titleBackgroudColor{
      background-color: rgba(0,0,0,0.6);
      color: #FFFFFF;
      text-align: center;
      width: 300;
      }
      .titleHight{
	      tv-text-max-lines: 3;
      }
    </style>
  </head>
  <stackTemplate theme="light" class="lightBackgroundColor" >
    <identityBanner>
      <heroImg src="${BASEURL}heroimg.png" width="1" height="1" />
      <title id="radio">${singerName}歌手的音乐专辑</title>
      <row>
        <buttonLockup>
          <badge src="resource://button-rate" />
          <title>收藏</title>
        </buttonLockup>
        <buttonLockup onselect="showClearAudieListModal()">
          <badge src="${BASEURL}remove.png" width="80" height="80"/>
          <title>清空</title>
        </buttonLockup>
      </row>
    </identityBanner>
    <collectionList>${songlistGrid}
    </collectionList>
  </stackTemplate>
</document>`;
var loadXML=loadDoc(xml);
defaultPresenter(loadXML);
searchSingeraAblam(ids,1,"collectionList",0);
loadXML.addEventListener("highlight", function(event){
	var hightInt=event.target.getAttribute("id");
	//计算每次载入的最下方的lockup
	if(hightInt>autoTurnLockupInt-6)
	{
		autoTurnCurrentIndex++;
		searchSingeraAblam(ids,autoTurnCurrentIndex,"section",1);
	
	}
});


	}
}

function searchSingeraAblam(ids,page,tagName,append)
{
	var ctPage=page-1;
	if(ctPage>0)
	{
		ctPage=String(ctPage)+"0";
	}
	
	var d=javascriptTools.httpGetPC("http://i.y.qq.com/v8/fcg-bin/fcg_v8_singer_album.fcg?g_tk=5381&loginUin=0&hostUin=0&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0&platform=yqq&jsonpCallback=MusicJsonCallback&needNewCode=0&singermid="+ids+"&order=time&begin="+ctPage+"&num=10&exstatus=1");
	d=d.replace("MusicJsonCallback(", "");
	d=d.replace("}\n)", "}");
	
	var list=JSON.parse(d)["data"]["list"];
	var items="";
	var sinGrid="";
	if(tagName=="collectionList")
	{
		sinGrid="<grid><header><title>专辑列表</title></header><section>";
	}
	
	for(var i=0;i<list.length;i++)
	{
		items+=`<lockup id="${autoTurnLockupInt}" onselect="albummidHome('${list[i]["albumMID"]}')">
            <img src="http://imgcache.qq.com/music/photo_new/T002R500x500M000${list[i]["albumMID"]}.jpg" width="300" height="300" />
            <title class="titleHight"><![CDATA[${list[i]["albumName"]}]]></title>
            <overlay class="titleMargin">
            <subtitle class="titleBackgroudColor"><![CDATA[${list[i]["desc"]}]]></subtitle>
            </overlay>
          </lockup>`;
          autoTurnLockupInt++;
	}
	sinGrid+=items;
	
	if(tagName=="collectionList")
	{
		sinGrid+="</section></grid>";
	}
	var doc=navigationDocument.documents.pop();
	var domImplementation = doc.implementation;
    var lsParser = domImplementation.createLSParser(1, null);
    var lsInput = domImplementation.createLSInput();
    lsInput.stringData = sinGrid;
    lsParser.parseWithContext(lsInput, doc.getElementsByTagName(tagName).item(append), 1);
}