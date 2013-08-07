window.onload=function(){

	function g(e){
		return document.getElementById(e);
	}

    g('functions3d').style.visibility = 'visible';
    g('loading').style.display = 'none';

	var functionValue = 'Math.sqrt(1-x*x-y*y)';


	var theta = 4.2;
	var eleva = 0.6;

	var col={
		r:255,
		g:0,
		b:0
	}

	var paintType=0;
	/*
		0: single colour
		1: height spectrum
	*/

	var
		xMin = -1,
		yMin = -1,
		zMin = -1,
		xMax = +1,
		yMax = +1,
		zMax = +1;
		
	var e_preview = g('preview');
	var ctx_preview = e_preview.getContext('2d');
		ctx_preview.translate(150,150);
		ctx_preview.scale(82,82);
	
	var e_fullview = g('fullview');
	var ctx_fullview = e_fullview.getContext('2d');
		ctx_fullview.translate(200,200);
	
	var e_container = g('container');


	var e_view1 = g('view1');
	var e_view2 = g('view2');
	var e_view3 = g('view3');

	var dragMode = 0;
	var e_dragMode = document.getElementsByName('dragMode');

	g('paintType').onchange=function(){
		paintType=this.options.selectedIndex;
		g('colourBox').style.display= paintType==0 ? 'block' : 'none';
	}

	e_dragMode[0].onclick = function(){
		dragMode = 0;
		e_preview.style.cursor="move";
		g('scaleBoxes').style.display='none';
	};
	e_dragMode[1].onclick = function(){
		dragMode = 1;
		e_preview.style.cursor="move";
		g('scaleBoxes').style.display='none';
	};
	e_dragMode[2].onclick = function(){
		e_preview.style.cursor="n-resize";
		dragMode = 2;
		g('scaleBoxes').style.display='none';
	};
	e_dragMode[3].onclick = function(){
		e_preview.style.cursor="n-resize";
		dragMode = 3;
		g('scaleBoxes').style.display='block';
	};

	var e_scaleBoxX=g('scaleBoxX');
	var e_scaleBoxY=g('scaleBoxY');
	var e_scaleBoxZ=g('scaleBoxZ');

	e_scaleBoxX.onclick = e_scaleBoxY.onclick = e_scaleBoxZ.onclick = function(){
		var t=this;
		setTimeout(function(){
			var count=0;
			if (e_scaleBoxX.checked) count++;
			if (e_scaleBoxY.checked) count++;
			if (e_scaleBoxZ.checked) count++;

			if (count==0) {
				t.checked=true;
			}
		}, 100);

	}


	var
		e_functionInput = g('functionInput'),
		e_xMin = g('xMin'),
		e_yMin = g('yMin'),
		e_zMin = g('zMin'),
		e_xMax = g('xMax'),
		e_yMax = g('yMax'),
		e_zMax = g('zMax');
		

	e_functionInput.onkeyup = function(){
		var s = parseMath(this.value);
		if (s[0]) {
			functionValue = s[1];
			plotData();
			if (!previewWait) previewWait = setTimeout(previewRender, 10);
		}
	}
	e_functionInput.onblur = function(){
		var s = parseMath(this.value);
		if (!s[0]) {
			var str = s[1];
			str = str.substr(0,11)+'<BR>'+str.substring(11,str.length);
			g('errorBox').innerHTML='<A href="http://my.opera.com/Benjamin%20Joffe/homes/functions/error.html">'+str+'</A>';
			g('functionRender').disabled=true;
    }
		else {
			g('functionRender').disabled=false;
		}
	}
	e_functionInput.onfocus = function(){
		g('errorBox').innerHTML="";
		g('functionRender').disabled=false;
	}

	g('reset').onmousedown=function(){
		e_xMin.value = e_yMin.value = e_zMin.value = xMin = yMin = zMin = -1;
		e_xMax.value = e_yMax.value = e_zMax.value = xMax = yMax = zMax = 1;
		plotData();
		previewRender();
	}


	g('functionRender').onclick = function(){
		slideView(0, 464, fullRender);
		ctx_fullview.clearRect(-200,-200,400,400);
		e_view2.focus();
		return false;
	}
	
	g('save').onclick=function(){
		// remove black background
		var temp = document.createElement('CANVAS');
		temp.setAttribute('width', 400);
		temp.setAttribute('height', 400);
		temp = temp.getContext('2d');
		temp.fillStyle='#FFF';
		temp.fillRect(0,0,400,400);
		temp.drawImage(ctx_fullview.canvas, 0,0);
		window.open(temp.canvas.toDataURL());
	}
	
	g('arrow').onmousedown=function(){
		e_view1.style.display='none';
		e_view3.style.display='block';
	}
	g('arrow2').onmousedown=function(){
		e_view1.style.display='block';
		e_view3.style.display='none';
	}
	
	var slideView_active=false;
	function slideView(from, to, exe){
		if (slideView_active) return;
		slideView_active=true;
		
		var i = 0;
		

		var loopy = setInterval(function(){
			i++;
			var n = i/20; 
			n = (1-Math.cos(n*3.141592653))/2;
			
			e_container.scrollLeft=n*(to-from)+from;
			if (i==20) {
				clearInterval(loopy);
				slideView_active=false;
				if (exe) exe();
			}
		}, 20);

	}
	
	function HSVtoRGB(h,s,v){
		h%=6;
		var r,g,b;
		if (s==0) r=g=b=v;
		else {
			var H=h>>0;
			var f=h-H;
			var p=v*(1-s);
			var q=v*(1-f*s);
			var t=v*(1-(1-f)*s);
			if (H==0) r=v, g=t, b=p;
			if (H==1) r=q, g=v, b=p;
			if (H==2) r=p, g=v, b=t;
			if (H==3) r=p, g=q, b=v;
			if (H==4) r=t, g=p, b=v;
			if (H==5) r=v, g=p, b=q;
		}
		return {r:(r = r*256 >> 0) < 0 ? 0 : r > 255 ? 255 : r,
		g:(g = g*256 >> 0) < 0 ? 0 : g > 255 ? 255 : g,
		b:(b = b*256 >> 0) < 0 ? 0 : b > 255 ? 255 : b
		};
	}

	
	g('ring').onmousedown=function(e){
		var xOff=this.offsetParent.offsetLeft+11; //the 11 is for the container's offset
		var yOff=this.offsetParent.offsetTop;
		var mark=g('mark1');

		var x=e.clientX-xOff;
		var y=e.clientY-yOff;
		
		if ( (90-x)*(90-x)+(90-y)*(90-y) > 90*90) return;

		document.onmousemove=function(e){
			var x=e.clientY-yOff
			var y=e.clientX-xOff
			
			var d = Math.sqrt((90-x)*(90-x)+(90-y)*(90-y));
			if (d<5) {
				x=90;
				y=90;
				d=0;
			}
			if (d>72) {
				x = ((x-90)*72/d+90)>>0;
				y = ((y-90)*72/d+90)>>0;
				d=72;
			}
			
			mark.style.top=x+'px';
			mark.style.left=y+'px';
			
			var theta=Math.atan2(90-x,y-90);
			theta=(theta+Math.PI*2)%(Math.PI*2);
			theta=theta*6/(Math.PI*2);
			
			col = HSVtoRGB(theta, d/72, 1);
			
			g('colourDisplay').style.backgroundColor='rgb('+col.r+','+col.g+','+col.b+')';
			
		}
		document.onmousemove(e);
		document.onmouseup=function(){
			document.onmousemove=null;
		}
	}
	
	//############################################## BEGIN FULL RENDER
	
	var renderCancel;
	
	function fullRender(){
		
		renderCancel=false;
		
		var ctx = ctx_fullview;

		ctx.scale(100,100);

		var count = 100;
		
		var f = new Function('x', 'y', 'return '+functionValue);

		var lastRow=[];
		var lastCo=false;
		var co;

		var x,y;

		var i=0, j=0;

		ctx.lineWidth=0.008;

		var rr = col.r;
		var gg = col.g;
		var bb = col.b;

		function drawSurface(a,b,c){
			ctx.beginPath();
			ctx.moveTo(a.draw.x, a.draw.y);
			ctx.lineTo(b.draw.x, b.draw.y);
			ctx.lineTo(c.draw.x, c.draw.y);
			ctx.closePath();
		
			var x = (a.y-b.y) * (a.z-c.z) - (a.z-b.z) * (a.y-c.y);
			var y = (a.z-b.z) * (a.x-c.x) - (a.x-b.x) * (a.z-c.z);
			var z = (a.x-b.x) * (a.y-c.y) - (a.y-b.y) * (a.x-c.x);

			var X = Math.tan(theta);
			var Y = 1;
			var Z = Math.tan(eleva)*Math.sqrt(X*X+1);
			if (theta<Math.PI/2 || theta>Math.PI*3/2) Z*=-1;
		
			var area = (x*X + y*Y + z*Z) / Math.sqrt( (x*x + y*y + z*z)*(X*X + Y*Y + Z*Z) );
			if (area<0) area*=-1;
			
			if (paintType==1) {
				var h = (a.z+b.z+c.z+3)*(5.5/6);
				if (h<1) rr=1, gg=0, bb=h;
				else if (h<2) rr=2-h, gg=0, bb=1;
				else if (h<3) rr=0, gg=h-2, bb=1;
				else if (h<4) rr=0, gg=1, bb=4-h;
				else if (h<5) rr=h-4, gg=1, bb=0;
				else rr=1, gg=6-h, bb=0;

				rr = Math.round(rr*255);
				gg = Math.round(gg*255);
				bb = Math.round(bb*255);
			}

			ctx.strokeStyle = ctx.fillStyle = 'rgba('+     ((rr*area)>>0)     +','+   ((gg*area)>>0)  +','+   ((bb*area)>>0)   +',1)';

			ctx.fill();
			ctx.stroke();
		}

		var xIsPrimary=true;
		var primaryInc=true;


		if (theta>Math.PI/4 && theta<Math.PI*5/4) primaryInc=false;
		if (eleva>Math.PI/2 && eleva<Math.PI*3/2) primaryInc=!primaryInc;	
		if (theta%Math.PI < Math.PI/4 || theta%Math.PI > Math.PI*3/4) xIsPrimary=false;

		//alert("eleva:"+eleva+"\ntheta: "+theta+"\nxIsPrimary: "+xIsPrimary+"\nprimaryInc: "+primaryInc);

		if (!xIsPrimary) theta = (theta+Math.PI*1.5)%(2*Math.PI);
		if (!primaryInc) 	theta = (theta+Math.PI)%(2*Math.PI);
		


		function undoChanges(){
			ctx.scale(1/100,1/100);	
			if (!xIsPrimary) {
				theta = (theta+Math.PI*0.5)%(2*Math.PI);
			}
			if (!primaryInc) {
				theta = (theta+Math.PI)%(2*Math.PI);
			}
		}

		function render(){

			var start = new Date();
			
			for (; i<=count; i++) {
				if (xIsPrimary) {
					if (primaryInc) x = xMin + (xMax-xMin)*i/count;
					else x = xMax + (xMin-xMax)*i/count;
				}
				else {
					if (primaryInc) y = yMax + (yMin-yMax)*i/count;
					else y = yMin + (yMax-yMin)*i/count;
				}
				
				for (; j<=count; j++) {
					if (new Date()-start>100) {setTimeout(render,10);return;}
					if (renderCancel) {
						undoChanges();
						return;
					}
					
					if (xIsPrimary) {
						if (primaryInc) y = yMin + (yMax-yMin)*j/count;
						else y = yMax + (yMin-yMax)*j/count;
					}
					else {
						if (primaryInc) x = xMin + (xMax-xMin)*j/count;
						else x = xMax + (xMin-xMax)*j/count;
					}
					
					co = 2*(f(x,y)-zMin)/(zMax-zMin)-1;
					if (isNaN(co) || co>1 || co<-1) co=false;
					else {
						co = {
							x: 2*i/count-1,
							y: 2*j/count-1,
							z: co
						};
						co.draw = iso(co.x, co.y, co.z);
						if (j>0 && i>0 && lastRow[j-1]) {
							if (lastRow[j]) drawSurface(co, lastRow[j-1], lastRow[j]);
							if (lastCo) drawSurface(co, lastCo, lastRow[j-1]);

							if ((i-1)%((count/20)>>0)==0 && lastRow[j]) {
								ctx.globalCompositeOperation = 'over'
								ctx.beginPath();
								ctx.moveTo(lastRow[j].draw.x, lastRow[j].draw.y);
								ctx.lineTo(lastRow[j-1].draw.x, lastRow[j-1].draw.y);
								if ((j-1)%5==0 && lastCo) ctx.lineTo(lastCo.draw.x, lastCo.draw.y);
	
								ctx.strokeStyle="rgba(0,0,0,0.5)";
								ctx.stroke();
							}
							else if ((j-1)%((count/20)>>0)==0 && lastCo) {
								ctx.beginPath();
								ctx.moveTo(lastRow[j-1].draw.x, lastRow[j-1].draw.y);
								ctx.lineTo(lastCo.draw.x, lastCo.draw.y);
								ctx.strokeStyle="rgba(1,1,1,0.5)";
								ctx.stroke();
							}
						}
					}
					lastRow[j-1]=lastCo;
					lastCo = co;
				}
				lastCo = false;
				lastRow[count]=co;
				j=0;
			}
			undoChanges();
		}
		setTimeout(render, 50);
	}

	g('backButton').onclick=function(){
		renderCancel=true;
		slideView(464,0);
	}	
	
	//############################################## END FULL RENDER


	function iso(x,y,z){
		var dist = Math.sqrt(x*x+y*y);
		var angle = (x==0 && y==0) ? 0 : Math.atan(y/x) + theta + ((x<0)? Math.PI : 0);

		x=Math.cos(angle)*dist;
		y=-Math.sin(angle)*dist;
		
		var fact = (y*Math.cos(eleva) + z*Math.sin(eleva)+5)/5;
		
		y=y*Math.sin(eleva) - z*Math.cos(eleva);
		
		x*=fact;
		y*=fact;
		
		return {
			x: x,
			y: y
		};
	}

	var plot=[];

	function plotData(){

		var x;
		
		var f = new Function('x', 'y', 'return '+functionValue);

		for (var i=0; i<=20; i++) {
			plot[i]=[];
			x = xMin+(xMax-xMin)*i/20;
			for (var j=0; j<=20; j++) {
				plot[i][j] = f(x, yMin+(yMax-yMin)*j/20);
			}
		}
	}

	plotData();

	var previewWait = false;

	function previewRender(){
    var t1 = new Date();

		previewWait = false;

		var ctx = ctx_preview;
		
    	ctx.clearRect(-2,-2,4,4);
    

		var co;
			
		ctx.lineJoin = "round";
		
		var xCenter = 150;
		var yCenter = 150;
		var scale = 82;
		
		ctx.beginPath();
		co = iso(-1,-1,-1); ctx.moveTo(co.x, co.y);
		co = iso(-1,+1,-1); ctx.lineTo(co.x, co.y);
		co = iso(+1,+1,-1); ctx.lineTo(co.x, co.y);
		co = iso(+1,-1,-1); ctx.lineTo(co.x, co.y);
		co = iso(+1,-1,+1); ctx.lineTo(co.x, co.y);
		co = iso(+1,+1,+1); ctx.lineTo(co.x, co.y);
		co = iso(-1,+1,+1); ctx.lineTo(co.x, co.y);
		co = iso(-1,-1,+1); ctx.lineTo(co.x, co.y);
    	co = iso(-1,-1,-1); ctx.lineTo(co.x, co.y);
		co = iso(+1,+1,-1); ctx.moveTo(co.x, co.y);
		co = iso(+1,+1,+1); ctx.lineTo(co.x, co.y);
		co = iso(-1,+1,-1); ctx.moveTo(co.x, co.y);
		co = iso(-1,+1,+1); ctx.lineTo(co.x, co.y);
		co = iso(-1,-1,+1); ctx.moveTo(co.x, co.y);
		co = iso(+1,-1,+1); ctx.lineTo(co.x, co.y);
		co = iso(-1,-1,-1); ctx.moveTo(co.x, co.y);
		co = iso(+1,-1,-1); ctx.lineTo(co.x, co.y);
		ctx.lineWidth=0.01;
		ctx.strokeStyle = 'rgba(0,0,100,0.8)';
		ctx.stroke();
		
		// xyz thingy
		ctx.beginPath();
		
		var arrow = [
			[0,			0,			0,		true],
			[0,			0,			1.6		],
			[0.05,		0.05,		1.4		],
			[0.05,		-0.05,		1.4		],
			[-0.05,	-0.05,		1.4		],
			[-0.05,	0.05,		1.4		],
			[0,			0,			1.6		],
			[-0.05,	-0.05,		1.4		],
			[0.05,		-0.05,		1.4,	true],
			[0,			0,			1.6		],
			[0.05,		0.05,		1.4,	true],
			[-0.05,	0.05,		1.4		]
		];
		
		for (var i=0,j; i<3; i++) {
			for (j=0; j<arrow.length; j++) {
				co = iso(arrow[j][(0+i)%3], arrow[j][(1+i)%3], arrow[j][(2+i)%3]);
				if (arrow[j][3]) ctx.moveTo(co.x, co.y);
				else ctx.lineTo(co.x, co.y);
			}
		}


		// z-letter
		co = iso(0, 0, 1.6);
		ctx.moveTo(co.x-0.2, co.y);
		ctx.lineTo(co.x-0.1, co.y);
		ctx.lineTo(co.x-0.2, co.y+0.1);
		ctx.lineTo(co.x-0.1, co.y+0.1);
		
		// y-letter
		
		co = iso(0, 1.6, 0);
		ctx.moveTo(co.x, co.y-0.2);
		ctx.lineTo(co.x, co.y-0.25);
		ctx.lineTo(co.x-0.05, co.y-0.3);
		ctx.moveTo(co.x, co.y-0.25);
		ctx.lineTo(co.x+0.05, co.y-0.3);
		
		// x-letter
		
		co = iso(1.6, 0, 0);
		ctx.moveTo(co.x+0.05, co.y-0.2);
		ctx.lineTo(co.x-0.05, co.y-0.3);
		ctx.moveTo(co.x-0.05, co.y-0.2);
		ctx.lineTo(co.x+0.05, co.y-0.3);
		
		ctx.strokeStyle='rgba(150,0,0,0.8)';
		ctx.stroke();
		ctx.strokeStyle = '#000';
		

		var lastRow=[];
		var lastCo=false;
		var co;
		
		var i, j;
		var z;
	
		ctx.lineWidth=0.003;
		for (i=0; i<=20; i++) {
		
			lastCo=false;
			
			for (j=0; j<=20; j++) {
		
				z = 2*(plot[i][j]-zMin)/(zMax-zMin)-1;
				
				if (isNaN(z)) co = false;
				else {

					co = iso(i/10-1, j/10-1, z>1 ? 1 : z<-1 ? -1 : z);

					ctx.beginPath();

					if (lastCo) {
						ctx.moveTo(lastCo.x, lastCo.y);
						ctx.lineTo(co.x, co.y);
					}
					else if (lastRow[j]) ctx.moveTo(co.x, co.y);

					if (lastRow[j]) ctx.lineTo(lastRow[j].x, lastRow[j].y);
					ctx.stroke();
				}
				lastRow[j] = lastCo = (z<=1 && z>=-1) && co;
			}
		}

	}
	
	previewRender();
	
	/************ Controlling Functions ************/
	
	e_preview.onmousedown=function(e){

		var x0 = e.clientX, y0 = e.clientY;

		if (dragMode==0) {
			document.onmousemove=function(e){
				theta -= (x0 - (x0=e.clientX))/100;
				eleva -= (y0 - (y0=e.clientY))/100;
				theta%=Math.PI*2; if (theta<0) theta+=Math.PI*2;
				eleva%=Math.PI*2; if (eleva<0) eleva+=Math.PI*2;
				
				if (!previewWait) previewWait = setTimeout(previewRender, 10);
			}
		}

		else if (dragMode==1) { 							// pan (x,y) ##########
			document.onmousemove=function(e){
			
				var dx = x0 - (x0=e.clientX);
				var dy = y0 - (y0=e.clientY);

				var cx = dy*Math.sin(theta) - dx*Math.cos(theta);
				var cy = dx*Math.sin(theta) + dy*Math.cos(theta);
	
				var stepx = (xMax-xMin)/200;
				var stepy = (yMax-yMin)/200;
	
				e_xMin.value = xMin-= cx*stepx;
				e_xMax.value = xMax-= cx*stepx;
				e_yMin.value = yMin-= cy*stepy;
				e_yMax.value = yMax-= cy*stepy;
				
				if (!previewWait) previewWait = setTimeout(function(){
					plotData()
					previewRender();
				}, 10);
			}
		}
		else if (dragMode==2) {						// shift (z) ##########
			document.onmousemove=function(e){
				var dy = (y0 - (y0=e.clientY));
				
				var step = (zMax-zMin)/200;
				
				e_zMax.value = zMax -= step*dy;
				e_zMin.value = zMin -= step*dy;
				if (!previewWait) previewWait = setTimeout(previewRender, 10);
			}
		}
		else if (dragMode==3) {						// scale ##########
			document.onmousemove=function(e){

				var dy=-(y0 - (y0=e.clientY))/100;
				
				var mid,scale;
				
				if (g('scaleBoxX').checked){
					mid = (xMin+xMax)/2;
					scale = Math.abs(Math.exp(dy)*(xMax-xMin)/2);
					e_xMin.value = xMin = mid-scale;
					e_xMax.value = xMax = mid+scale;
				}
				if (g('scaleBoxY').checked){
					mid = (yMin+yMax)/2;
					scale = Math.abs(Math.exp(dy)*(yMax-yMin)/2);
					e_yMin.value = yMin = mid-scale;
					e_yMax.value = yMax = mid+scale;
				}
				if (g('scaleBoxZ').checked){
					mid = (zMin+zMax)/2;
					scale = Math.abs(Math.exp(dy)*(zMax-zMin)/2);
					e_zMin.value = zMin = mid-scale;
					e_zMax.value = zMax = mid+scale;
				}
				
				if (!previewWait) previewWait = setTimeout(function(){
					plotData()
					previewRender();
				}, 10);
			}	
		}

		document.onmouseup=function(e){
			document.onmousemove=null;
		}
	}
	
};