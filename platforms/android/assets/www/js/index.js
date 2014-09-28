//移动到当前坐标的位置
var geolocation = new BMap.Geolocation();

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady(){
	var HomeLogo = getData("HomeLogo");
	if (HomeLogo == null) {
		window.location.href = "logo.html";
	}else{
		//通过百度地图获取当前位置
		geolocation.getCurrentPosition(function(r){
			if(this.getStatus() == BMAP_STATUS_SUCCESS){
				initMap(r.point);
			}
		});
		//navigator.geolocation.getCurrentPosition(onSuccess, onError, {maximumAge: 1000*60*10,timeout: 1000*60*2, enableHighAccuracy: false });
		document.addEventListener("backbutton", onBackKeyDown, false);
		$("#searchBtn").click(function(e){
			e.preventDefault(); //阻止跳转事件
			searchMap();
		});
	}
}
function onSuccess(position) {
	var longitude = position.coords.longitude;
	var latitude =  position.coords.latitude;
	var point = new BMap.Point(longitude, latitude);//定义一个中心点坐标
	initMap(point);
}
function onError(error) {
	alert('code: '+ error.code+ '\n' +'message: ' + error.message + '\n');
	navigator.geolocation.getCurrentPosition(onSuccess, onError, {maximumAge: 1000*60*10,timeout: 1000*60*2, enableHighAccuracy: true });
}


//创建和初始化地图函数：
function initMap(point){
	createMap(point);//创建地图
	setMapEvent();//设置地图事件
	addMapControl();//向地图添加控件
	addMarker();//向地图中添加marker
}

//创建地图函数：
function createMap(point){
	var map = new BMap.Map("main");//在百度地图容器中创建一个地图
	map.centerAndZoom(point,17);//设定地图的中心点和坐标并将地图显示在地图容器中
	window.map = map;//将map变量存储在全局
	addPositionMarker(point);
}

//地图事件设置函数：
function setMapEvent(){
	map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
	map.enableScrollWheelZoom();//启用地图滚轮放大缩小
	map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
	map.enableKeyboard();//启用键盘上下左右键移动地图
	map.enablePinchToZoom();//启用手势缩放
}

//地图控件添加函数：
function addMapControl(){
	//向地图中添加缩放控件
	var ctrl_nav = new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:BMAP_NAVIGATION_CONTROL_LARGE});
	map.addControl(ctrl_nav);
	//向地图中添加缩略图控件
	var ctrl_ove = new BMap.OverviewMapControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:1});
	//map.addControl(ctrl_ove);
	//向地图中添加比例尺控件
	var ctrl_sca = new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT});
	//map.addControl(ctrl_sca);
	
	// 创建自定义控件
	var myLocationCtrl = new LocationControl();
	// 添加到地图当中
	map.addControl(myLocationCtrl);
}
//创建marker
function addMarker(){
	//createMarker(roadMarkerArr);
	//createMarker(markerArr);
	$.ajax({
		type:"GET",
		dataType:'json',
		url:"http://yj.wgq.me/information/fullInformations.json",
		success:function(data){
			createMarker(data);
		},
		error: function(){
		
		}
	});
}
//更具数组创建marker
function createMarker(arr){
	for(var i=0;i<arr.length;i++){
		//获取information的json
		var information = arr[i].information;
		//从information获取经纬度
		var point = new BMap.Point(information.longitude,information.latitude);
		//var iconImg = createIcon(json.imgUrl, json.icon);
		var iconImg;
		if (information.position == 1) {
			//TODO 判断状态，这里先写死
			iconImg = createIcon("img/green.png");
			/*
			if(json.status == "idle"){
				iconImg = createIcon("img/green.png");
			}else if (json.status == "busy") {
				iconImg = createIcon("img/orange.png");
			}else if (json.status == "nervous") {
				iconImg = createIcon("img/red.png");
			}else{
				iconImg = createIcon("img/gray.png");
			}
			*/
		}else{
			//TODO 判断状态，这里先写死
			iconImg = createIcon("img/green_p.png");
			/*
			if(json.status == "idle"){
				iconImg = createIcon("/assets/img/green_p.png");
			}else{
				iconImg = createIcon("/assets/img/gray_p.png");
			}
			*/
		}
		var marker = new BMap.Marker(point,{icon:iconImg});
		var iw = createInfoWindow(i, arr);
		if (information.position == 1){
			//剩余车位数，暂时不知道，先写死5
			var label = new BMap.Label(5, {offset:new BMap.Size(12, 20)});
			label.setStyle({
				color:"yellow",
				border:"0",
				width:"50px",
				textAlign:"center",
				fontSize:"16px",
				cursor:"pointer",
				fontWeight :"bold" ,
				backgroundColor:"0.05"
			});
			marker.setLabel(label);
		}
		
		map.addOverlay(marker);
		(function(){
			var index = i;
			var _iw = createInfoWindow(i, arr);
			var _marker = marker;
			_marker.addEventListener("click",function(){
				this.openInfoWindow(_iw);
			});
			_iw.addEventListener("open",function(){
				//_marker.getLabel().hide();
			})
			_iw.addEventListener("close",function(){
				//_marker.getLabel().show();
			})
			/*
			label.addEventListener("click",function(){
				_marker.openInfoWindow(_iw);
			})
			*/
			//两个感叹号的作用就在于，如果明确设置了变量的值
			//（非null/undifined/0/”“等值),
			//结果就会根据变量的实际值来返回，如果没有设置，结果就会返回false。
			/*
			if(!!json.isOpen){
				//label.hide();
				_marker.openInfoWindow(_iw);
			}
			*/
		})()
	}

}

//创建InfoWindow
function createInfoWindow(i, arr){
	var iw = new BMap.InfoWindow(createHtmlStr(i, arr), {enableMessage:false});
	return iw;
}
//创建一个Icon, json
function createIcon(imgUrl){
	//var icon = new BMap.Icon(imgUrl, new BMap.Size(json.w,json.h),{imageOffset: new BMap.Size(-json.l,-json.t),infoWindowOffset:new BMap.Size(json.lb+5,1),offset:new BMap.Size(json.x,json.h)});
	var icon = new BMap.Icon(imgUrl, new BMap.Size(72, 72),{      
		// 指定定位位置。     
		// 当标注显示在地图上时，其所指向的地理位置距离图标左上      
		// 角各偏移36像素和75像素。您可以看到在本例中该位置即是     
		// 图标中央下端的尖角位置。      
		anchor: new BMap.Size(36, 75)        
	});
	return icon;
}

//处理回退事件
function onBackKeyDown() {
	alert(window.location.hash +"-----"+ window.location);
	if( window.location.hash == "#main" || window.location.hash=="" || window.location == "index.html"){
		navigator.notification.confirm("是否退出应用", confirmMsg, "退出程序", "确认,取消"); //退出程序
	}else{
		navigator.app.backHistory();
	}
}

function exitApp() {
	navigator.app.exitApp();
}
function confirmMsg(button){  
	if(button == 1){
		exitApp();
	}
}

//地图搜索
function searchMap() {
    var area = document.getElementById("searchTxt").value; //得到地区
    var ls = new BMap.LocalSearch(map);
    ls.setSearchCompleteCallback(function(rs) {
        if (ls.getStatus() == BMAP_STATUS_SUCCESS) {
            var poi = rs.getPoi(0);
            if (poi) {
                initMap(poi.point);//创建地图(经度poi.point.lng,纬度poi.point.lat)
            }
        }
    });
    ls.search(area);
	
}


// 定义一个控件类,即function
function LocationControl(){
  // 默认停靠位置和偏移量
  this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
  this.defaultOffset = new BMap.Size(10, 10);
}

// 通过JavaScript的prototype属性继承于BMap.Control
LocationControl.prototype = new BMap.Control();

// 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
// 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
LocationControl.prototype.initialize = function(map){
  // 创建一个DOM元素
  var div = document.createElement("div");
  // 添加图片
  var img = document.createElement("img");
  img.src = "img/location.png";
  div.appendChild(img);
  // 设置样式
  div.style.cursor = "pointer";
  div.style.border = "0";
  div.style.backgroundColor = "0.05";
  // 绑定事件,点击获取当前位置,并标注
  div.onclick = function(e){
	//map.panTo(center:Point, {noAnimation : yes})
	geolocation.getCurrentPosition(function(r){
		if(this.getStatus() == BMAP_STATUS_SUCCESS){
			//清楚所有覆盖物
			map.clearOverlays();
			//重新添加覆盖物
			addMarker();
			addPositionMarker(r.point);
			map.panTo(r.point, {noAnimation : false});
		}
	});
  }
  // 添加DOM元素到地图中
  map.getContainer().appendChild(div);
  // 将DOM元素返回
  return div;
}

function addPositionMarker(point){
	var circle = new BMap.Circle(point,100,{strokeColor:"green", fillColor:"green", strokeWeight:1, strokeOpacity:0.2, fillOpacity:0.2}); //创建圆
	map.addOverlay(circle);
	var myIcon = new BMap.Icon("img/position.png",new BMap.Size(30, 30)); 
	var mk = new BMap.Marker(point, {icon: myIcon});
	map.addOverlay(mk);
}


//生成点击地图弹出框的html 
//暂时的剩余车位数不清楚
function createHtmlStr(i, arr){
	//获取information的json
	var information = arr[i].information;
	//获取tariff的json数组
	var tariffs = arr[i].tariff;
	//获取免费的时间
	var time_range = tariffs[0].time_range;
	//获取每小时多少资费
	var rates = tariffs[1].rates;
	//获取locality的json数组
	var localities = arr[i].locality;
	//获取具体的地址
	var addr = localities[0].name;
	var str = "";
	str = "<b class='iw_poi_title' title='"+information.garage_name+"'>" 
		+information.garage_name+"</b><div class='iw_poi_content'>"
		+'价格：前'+time_range+'小时免费,&nbsp;&nbsp;&nbsp;&nbsp;其他' +rates+'元/小时'+'&nbsp;&nbsp;&nbsp;&nbsp;车位：'
		+5+'/'+information.total_parking_space+'<br/>'+'地址：'+addr+"</div>";
	return str;
}

