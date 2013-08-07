/**********************************************************\
*                                                          *
* Created by Benjamin Joffe                                *
*                                                          *
* This is a function that takes a string such as:          *
*                                                          *                                         
*         x^sin(x)                                         *
*                                                          *
*  And will turn it into a JavaScript evaluatable string:  *
*                                                          *
*         Math.pow(x, Math.sin(x));                        *
*                                                          *
*                                                          *
\***********************************************************/



Math.csc = function(x){
	return 1 / Math.sin(x);
};
Math.sec = function(x){
	return 1 / Math.cos(x);
};
Math.cot = function(x){
	return 1 / Math.tan(x);
};
Math.acsc = function(x){
	return Math.asin(1/x);
};
Math.asec = function(x){
	return Math.acos(1/x);
};
Math.acot = function(x){
	return Math.atan(1/x);
};
Math.sinh = function(x){
	x = Math.exp(x);
	return (x - 1/x) / 2;
};
Math.cosh = function(x){
	x = Math.exp(x);
	return (x + 1/x) / 2;
};
Math.tanh = function(x){
	x = Math.exp(x);
	return (x*x - 1) / (x*x + 1);
};
Math.asinh = function(x){
	return Math.log(x + Math.sqrt(1+x*x));
};
Math.acosh = function(x){
	return 2 * Math.log( Math.sqrt((x+1)/2) + Math.sqrt((x-1)/2) );
};
Math.atanh = function(x){
	return (Math.log(1+x) - Math.log(1-x)) / 2;
};
Math.csch = function(x){
	x = Math.exp(x);
	return 2 / (x - 1/x);
};
Math.sech = function(x){
	x = Math.exp(x);
	return 2 / (x + 1/x);
};
Math.coth = function(x){
	x = Math.exp(x);
	return (x*x + 1) / (x*x - 1);
};
Math.acsch = function(x){
	x = 1/x;
	return Math.log(x + Math.sqrt(1+x*x));
};
Math.asech = function(x){
	x = 1/x;
	return 2 * Math.log( Math.sqrt((x+1)/2) + Math.sqrt((x-1)/2) );
};
Math.acoth = function(x){
	x = 1/x;
	return (Math.log(1+x) - Math.log(1-x)) / 2;
};



// Enough Trig!!!

Math.log10 = function(x){
	return Math.log(x)/2.302585092994046;
};
Math.sqr = function(x){
	return x*x;
};
Math.sign = function(x){
	return x > 0 ? 1 : x < 0 ? -1 : x==0 ? 0 : undefined;
};

function parseMath(a){

	a = a.split(' ').join('').toLowerCase().split('');

	if (a.length==0) return [false, 'Error 000. Nothing entered'];
	
	var c_alpha = "abcdefghijklmnopqrstuvwxyz";
	var c_numero = "0.123456789";
	var c_opera = ",+-*/%^";
	var c_all = c_alpha + c_numero + c_opera + '()';

	var i,j,k;
	
	var level=0;
	var word;
	var decimal;
	
	var level2;
	
	var mode = 'ready';
	
	i=0, j;

	var functionList = '\
		-sin-cos-tan-\
		-asin-acos-atan-\
		-csc-sec-cot-\
		-acsc-asec-acot-\
		-sinh-cosh-tanh-\
		-asinh-acosh-atanh-\
		-csch-sech-coth-\
		-acsch-asech-acoth-\
	';

	functionList += '-sqrt-exp-abs-sign-sqr-log-';

	
	while (i<a.length) switch (mode) {
		case 'end' :
			if (a[i]=='+' || a[i]=='-' || a[i]=='*' || a[i]=='/') {
				i++;
				mode = 'ready';
				break;
			}
			if (a[i]=='^') {
				mode = 'power';
				break;
			}
			if (a[i]=='(') {
				a.splice(i,0,'*'), i++;
				mode = 'ready';
				break;
			}
			if (a[i]==')') {
				if (level<1) return [false, '<A href="http://Error 002. Grouping symbol error'];
				level--;
				i++;
				break;
			}
			if (c_numero.indexOf(a[i])>=0) {
				a.splice(i,0,'*'), i++;
				mode = 'numero';
				break;
			}
			if (c_alpha.indexOf(a[i])>=0) {
				a.splice(i,0,'*'), i++;
				mode = 'alpha';
				break;
			}
			return [false, 'Error 001. Invalid character after a term'];

		case 'ready' :
			for (; i<a.length; i++) {
				if (a[i]=='-') {
					if (i>0) {
						if (a[i-1]=='-') a.splice(i-1,2,'+'), i--;
						else if (a[i-1]=='+') a.splice(i-1,1), i--;
					}
					continue;
				}
				if (a[i]=='+') {
					if (i>0 && (a[i-1]=='-' || a[i-1]=='+')) a.splice(i,1), i--;
					continue;
				}
				if (c_numero.indexOf(a[i])>=0) {
					mode='numero';
					break;
				}
				if (c_alpha.indexOf(a[i])>=0) {
					mode='alpha';
					break;
				}
				if (a[i]=='(') {
					level++;
					continue;
				}

				if (a[i]==')') return [false, 'Error 002. Grouping symbol error'];
				return [false, 'Syntax Error (mode: ready)'];
			}
			break;
		case 'numero' :
			decimal = a[i++]=='.';
			for (; i<a.length; i++) {
				if (c_numero.indexOf(a[i])>=0) {
					if (a[i]=='.') {
						if (decimal) return [false, 'Error 003. Decimal place error'];
						decimal=true;
					}
					continue;
				}
				mode = 'end';
				break;
			}
			break;
		case 'alpha' :
			word = a[i++];
			for (; i<a.length; i++) {
				if (c_alpha.indexOf(a[i])>=0) word+=a[i];
				else break;
			}
			if (i<a.length && c_numero.indexOf(a[i])>=0) return [false, 'Error 004. Numeral illegally following a pronumeral'];
			mode = 'end';
			
			if (word=='pi') a.splice(i-2, 2, '3.141592653589793'), i-=1;
			else if (word=='e') a[i-1]='2.718281828459045';
			else if (word=='phi') a.splice(i-3, 3, '1.618033988749895'), i-=2;
			else if (word=='rand') a.splice(i-4, 4, '(','Math.random(',')',')');
			else if (functionList.indexOf('-'+word+'-')>=0) {
				if (i<a.length && a[i]=='(') {
					a.splice(i-word.length, word.length+1, 'Math.'+word+'(');
					i-=word.length-1;
					level++;
					mode = 'ready';
				}
				else return [false, 'Error 005. Function: <B>'+word+'</B> is being treated as a constant'];
			}
			else if (word!='x' && word!='y') {
				return [false, 'Error 006. Unknown variable: <B>'+(word.length<13 ? word : word.substr(0,13)+'...')+'</B>'];
			}

			break;
		
		case 'power' :
			a[i]=',';
			// look left...
			level2=0;
			for (j=i-1; j>=0; j--) {
				if (a[j]==')') level2++;
				else if (level2==0 && (a[j].indexOf('(')>=0 || a[j]==',' || a[j]=='+' || a[j]=='-' || a[j]=='*' || a[j]=='/')) {
					break;
				}
				else if (a[j].indexOf('(')>=0) level2--;
			}
			a.splice(j+1, 0, 'Math.pow('), i++;
			
			// look right...
			decimal = false; // decimal means not a + or a -
			level2 = 0;
			for (j=i+1; j<a.length; j++) {
				if (a[j]!='+' && a[j]!='-') decimal=true;
				if (a[j]=='(') level2++;
				else if (decimal && level2==0 && (a[j]==')' || a[j]=='+' || a[j]=='-' || a[j]=='*' || a[j]=='/')) {
					break;
				}
				else if (a[j]==')') level2--;
			}
			a.splice(j, 0, ')'); // no need to increment i, this is after i,

			level++;
			i++
			mode = 'ready';

			break;
		
		
		
		
		default : i++;	
	
	}
	if (level!=0) return [false, 'Error 008. Grouping symbol error'];
	if (mode=='start' || mode=='ready') return [false, 'Error 007. Invalid final character'];

	
	return [true, a.join('')];
}