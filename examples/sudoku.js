/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// The sudoku solver is implemented using a finite domain constraint solver
	// coffee! is just WebPack build-time magic, can be configured away
	// Bundle using:
	//   webpack examples/sudoku.js dist/examples/sudoku.js
	var sudoku = __webpack_require__(1);

	// Implement JsJob entrypoint.
	// Should be kept small and call into other functions for the real work
	window.jsJobRun = function(input, options, callback) {
	  if (!input.board) {
	    return callback(new Error("Missing .board property in input data"));
	  }

	  var solutions = sudoku.solveBoard(input.board);
	  if (solutions.length == 0) {
	    return callback(new Error("No solutions found"));
	  }
	  if (solutions.length > 1) {
	    return callback(new Error(solutions.length + " solutions found. A proper Sudoku only has one."));
	  }

	  var result = solutions[0];
	  return callback(null, result);
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, module) {var FD, cols, example, main, parseBoard, renderBoard, rows, setupSudoku, solveBoard;

	FD = __webpack_require__(4);

	rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

	cols = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

	setupSudoku = function(S) {
	  var i, i2, j, j2, k, m, n, p, q, r, s, t, u, varName, vars, w, x;
	  vars = [];
	  for (i = m = 0; m < 9; i = ++m) {
	    for (j = n = 0; n < 9; j = ++n) {
	      varName = rows[i] + cols[j];
	      vars.push(varName);
	      S.addVar(varName, [1, 9]);
	    }
	  }
	  for (i = p = 0; p < 9; i = ++p) {
	    k = [];
	    for (j = q = 0; q < 9; j = ++q) {
	      k.push(rows[i] + cols[j]);
	    }
	    S.distinct(k);
	  }
	  for (i = r = 0; r < 9; i = ++r) {
	    k = [];
	    for (j = s = 0; s < 9; j = ++s) {
	      k.push(rows[j] + cols[i]);
	    }
	    S.distinct(k);
	  }
	  for (i = t = 0; t < 3; i = ++t) {
	    for (j = u = 0; u < 3; j = ++u) {
	      k = [];
	      for (i2 = w = 0; w < 3; i2 = ++w) {
	        for (j2 = x = 0; x < 3; j2 = ++x) {
	          k.push(rows[i * 3 + i2] + cols[j * 3 + j2]);
	        }
	      }
	      S.distinct(k);
	    }
	  }
	  return vars;
	};

	parseBoard = function(vars, str) {
	  var board, char, index, len, m, position;
	  board = {};
	  for (index = m = 0, len = str.length; m < len; index = ++m) {
	    char = str[index];
	    position = vars[index];
	    if (char !== '.') {
	      board[position] = parseInt(char);
	    }
	  }
	  return board;
	};

	renderBoard = function(board) {
	  var i, j, l, lines, m, n, name, v;
	  lines = [];
	  for (i = m = 0; m < 9; i = ++m) {
	    l = '';
	    for (j = n = 0; n < 9; j = ++n) {
	      name = rows[i] + cols[j];
	      v = board[name] || ' ';
	      l += " " + v + " ";
	    }
	    lines.push(l);
	  }
	  return lines.join('\n');
	};

	solveBoard = function(board, o) {
	  var k, options, position, solutions, solver, v, value, vars;
	  if (o == null) {
	    o = {};
	  }
	  solver = new FD.Solver;
	  vars = setupSudoku(solver);
	  if (typeof board === 'string') {
	    board = parseBoard(vars, board);
	  }
	  if (board == null) {
	    throw new Error("Invalid start board");
	  }
	  for (position in board) {
	    value = board[position];
	    solver.eq(position, value);
	  }
	  options = {
	    log: 0,
	    max: 100,
	    distribute: 'fail_first'
	  };
	  for (k in o) {
	    v = o[k];
	    options[k] = v;
	  }
	  solutions = solver.solve(options);
	  return solutions;
	};

	example = '.94...13..............76..2.8..1.....32.........2...6.....5.4.......8..7..63.4..8';

	main = function() {
	  var board, solutions, usage;
	  board = process.argv[2];
	  usage = "Usage: coffee finitedomain-sudoku PUZZLE\n\nExample, from http://www2.warwick.ac.uk/fac/sci/moac/people/students/peter_cock/python/sudoku\n\n  coffee finitedomain-sudoku " + example;
	  if (!board) {
	    console.log(usage);
	    process.exit(1);
	  }
	  solutions = solveBoard(board);
	  if (!solutions.length) {
	    throw new Error("No solutions found. Not a proper Sudoku puzzle");
	  }
	  if (solutions.length > 1) {
	    throw new Error("Multiple solutions found (" + solutions.length + "). Not a proper Sudoku puzzle");
	  }
	  return console.log(renderBoard(solutions[0]));
	};

	module.exports.solveBoard = solveBoard;

	module.exports.example = example;

	if (!module.parent && (typeof window === "undefined" || window === null)) {
	  main();
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), __webpack_require__(3)(module)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var FD,__slice=[].slice;FD=("undefined"!=typeof module&&null!==module&&module||{}).exports=function(){function a(a){return Lc[a]?Lc[a]:void Na("distribution.get_defaults: Unknown preset: "+a)}function b(a,b,d,e,f){var g,h,i,j,k,l,m,n;for(null==f&&(f=!0),h=[],g=[],k=0,i=m=0,n=b.length;n>m;i=++m)j=b[i],j>0&&(l=d[i],x(a,l)&&(k+=j,g.push(k),h.push(l)));return 0!==g.length?1===g.length?h[0]:c(e,k,g,h,f):void 0}function c(a,b,c,d,e){var f,g,h,i,j,k;for(i=a(),h=i,e&&(h=i*b),f=j=0,k=c.length;k>j&&(g=c[f],!(g>h));f=++j);return d[f]}function d(a,b,c){var d,f,g,h,i,j;if(!xa(c))return d=b.next_distribution_choice++,f=a.config_next_value_func,i=c.id,g=a.config_var_dist_options,h=null!=(j=g[i])?j.distributor_name:void 0,h&&(f=h),"function"==typeof f?f:e(f,b,a,c,d)}function e(a,b,c,d,e){switch(a){case"max":return h(d,e);case"markov":return o(b,d,e);case"mid":return i(d,e);case"min":return g(d,e);case"minMaxCycle":return l(b,d,e);case"list":return f(c,b,d,e);case"naive":return sa(fdvar_min(d));case"splitMax":return k(d,e);case"splitMin":return j(d,e);case"throw":}Na("unknown next var func",config_next_value_func)}function f(a,b,c,d){var e,f,g;switch(e=a.config_var_dist_options,g=e[c.id].list,f="function"==typeof g?g(b,c.id,d):g,d){case qc:return sa(E(c.dom,f));case Vc:return C(c.dom,f)}}function g(a,b){switch(b){case qc:return sa(Fa(a));case Vc:return N(a.dom,ta(Fa(a)+1,Ga(a)))}}function h(a,b){switch(b){case qc:return sa(Ga(a));case Vc:return N(a.dom,ta(Fa(a),Ga(a)-1))}}function i(a,b){var c,d,e,f;switch(f=Ha(a),b){case qc:return sa(f);case Vc:return e=Fa(a),d=Ga(a),c=[],f>e&&c.push(e,f-1),d>f&&c.push(f+1,d),N(a.dom,c)}}function j(a,b){var c,d,e,f;switch(c=a.dom,e=aa(c),d=ba(c),f=e+d>>1,b){case qc:return N(a.dom,ta(e,f));case Vc:return N(a.dom,ta(f+1,d))}}function k(a,b){var c,d,e,f;switch(c=a.dom,e=aa(c),d=ba(c),f=e+d>>1,b){case qc:return N(a.dom,ta(f+1,d));case Vc:return N(a.dom,ta(e,f))}}function l(a,b,c){var d;return d=$b(a),m(d.all_var_names.indexOf(b.id))?g(b,c):h(b,c)}function m(a){return a%2===0}function o(a,c,d){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s;switch(d){case qc:if(o=$b(a),h=c.dom,s=c.id,f=o.config_var_dist_options,g=f[s],i=g.expandVectorsWith,n=g.random||Ec,r=Pa(null!=i,g.legend,h),q=r.length,!q)return;if(m=Ra(a,g.matrix,i,q),p=b(h,m,r,n),null==p)return;return a._markov_last_value=p,sa(p);case Vc:if(k=a._markov_last_value,l=Fa(c),j=Ga(c),e=[],k>l&&e.push(l,k-1),j>k&&e.push(k+1,j),h=N(c.dom,e),h.length)return h}}function p(a,b,c){var d,e,f,g,h;if(d=a.config_next_var_func,g=b.vars,"function"==typeof d)return d(b,c);switch(f=d,"object"==typeof d&&(f=d.dist_name),f){case"naive":h=null;break;case"size":h=r;break;case"min":h=s;break;case"max":h=t;break;case"throw":break;case"markov":h=u;break;case"list":h=v;break;default:Na("unknown next var func",f)}if(e=a.config_var_filter_func,e&&"function"!=typeof e)switch(e){case"unsolved":e=wa;break;default:Na("unknown var filter",e)}return q(g,c,h,e,d,a)}function q(a,b,c,d,e,f){var g,h,i,j,k,l;for(g="",i=k=0,l=b.length;l>k;i=++k)j=b[i],h=a[j],(!d||d(h))&&(!g||c&&kc===c(h,g,f,e))&&(g=h);return g}function r(a,b){var c;return c=Ea(a)-Ea(b),0>c?kc:c>0?$c:Uc}function s(a,b){var c;return c=Fa(a)-Fa(b),0>c?kc:c>0?$c:Uc}function t(a,b){var c;return c=Ga(a)-Ga(b),c>0?kc:0>c?$c:Uc}function u(a,b,c,d){var e,f;return"markov"===(null!=(e=c.config_var_dist_options[a.id])?e.distributor_name:void 0)?kc:"markov"===(null!=(f=c.config_var_dist_options[b.id])?f.distributor_name:void 0)?$c:w(a,b,c,d.fallback_config)}function v(a,b,c,d){var e,f,g,h;return e=d.priority_hash,g=e[a.id],h=e[b.id],g||h?(f=d.inverted,h?g?g>h?f?$c:kc:h>g?f?kc:$c:Uc:f?kc:$c:f?$c:kc):w(a,b,c,d.fallback_config)}function w(a,b,c,d){var e;if(!d)return Uc;if("string"==typeof d)e=d;else if("object"==typeof d)e=d.dist_name,e||Na("Missing fallback var distribution name: "+JSON.stringify(d));else{if("function"==typeof d)return d(a,b,c);Na("Unexpected fallback config",d)}switch(e){case"size":return r(a,b);case"min":return s(a,b);case"max":return t(a,b);case"throw":Na("nope");break;case"markov":return u(a,b,c,d);case"list":return v(a,b,c,d);default:Na("Unknown var dist fallback name: "+e)}}function x(a,b){return y(a,b)!==Hc}function y(a,b){var c,d,e,f;for(Kc>0?(c=e=0,f=a.length):c=e=a.length-1;Kc>0?f>e:e>=0;c=e+=Kc)if(d=a[c],b>=d&&b<=a[c+1])return c;return Hc}function z(a,b){return a.length!==Kc?!1:a[Dc]===b&&a[wc]===b}function A(a,b,c){var d,e,f,g,h,i,j;for(null==b&&(b=!0),null==c&&(c=!0),b&&(a=a.slice(0)),c&&a.sort(function(a,b){return a-b}),d=[],f=i=0,j=a.length;j>i;f=++i)h=a[f],0===f?(g=h,e=h):(h>e+1&&(d.push(g,e),g=h),e=h);return d.push(g,e),d}function B(a){var b,c,d,e,f,g,h,i;for(c=[],Kc>0?(b=f=0,h=a.length):b=f=a.length-1;Kc>0?h>f:f>=0;b=f+=Kc)for(d=a[b],e=g=d,i=a[b+1];i>=d?i>=g:g>=i;e=i>=d?++g:--g)c.push(e);return c}function C(a,b){var c,d,e,f;for(e=0,f=b.length;f>e;e++)if(d=b[e],c=y(a,d),c>=0)return D(a,d,c)}function D(a,b,c){var d,e,f,g,h,i;for(g=c?a.slice(0,c):[],e=h=c,i=a.length;Kc>0?i>h:h>i;e=h+=Kc)f=a[e],d=a[e+1],e!==c?g.push(f,d):(f!==b&&g.push(f,b-1),d!==b&&g.push(b+1,d));return g}function E(a,b){var c,d,e;for(d=0,e=b.length;e>d;d++)if(c=b[d],x(a,c))return c;return Jc}function F(a,b,c){return null==b&&(b=Ic),b===Ic&&(a=a.slice(0)),0===a.length?a:(L(a)||G(a),a)}function G(a){return H(a),M(a)}function H(a){var b;b=a.length,b>=4&&I(a,0,a.length-Kc)}function I(a,b,c){var d;c>b&&(d=J(a,b,c),I(a,b,d-Kc),I(a,d+Kc,c))}function J(a,b,c){var d,e,f,g,h,i,j;for(h=c,g=a[h],i=a[h+1],f=b,e=j=b;Kc>0?c>j:j>c;e=j+=Kc)d=a[e],(g>d||d===g&&a[e+1]<i)&&(K(a,f,e),f+=Kc);return K(a,f,c),f}function K(a,b,c){var d,e;b!==c&&(d=a[b],e=a[b+1],a[b]=a[c],a[b+1]=a[c+1],a[c]=d,a[c+1]=e)}function L(a){var b,c,d,e,f,g;if(a.length===Kc)return!0;if(0===a.length)return!0;for(e=Xc,Kc>0?(c=f=0,g=a.length):c=f=a.length-1;Kc>0?g>f:f>=0;c=f+=Kc){if(d=a[c],b=a[c+1],e+1>=d)return!1;e=b}return!0}function M(a){var b,c,d,e,f,g,h,i,j,k,l;for(d=Xc,h=0,Kc>0?(f=i=0,k=a.length):f=i=a.length-1;Kc>0?k>i:i>=0;f=i+=Kc)c=a[f],b=a[f+1],d+1>=c&&0!==f?b>d&&(a[e]=b,d=b):(a[h]=c,a[h+1]=b,e=h+1,h+=Kc,d=b);for(a.length=h,j=0,l=a.length;l>j;j++)g=a[j];return a}function N(a,b){var c;return c=[],O(a,b,c),F(c),c}function O(a,b,c){var d,e,f,g,h,i,j,k;j=a.length,k=b.length,0!==j&&0!==k&&(j===Kc?k===Kc?P(a[Dc],a[wc],b[Dc],b[wc],c):O(b,a,c):k===Kc?Q(a,b[Dc],b[wc],c):(h=(j/Kc>>1)*Kc,i=(k/Kc>>1)*Kc,d=a.slice(0,h),e=a.slice(h),f=b.slice(0,i),g=b.slice(i),O(d,f,c),O(d,g,c),O(e,f,c),O(e,g,c)))}function P(a,b,c,d,e){var f,g;return g=Fc(a,c),f=Gc(b,d),f>=g&&e.push(g,f),e}function Q(a,b,c,d){var e,f,g,h,i;for(Kc>0?(f=h=0,i=a.length):f=h=a.length-1;Kc>0?i>h:h>=0;f=h+=Kc)g=a[f],e=a[f+1],c>=g&&e>=b&&d.push(Fc(b,g),Gc(c,e))}function R(a,b){var c;return c=a.length,c!==b.length?!1:a===b?!0:S(a,b,c)}function S(a,b,c){var d,e;for(d=e=0;c>=0?c>e:e>c;d=c>=0?++e:--e)if(a[d]!==b[d])return!1;return!0}function T(a,b){var c,d,e,f,g,h,i;for(g=[],Kc>0?(d=h=0,i=a.length):d=h=a.length-1;Kc>0?i>h:h>=0;d=h+=Kc)e=a[d],c=a[d+1],0===d?(g.push(e,c),f=e):b>c-f?g[g.length-1]=c:(g.push(e,c),f=e);return g}function U(a){var b,c,d,e,f,g,h;for(e=Yc,Kc>0?(c=g=0,h=a.length):c=g=a.length-1;Kc>0?h>g:g>=0;c=g+=Kc)d=a[c],b=a[c+1],f=1+b-d,e>f&&(e=f);return e}function V(a,b){for(var c,d;;)if(c=_c,d=T(a,U(b)),c+=a.length-d.length,a=d,d=T(b,U(a)),c+=b.length-d.length,b=d,c===_c)break;return[a,b]}function W(a,b){var c,d,e,f,g,h,i,j,k,l,m,n;for(n=V(a,b),a=n[0],b=n[1],i=[],Kc>0?(e=j=0,l=a.length):e=j=a.length-1;Kc>0?l>j:j>=0;e=j+=Kc)for(g=a[e],c=a[e+1],Kc>0?(f=k=0,m=b.length):f=k=b.length-1;Kc>0?m>k:k>=0;f=k+=Kc)h=b[f],d=b[f+1],i.push(Gc(Yc,g+h),Gc(Yc,c+d));return F(i,xc)}function X(a,b){var c,d,e,f,g,h,i,j,k,l,m;for(i=[],Kc>0?(e=j=0,l=a.length):e=j=a.length-1;Kc>0?l>j:j>=0;e=j+=Kc)for(g=a[e],c=a[e+1],Kc>0?(f=k=0,m=b.length):f=k=b.length-1;Kc>0?m>k:k>=0;f=k+=Kc)h=b[f],d=b[f+1],i.push(Gc(Yc,g*h),Gc(Yc,c*d));return F(i,xc)}function Y(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p;for(p=V(a,b),a=p[0],b=p[1],k=[],Kc>0?(f=l=0,n=a.length):f=l=a.length-1;Kc>0?n>l:l>=0;f=l+=Kc)for(i=a[f],d=a[f+1],Kc>0?(g=m=0,o=b.length):g=m=b.length-1;Kc>0?o>m:m>=0;g=m+=Kc)j=b[g],e=b[g+1],h=i-e,c=d-j,c>=Xc&&k.push(Fc(Xc,h),c);return F(k,xc)}function Z(a,b,c){var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r;for(null==c&&(c=!0),m=[],Kc>0?(g=o=0,q=a.length):g=o=a.length-1;Kc>0?q>o:o>=0;g=o+=Kc)for(k=a[g],e=a[g+1],Kc>0?(h=p=0,r=b.length):h=p=b.length-1;Kc>0?r>p:p>=0;h=p+=Kc)l=b[h],f=b[h+1],f>0&&(j=k/f,d=l>0?e/l:Yc,i=lc(Fc(0,j)),n=uc(d),n>=i?m.push(i,n):c&&m.push(n,n));return F(m,xc)}function $(a){var b,c,d,e,f;for(b=0,Kc>0?(c=e=0,f=a.length):c=e=a.length-1;Kc>0?f>e:e>=0;c=e+=Kc)d=a[c],b+=1+a[c+1]-d;return b}function _(a){var b,c,d,e,f,g,h,i;for(f=$(a),g=uc(f/2),Kc>0?(d=h=0,i=a.length):d=h=a.length-1;(Kc>0?i>h:h>=0)&&(e=a[d],c=a[d+1],b=1+c-e,!(b>g));d=h+=Kc)g-=b;return e+g}function aa(a){return a[Dc]}function ba(a){return a[a.length-1]}function ca(a,b,c){a[Dc]=b,a[wc]=c,a.length=Kc}function da(a){return a.length===Kc&&ga(a)}function ea(a){var b;return b=a.length,0===b?!0:b===Kc&&ga(a)}function fa(a){return 0===a.length}function ga(a){return a[Dc]===a[wc]}function ha(a,b){var c,d;for(d=a.length,c=d-Kc;c>=0&&a[c]>=b;)c-=Kc;return 0>c?(a.length=0,0!==d):(a.length=c+Kc,a[c+1]>=b?(a[c+1]=b-1,!0):d!==c+Kc)}function ia(a,b){var c,d,e,f,g;for(e=a.length,c=0;e>c&&a[c+1]<=b;)c+=Kc;if(c>=e)return a.length=0,0!==e;for(f=0,d=g=c;e>=c?e>g:g>e;d=e>=c?++g:--g)a[f++]=a[d];return a.length=f,a[tc]<=b?(a[tc]=b+1,!0):e!==f}function ja(a,b,c){var d,e,f,g,h;for(f=0;c>f;){if(g=a[f],d=a[f+1],h=b[f],e=b[f+1],g!==h||d!==e)return f;f+=Kc}return c}function ka(a,b,c,d,e){var f,g,h,i,j,k,l;for(k=a,l=a,i=b[k],g=b[k+1],j=c[l],h=c[l+1];d>k&&e>l;)j>g?(k+=Kc,i=b[k],g=b[k+1]):i>h?(l+=Kc,j=c[l],h=c[l+1]):j>i?i=j:i>j?j=i:(f=Gc(g,h),b[a]=c[a]=i,b[a+1]=c[a+1]=f,a+=Kc,f===g?(k+=Kc,i=b[k],g=b[k+1]):i=f+1,f===h?(l+=Kc,j=c[l],h=c[l+1]):j=f+1);return d!==a&&(b.length=a),e!==a&&(c.length=a),0===a?Tc:Wc}function la(a,b){var c,d,e,f;return e=a.length,f=b.length,d=Gc(e,f),0===d?(a.length=0,b.length=0,Tc):(c=ja(a,b,d),c!==d?ka(c,a,b,e,f):mc)}function ma(a,b){var c,d,e;for(c=d=b,e=a.length;Kc>0?e>d:d>e;c=d+=Kc)a[c]=a[c+Kc],a[c+1]=a[c+Kc+1];a.length=c-Kc}function na(a,b,c,d){var e,f,g,h,i;for(f=h=b,i=a.length;Kc>0?i>h:h>i;f=h+=Kc)g=a[f],e=a[f+1],a[f]=c,a[f+1]=d,c=g,d=e;a[f]=c,a[f+1]=d,a.length=f+Kc}function oa(a,b,c,d,e){var f,g;return d===b?e===b?void ma(a,c):void(a[c]=b+1):e===b?void(a[c+1]=b-1):(a[c+1]=b-1,g=b+1,f=e,void na(a,c+Kc,g,f))}function pa(a,b){var c,d,e,f,g;for(Kc>0?(d=f=0,g=a.length):d=f=a.length-1;Kc>0?g>f:f>=0;d=f+=Kc)if(e=a[d],c=a[d+1],b>=e&&c>=b)return oa(a,b,d,e,c),fa(a)?Tc:Wc;return _c}function qa(a,b){var c,d,e,f,g,h,i,j;for(d=g=0,i=a.length;i>g;d=g+=2)for(f=a[d],c=a[d+1],e=h=0,j=b.length;j>h;e=h+=2)if(!(c<b[e]||f>b[e+1]))return!1;return!0}function ra(){return[0,1]}function sa(a){return[a,a]}function ta(a,b){return[a,b]}function ua(a,b){return va(a,b,0)}function va(a,b){return{id:a,dom:b,was_solved:!1}}function wa(a){return!ea(a.dom)}function xa(a){return da(a.dom)}function ya(a,b){return z(a.dom,b)}function za(a){return fa(a.dom)}function Aa(a){return va(a.id,a.dom.slice(0))}function Ba(a,b){return R(a.dom,b)?_c:(a.dom=b,Wc)}function Ca(a,b){ca(a.dom,b,b)}function Da(a,b){return b=N(a.dom,b),b.length?Ba(a,b):Tc}function Ea(a){return $(a.dom)}function Fa(a){return aa(a.dom)}function Ga(a){return ba(a.dom)}function Ha(a){return _(a.dom)}function Ia(a,b){return ha(a.dom,b)?Wc:_c}function Ja(a,b){return ia(a.dom,b)?Wc:_c}function Ka(a,b){var c;return c=la(a.dom,b.dom),c===Tc?Tc:c}function La(a,b){var c,d,e;return e=_c,c=a.dom,d=b.dom,a.was_solved||xa(a)?e=pa(d,aa(c)):(b.was_solved||xa(b))&&(e=pa(c,aa(d))),e}function Ma(a){var b,c,d,e;for(c=[],d=0,e=a.length;e>d;d++)b=a[d],c.push(vc(b));return c}function Na(a){throw new Error(a)}function Oa(a,b){var c,d,e,f,g;for(e=a.vars,f=0,g=b.length;g>f&&(d=b[f],c=e[d.booleanId],c&&!ya(c,1));f++);return d}function Pa(a,b,c){return a?Qa(b,c):b}function Qa(a,b){var c,d,e,f,g;for(c=a?a.slice(0):[],g=B(b),e=0,f=g.length;f>e;e++)d=g[e],c.indexOf(d)<0&&c.push(d);return c}function Ra(a,b,c,d){var e,f,g,h;if(g=Oa(a,b),null!=c){if(f=g.vector&&g.vector.slice(0)||[],e=d-f.length,e>0)for(h=0;e>=0?e>h:h>e;e>=0?h++:h--)f.push(c);return f}return f=g.vector,f||Na("distribution_value_by_markov error, each markov var must have a prob vector or use `expandVectorsWith:{Number}`"),f.length!==d&&Na("distribution_value_by_markov error, vector must be same length of legend or use `expandVectorsWith:{Number}`"),f}function Sa(a,b,c,d,e){var f;switch(b){case"eq":f="neq";break;case"neq":f="eq";break;case"lt":f="gte";break;case"gt":f="lte";break;case"lte":f="gt";break;case"gte":f="lt";break;default:Na("add_reified: Unsupported operator '"+b+"'")}return e?Da(a.vars[e],ra())===Tc&&Na("boolean var should start with a domain containing zero, one, or both"):e=ec(a,0,1),"number"==typeof c?(c=ec(a,c),"number"==typeof d&&Na("must pass in at least one var name")):"number"==typeof d&&(d=ec(a,d),"number"==typeof c&&Na("must pass in at least one var name")),ic(a,["reified",[c,d,e],b,f]),e}function Ta(a,b,c){var d;return"number"==typeof b?(b=ec(a,b),"number"==typeof c&&Na("must pass in at least one var name")):"number"==typeof c&&(d=ec(a,c),c=b,b=d,"number"==typeof c&&Na("must pass in at least one var name")),ic(a,["eq",[b,c]]),b}function Ua(a,b,c){"number"==typeof b?(b=ec(a,b),"number"==typeof c&&Na("must pass in at least one var name")):"number"==typeof c&&(c=ec(a,c),"number"==typeof b&&Na("must pass in at least one var name")),ic(a,["lt",[b,c]])}function Va(a,b,c){Ua(a,c,b)}function Wa(a,b,c){"number"==typeof b?(b=ec(a,b),"number"==typeof c&&Na("must pass in at least one var name")):"number"==typeof c&&(c=ec(a,c),"number"==typeof b&&Na("must pass in at least one var name")),ic(a,["lte",[b,c]])}function Xa(a,b,c,d){return"undefined"==typeof d?d=ec(a):"number"==typeof d?d=ec(a,d):"string"!=typeof d&&Na("expecting result_name to be absent or a number or string: `"+d+"`"),"number"==typeof b?(b=ec(a,b),"number"==typeof c&&Na("must pass in at least one var name")):"number"==typeof c&&(c=ec(a,c),"number"==typeof b&&Na("must pass in at least one var name")),ic(a,["mul",[b,c,d]]),d}function Ya(a,b,c,d){return"undefined"==typeof d?d=ec(a):"number"==typeof d?d=ec(a,d):"string"!=typeof d&&Na("expecting result_name to be absent or a number or string: `"+d+"`"),"number"==typeof b?(b=ec(a,b),"number"==typeof c&&Na("must pass in at least one var name")):"number"==typeof c&&(c=ec(a,c),"number"==typeof b&&Na("must pass in at least one var name")),ic(a,["div",[b,c,d]]),d}function Za(a,b,c){Wa(a,c,b)}function $a(a,b,c){"number"==typeof b?(b=ec(a,b),"number"==typeof c&&Na("must pass in at least one var name")):"number"==typeof c&&(c=ec(a,c),"number"==typeof b&&Na("must pass in at least one var name")),ic(a,["neq",[b,c]])}function _a(a,b){var c,d,e,f,g,h;for(c=f=0,h=b.length;h>f;c=++f)for(e=b[c],d=g=0;c>=0?c>g:g>c;d=c>=0?++g:--g)$a(a,e,b[d])}function ab(a,b,c,d,e,f){return"number"==typeof d?(d=ec(a,d),"number"==typeof e&&Na("must pass in at least one var name")):"number"==typeof e&&(e=ec(a,e),"number"==typeof d&&Na("must pass in at least one var name")),"undefined"==typeof f?f=ec(a):"number"==typeof f?f=ec(a,f):"string"!=typeof f&&Na("expecting sumname to be absent or a number or string: `"+f+"`"),bb(a,d,e,f,b),bb(a,f,e,d,c),bb(a,f,d,e,c),f}function bb(a,b,c,d,e){ic(a,["ring",[b,c,d],e])}function cb(a,b,c,d){return ab(a,"plus","min",b,c,d)}function db(a,b,c,d){return"number"==typeof b?(b=ec(a,b),"number"==typeof c&&Na("must pass in at least one var name")):"number"==typeof c&&(c=ec(a,c),"number"==typeof b&&Na("must pass in at least one var name")),"undefined"==typeof d?d=ec(a):"number"==typeof d?d=ec(a,d):"string"!=typeof d&&Na("expecting result_var to be absent or a number or string: `"+d+"`"),ic(a,["min",[b,c,d]]),d}function eb(a,b,c,d){return ab(a,"mul","div",b,c,d)}function fb(a,b,c){var d,e,f,g;switch(c||(c=ec(a)),d=b.length){case 0:Na("propagator_add_sum: Nothing to sum!");break;case 1:Ta(a,b[0],c);break;case 2:cb(a,b[0],b[1],c);break;default:e=Math.floor(b.length/2),e>1?(f=ec(a),fb(a,b.slice(0,e),f)):f=b[0],g=ec(a),fb(a,b.slice(e),g),cb(a,f,g,c)}return c}function gb(a,b,c){var d,e,f;switch(c||(c=ec(a)),b.length){case 0:return retval;case 1:Ta(a,b[0],c);break;case 2:eb(a,b[0],b[1],c);break;default:d=Math.floor(b.length/2),d>1?(e=ec(a),gb(a,b.slice(0,d),e)):e=b[0],f=ec(a),gb(a,b.slice(d),f),eb(a,e,f,c)}return c}function hb(a,b){ic(a,["markov",[b]])}function ib(a,b,c){return c(a,b)?_c:Tc}function jb(a,b,c){var d,e;return e=Z(a.dom,b.dom),d=Da(c,e)}function kb(a,b){return Ka(a,b)}function lb(a,b){var c,d;return c=a.dom,d=b.dom,qa(c,d)}function mb(a,b){return xa(a)&&xa(b)}function nb(a,b){var c,d,e,f,g;switch(c=b[0],d=a[b[1][0]],e=a[b[1][1]],c){case"reified":return g=b[1][2],f=a[g],xa(f)?1===Fa(f)?ob(b[2],d,e):ob(b[3],d,e):!1;case"ring":return xa(d)&&xa(e)?!0:!1;case"callback":return!1;case"markov":return!1;case"min":return!1;case"div":return!1;case"mul":return!1;default:return ob(c,d,e)}}function ob(a,b,c){switch(a){case"lt":return rb(b,c);case"lte":return ub(b,c);case"gt":return rb(c,b);case"gte":return ub(c,b);case"eq":return mb(b,c);case"neq":return Ab(b,c);default:return Λ(!1,"unknown comparison op",a)}}function pb(a,b){var c,d,e,f,g,h;return f=Fa(a),c=Ga(a),g=Fa(b),d=Ga(b),c>=d&&(e=Ia(a,d),za(a)&&(e=Tc)),f>=g&&(h=Ja(b,f),za(b)&&(h=Tc)),e||h||_c}function qb(a,b){var c,d;return c=a.dom,d=b.dom,aa(c)>=ba(d)}function rb(a,b){return Ga(a)<Fa(b)}function sb(a,b){var c,d,e,f,g,h;return f=Fa(a),c=Ga(a),g=Fa(b),d=Ga(b),c>d&&(e=Ia(a,d+1),za(a)&&(e=Tc)),f>g&&(h=Ja(b,f-1),za(b)&&(h=Tc)),e||h||_c}function tb(a,b){var c,d;return c=a.dom,d=b.dom,aa(c)>ba(d)}function ub(a,b){return Ga(a)<=Fa(b)}function vb(a,b){var c,d,e,f,g,h,i,j,k,l;return j=a._root_space||a,g=a.vars[b],xa(g)?(k=Fa(g),c=j.config_var_dist_options,d=c[b],e=g.dom,b=g.id,f=d.expandVectorsWith,l=Pa(null!=f,d.legend,e),i=Ra(a,d.matrix,f,l.length),h=l.indexOf(k),h>=0&&h<i.length&&0!==i[h]?_c:Tc):_c}function wb(a,b,c){var d,e;return e=Y(a.dom,b.dom),d=Da(c,e)}function xb(a,b,c){var d,e;return e=X(a.dom,b.dom),d=Da(c,e)}function yb(a,b){return La(a,b)}function zb(a,b){var c,d,e,f,g,h;return c=a.dom,d=b.dom,f=c.length,g=d.length,0===f||0===g?!0:f!==Kc||g!==Kc?!1:(h=aa(c),e=ba(c),h===e&&h===aa(d)&&h===ba(d))}function Ab(a,b){return qa(a.dom,b.dom)}function Bb(a,b,c,d,e,f){var g,h,i,j,k,l,m;return l=a.vars,h=l[b],i=l[c],g=l[d],m=g.dom,k=m[0],j=m[1],0===k&&Nb(f,h,i)?0===j?Tc:(Ca(g,1),Wc):1===j&&Nb(e,h,i)?1===k?Tc:(Ca(g,0),Wc):1===k?Mb(a,e,b,c):0===j?Mb(a,f,b,c):_c}function Cb(a,b,c,d){var e,f;return f=d(a.dom,b.dom),e=N(f,c.dom),e.length?Ba(c,e):Tc}function Db(a,b){return Eb(b,a[Oc],a[Sc],a)}function Eb(a,b,c,d){var e,f;switch(e=c[0],f=c[1],b){case"lt":return Mb(a,b,e,f);case"lte":return Mb(a,b,e,f);case"eq":return Mb(a,b,e,f);case"neq":return Mb(a,b,e,f);case"callback":return Fb(a,c,d);case"reified":return Gb(a,e,f,c,d);case"ring":return Kb(a,e,f,c,d);case"markov":return Lb(a,e);case"min":return Hb(a,e,f,c);case"mul":return Ib(a,e,f,c,d);case"div":return Jb(a,e,f,c,d);default:Na("unsupported propagator: ["+d+"]")}}function Fb(a,b,c){return ib(a,b,c[Nc])}function Gb(a,b,c,d,e){var f;return f=d[2],Bb(a,b,c,f,e[Rc],e[Pc])}function Hb(a,b,c,d){var e,f;return f=d[2],e=a.vars,wb(e[b],e[c],e[f])}function Ib(a,b,c,d){var e,f;return f=d[2],e=a.vars,xb(e[b],e[c],e[f])}function Jb(a,b,c,d){var e,f;return f=d[2],e=a.vars,jb(e[b],e[c],e[f])}function Kb(a,b,c,d,e){var f,g,h;switch(g=a.vars,h=d[2],f=e[Qc]){case"plus":return Cb(g[b],g[c],g[h],W);case"min":return Cb(g[b],g[c],g[h],Y);case"mul":return Cb(g[b],g[c],g[h],X);case"div":return Cb(g[b],g[c],g[h],Z)}}function Lb(a,b){return vb(a,b)}function Mb(a,b,c,d){var e,f;switch(e=a.vars[c],f=a.vars[d],b){case"lt":return pb(e,f);case"lte":return sb(e,f);case"gt":return Mb(a,"lt",d,c);case"gte":return Mb(a,"lte",d,c);case"eq":return kb(e,f);case"neq":return yb(e,f);default:return Na("unsupported propagator: ["+b+"]")}}function Nb(a,b,c){switch(a){case"lt":return qb(b,c);case"lte":return tb(b,c);case"gt":return qb(c,b);case"gte":return tb(c,b);case"eq":return lb(b,c);case"neq":return zb(b,c);default:Na("stepper_step_read_only: unsupported propagator: ["+a+"]")}}function Ob(a){var b,c,d,e,f;for(c=!a.stack||0===a.stack.length,c&&(a.stack?a.stack.push(a.space):a.stack=[a.space]),b=a.next_choice||Pb,e=a.space,f=a.stack;f.length>0;)if(e=f[f.length-1],_b(e)){if(bc(e))return void Sb(a,e,f);(d=b(e,a))?f.push(d):(e.stable_children++,f.pop())}else Rb(a,e,f);a.status="end",a.more=!1}function Pb(a){var b,c,e,f,g;return f=$b(a),g=Qb(f,a),c=p(f,a,g),c&&(e=d(f,a,c))?(b=Ub(a),b.vars[c.id].dom=e,b):void 0}function Qb(a,b){var c;return c=a.config_targeted_vars,"all"===c?b.unsolved_var_names:c instanceof Array?c:config_target_vars(b)}function Rb(a,b,c){b.failed=!0,c.pop()}function Sb(a,b,c){c.pop(),a.status="solved",a.space=b,a.more=c.length>0}function Tb(){return Wb(null,[],{},[],[],0,0)}function Ub(a){var b,c,d,e,f,g,h,i,j,k;for(e=$b(a),b=a.all_var_names,f=[],c={},h=a.vars,g=[],k=a._propagators,i=0,j=k.length;j>i;i++)d=k[i],nb(h,d)||g.push(d);return Vb(b,h,c,f),Wb(e,g,c,b,f,a._depth+1,a._child_count++)}function Vb(a,b,c,d){var e,f,g,h;for(g=0,h=a.length;h>g;g++)f=a[g],e=b[f],e.was_solved?c[f]=e:(c[f]=Aa(e),d.push(f))}function Wb(a,b,c,d,e,f,g){return{_depth:f,_child:g,_child_count:0,_root_space:a,config_var_filter_func:"unsolved",config_next_var_func:"naive",config_next_value_func:"min",config_targeted_vars:"all",config_var_dist_options:{},config_timeout_callback:void 0,vars:c,all_var_names:d,unsolved_var_names:e,constant_cache:{},_propagators:b,next_distribution_choice:0}}function Xb(a,b){(null!=b?b.filter:void 0)&&(a.config_var_filter_func=b.filter),(null!=b?b["var"]:void 0)&&(a.config_next_var_func=b["var"],Yb(b["var"])),(null!=b?b.val:void 0)&&(a.config_next_value_func=b.val),(null!=b?b.targeted_var_names:void 0)&&(a.config_targeted_vars=b.targeted_var_names),(null!=b?b.var_dist_config:void 0)&&(a.config_var_dist_options=b.var_dist_config),(null!=b?b.timeout_callback:void 0)&&(a.config_timeout_callback=b.timeout_callback)}function Yb(a){for(var b,c,d,e,f,g,h;null!=a;){if(d=a.priority_list)for(b={},a.priority_hash=b,e=d.length,c=g=0,h=d.length;h>g;c=++g)f=d[c],b[f]=e-c;a=a.fallback_config}}function Zb(b,c){Xb(b,a(c))}function $b(a){return a._root_space||a}function _b(a){var b,c,d,e,f,g;for(b=!0,e=a._propagators;b;){for(b=!1,f=0,g=e.length;g>f;f++)if(d=e[f],c=Db(d,a),c===Wc)b=!0;else if(c===Tc)return!1;if(ac(a))return!1}return!0}function ac(a){var b,c;return c=$b(a),b=c.config_timeout_callback,b?b(a):!1}function bc(a){var b,c,d,e,f,g,h,i;for(g=a.vars,f=a.unsolved_var_names,d=0,c=h=0,i=f.length;i>h;c=++h)e=f[c],b=g[e],xa(b)?b.was_solved=!0:f[d++]=e;return f.length=d,0===d}function cc(a){var b,c,d,e,f,g;for(b={},d=a.vars,g=a.all_var_names,e=0,f=g.length;f>e;e++)c=g[e],dc(c,d,b);return b}function dc(a,b,c){var d,e;return d=b[a].dom,e=d,0===d.length?e=!1:da(d)&&(e=aa(d)),c[a]=e,e}function ec(a,b,c,d,e){var f;if(("number"==typeof b||b instanceof Array)&&(d=c,c=b,b=void 0),"number"==typeof c&&null==d&&b)return hc(a,b,sa(c)),b;if(null==b&&"number"==typeof c){if(null==d)return gc(a,c);if(!e&&c===d)return gc(a,c)}return f=null!=c&&null!=d?[c,d]:null!=c?c.slice(0):[Xc,Yc],b||(b=String(ad++)),hc(a,b,f),b}function fc(a,b){var c,d,e;for(d=0,e=b.length;e>d;d++)c=b[d],ec(a,c)}function gc(a,b){var c,d,e;return d=a.constant_cache,(e=d[b])?e:(c=!0,e=ec(a,void 0,b,b,c),d[b]=e,e)}function hc(a,b,c){var d,e;e=a.vars,d=e[b],d?Ba(d,c):(e[b]=ua(b,c),a.unsolved_var_names.push(b),a.all_var_names.push(b))}function ic(a,b){a._propagators.push(b)}function jc(a){var b,c,d,e,f,g,h;for(d=[],h=a._propagators,f=0,g=h.length;g>f;f++)e=h[f],b=e[1][0],!a.vars[b]&&d.indexOf(b)<0&&d.push(b),c=e[1][1],!a.vars[c]&&d.indexOf(c)<0&&d.push(c);return d}var kc,lc,mc,nc,oc,pc,qc,rc,sc,tc,uc,vc,Ma,wc,xc,yc,zc,Ac,Bc,Cc,Dc,Ec,Fc,Gc,Hc,Ic,Jc,Kc,Lc,Mc,Nc,Oc,Pc,Qc,Rc,Sc,Tc,Uc,Vc,Wc,Xc,Yc,Zc,Na,$c,_c,d,a,p,b,f,o,h,i,g,l,k,j,V,U,ka,T,x,ra,ta,sa,Z,R,ja,ga,la,A,E,Q,N,ea,fa,da,z,ba,_,aa,Y,X,W,y,ha,ia,C,pa,ca,qa,F,G,$,H,ma,B,Aa,Da,ua,Ka,La,za,xa,wa,ya,Fa,Ha,va,Ia,Ja,Ba,Ca,Ea,Ga,P,L,Pa,Ra,Oa,Qa,M,J,_a,Ya,Ta,Va,Za,Ua,Wa,hb,db,Xa,$a,cb,gb,Sa,eb,fb,ib,jb,mb,kb,lb,nb,rb,pb,qb,ub,sb,tb,vb,wb,xb,Ab,yb,zb,Bb,Cb,Db,Mb,Nb,I,Ob,ic,ec,fc,Ub,Tb,$b,jc,bc,_b,Zb,Xb,cc,K,D,e,c,v,u,t,s,r,w,q,S,O,oa,na,m,bb,ab,Fb,ob,Jb,Lb,Hb,Ib,Gb,Kb,Eb,Pb,Qb,Rb,Sb,ac,Wb,hc,gc,dc,Yb,Vb,ad;return Lc={"default":{"var":"naive",val:"min"},naive:{"var":"naive",val:"min"},fail_first:{"var":"size",val:"min"},split:{"var":"size",val:"splitMin"}},qc=0,Vc=1,Ec=Math.random,kc=1,Uc=2,$c=3,xc=!0,Ic=!1,Mc=!0,rc=0,tc=0,sc=1,Dc=0,wc=1,Kc=2,mc=0,Hc=-1,Gc=Math.min,Fc=Math.max,uc=Math.floor,lc=Math.ceil,Xc=0,Yc=1e8,_c=0,Wc=1,Tc=-1,Hc=-1,Ac=0,Cc=1,Bc=2,zc=Ac,yc=Bc,Jc=Xc-1,nc=!1,oc=!1,pc=!1,Kc=2,vc=function(a){return null!=a.id?a.id:a},Kc=2,Kc=2,Oc=0,Sc=1,Rc=2,Pc=3,Nc=2,Qc=2,Zc=Zc=function(){function a(a){var b;null==a&&(a={}),this.distribute=a.distribute,this.search=a.search,this.defaultDomain=a.defaultDomain,b=a.search_defaults,null==this.search&&(this.search="depth_first"),null==this.distribute&&(this.distribute="naive"),null==this.defaultDomain&&(this.defaultDomain=ra()),this.space=Tb(),"string"==typeof this.distribute?Zb(this.space,this.distribute):this.distribute&&Xb(this.space,this.distribute),b&&this.space.set_defaults(b),this.vars={byId:{},byName:{},all:[],byClass:{},root:void 0},this.solutions=[],this.state={space:this.space,more:!0},this._prepared=!1}function b(a){var b,d;return(d=c(a))&&(b=e(a),b||(("undefined"!=typeof console&&null!==console?console.warn:void 0)&&console.warn(d,a,"unable to fix"),Na("Fatal: unable to fix domain: "+JSON.stringify(a))),a=b),a}function c(a){var b,c,e,f,g,h,i;if(a.length%2!==0)return"Detected invalid domain, maybe legacy?";for(f=Xc-10,e=h=0,i=a.length;i>h;e=h+=2){if(g=a[e],c=a[e+1],b=d(g))return b;if(b=d(c))return b;if(Xc>g)return"Domain contains a number lower than SUB ("+n+" < "+Xc+"), this is probably a bug";if(c>Yc)return"Domain contains a number higher than SUP ("+n+" > "+Yc+"), this is probably a bug";if(g>c)return"Found a lo/hi pair where lo>hi, expecting all pairs lo<=hi ("+g+">"+c+")"}}function d(a){return"number"!=typeof a?a instanceof Array?"Detected legacy domains (arrays of arrays), expecting flat array of lo-hi pairs":"Expecting array of numbers, found something else ("+a+"), this is probably a bug":Xc>a?"Domain contains a number lower than SUB ("+a+" < "+Xc+"), this is probably a bug":a>Yc?"Domain contains a number higher than SUP ("+a+" > "+Yc+"), this is probably a bug":isNaN(a)?"Domain contains an actual NaN, this is probably a bug":void 0}function e(a){var b,c,d,e,f,g;for(c=[],f=0,g=a.length;g>f;f++){if(b=a[f],!(b instanceof Array))return;if(2!==b.length)return;if(e=b[0],d=b[1],e>d)return;c.push(e,d)}return c}function f(a,b,c){var d,e,f,g,h,i,j,k,l;for(h=null,j=0,k=a.length;k>j;j++){if(g=a[j],d=b[g],e=null!=d?d.distributeOptions:void 0){null==h&&(h={}),null==h[g]&&(h[g]={});for(f in e)i=e[f],h[g][f]=i}(null!=d?d.distribute:void 0)&&(null==h&&(h={}),null==h[g]&&(h[g]={}),h[g].distributor_name=d.distribute),"markov"===(null!=h&&null!=(l=h[g])?l.distributor_name:void 0)&&hb(c,g)}return h}var f,b,c,d,e;return a.prototype.constant=function(a){return a===!1&&(a=0),a===!0&&(a=1),this.num(a)},a.prototype.num=function(a){return"number"!=typeof a&&Na("Solver#num: expecting a number, got "+a+" (a "+typeof a+")"),isNaN(a)&&Na("Solver#num: expecting a number, got NaN"),ec(this.space,a)},a.prototype.addVars=function(a){var b,c,d;for(c=0,d=a.length;d>c;c++)b=a[c],this.addVar(b)},a.prototype.decl=function(a,c){return null==c&&(c=this.defaultDomain.slice(0)),c=b(c),ec(this.space,a,c)},a.prototype.addVar=function(a,c){var d,e,f,g,h,i,j,k,l,m,n;if("string"==typeof a&&(a={id:a,domain:c}),g=a.id,f=a.domain,i=a.name,e=a.distribute,k=this.vars,null==g&&Na("Solver#addVar: requires id "),k.byId[g]&&Na("Solver#addVar: var.id already added: "+g),null==f&&(f=this.defaultDomain.slice(0)),"number"==typeof f&&(f=sa(f)),f=b(f),ec(this.space,g,f),k.byId[g]=a,k.all.push(a),null!=i&&(null==(l=k.byName)[i]&&(l[i]=[]),k.byName[i].push(a)),"markov"===e||a.distributeOptions&&"markov"===a.distributeOptions.distributor_name)for(h=a.distributeOptions.matrix,h||(a.distributeOptions.expandVectorsWith?h=a.distributeOptions.matrix=[{vector:[]}]:Na("Solver#addVar: markov distribution requires SolverVar "+JSON.stringify(a)+" w/ distributeOptions:{matrix:[]}")),m=0,n=h.length;n>m;m++)j=h[m],d=j["boolean"],"function"==typeof d?j.booleanId=d(this,a):"string"==typeof d&&(j.booleanId=d);return a},a.prototype["+"]=function(a,b,c){return this.plus(a,b,c)},a.prototype.plus=function(a,b,c){return c?cb(this.space,vc(a),vc(b),vc(c)):cb(this.space,vc(a),vc(b))},a.prototype["-"]=function(a,b,c){return this.min(a,b,c)},a.prototype.minus=function(a,b,c){return this.min(a,b,c)},a.prototype.min=function(a,b,c){return c?db(this.space,vc(a),vc(b),vc(c)):db(this.space,vc(a),vc(b))},a.prototype["*"]=function(a,b,c){return this.ring_mul(a,b,c)},a.prototype.times=function(a,b,c){return this.ring_mul(a,b,c)},a.prototype.ring_mul=function(a,b,c){return c?eb(this.space,vc(a),vc(b),vc(c)):eb(this.space,vc(a),vc(b))},a.prototype["/"]=function(a,b,c){return this.div(a,b,c)},a.prototype.div=function(a,b,c){return c?Ya(this.space,vc(a),vc(b),vc(c)):Ya(this.space,vc(a),vc(b))},a.prototype.mul=function(a,b,c){return c?Xa(this.space,vc(a),vc(b),vc(c)):Xa(this.space,vc(a),vc(b))},a.prototype["∑"]=function(a,b){return this.sum(a,b)},a.prototype.sum=function(a,b){var c;return c=Ma(a),b?fb(this.space,c,vc(b)):fb(this.space,c)},a.prototype["∏"]=function(a,b){return this.product(a,b)},a.prototype.product=function(a,b){var c;return c=Ma(a),b?gb(this.space,c,vc(b)):gb(this.space,c)},a.prototype["{}≠"]=function(a){this.distinct(a)},a.prototype.distinct=function(a){_a(this.space,Ma(a))},a.prototype["=="]=function(a,b){this.eq(a,b)},a.prototype.eq=function(a,b){var c,d,e;if(a instanceof Array){for(d=0,e=a.length;e>d;d++)c=a[d],this._eq(c,b);return b}return this._eq(a,b)},a.prototype._eq=function(a,b){return Ta(this.space,vc(a),vc(b))},a.prototype["!="]=function(a,b){this.neq(a,b)},a.prototype.neq=function(a,b){var c,d,e;if(a instanceof Array)for(d=0,e=a.length;e>d;d++)c=a[d],this._neq(c,b);else this._neq(a,b)},a.prototype._neq=function(a,b){$a(this.space,vc(a),vc(b))},a.prototype[">="]=function(a,b){this.gte(a,b)},a.prototype.gte=function(a,b){var c,d,e;if(a instanceof Array)for(d=0,e=a.length;e>d;d++)c=a[d],this._gte(c,b);else this._gte(a,b)},a.prototype._gte=function(a,b){Za(this.space,vc(a),vc(b))},a.prototype["<="]=function(a,b){this.lte(a,b)},a.prototype.lte=function(a,b){var c,d,e;if(a instanceof Array)for(d=0,e=a.length;e>d;d++)c=a[d],this._lte(c,b);else this._lte(a,b)},a.prototype._lte=function(a,b){Wa(this.space,vc(a),vc(b))},a.prototype[">"]=function(a,b){this.gt(a,b)},a.prototype.gt=function(a,b){var c,d,e;if(a instanceof Array)for(d=0,e=a.length;e>d;d++)c=a[d],this._gt(c,b);else this._gt(a,b)},a.prototype._gt=function(a,b){Va(this.space,vc(a),vc(b))},a.prototype["<"]=function(a,b){this.lt(a,b)},a.prototype.lt=function(a,b){var c,d,e;if(a instanceof Array)for(d=0,e=a.length;e>d;d++)c=a[d],this._lt(c,b);else this._lt(a,b)},a.prototype._lt=function(a,b){Ua(this.space,vc(a),vc(b))},a.prototype._cacheReified=function(a,b,c,d){return b=vc(b),c=vc(c),d?Sa(this.space,a,b,c,vc(d)):Sa(this.space,a,b,c)},a.prototype["!=?"]=function(a,b,c){return this.isNeq(a,b,c)},a.prototype.isNeq=function(a,b,c){return this._cacheReified("neq",a,b,c)},a.prototype["==?"]=function(a,b,c){return this.isEq(a,b,c)},a.prototype.isEq=function(a,b,c){return this._cacheReified("eq",a,b,c)},a.prototype[">=?"]=function(a,b,c){return this.isGte(a,b,c)},a.prototype.isGte=function(a,b,c){return this._cacheReified("gte",a,b,c)},a.prototype["<=?"]=function(a,b,c){return this.isLte(a,b,c)},a.prototype.isLte=function(a,b,c){return this._cacheReified("lte",a,b,c)},a.prototype[">?"]=function(a,b,c){return this.isGt(a,b,c)},a.prototype.isGt=function(a,b,c){
	return this._cacheReified("gt",a,b,c)},a.prototype["<?"]=function(a,b,c){return this.isLt(a,b,c)},a.prototype.isLt=function(a,b,c){return this._cacheReified("lt",a,b,c)},a.prototype.solve=function(a,b){var c;return c=this.prepare(a),this.run(c),this.solutions},a.prototype.prepare=function(a){var b,c,d,e,g,h,i,j,k,l;return null==a&&(a={}),g=a.max,e=a.log,c=a.vars,i=a.search,d=a.distribute,b=a.add_unknown_vars,null==e&&(e=Ac),null==g&&(g=1e3),null==c&&(c=this.vars.all),l=Ma(c),null==d&&(d=this.distribute),b&&(k=jc(this.space),fc(this.space,k)),h=f(l,this.vars.byId,this.space),h&&Xb(this.space,{var_dist_config:h}),Xb(this.space,{targeted_var_names:l}),Xb(this.space,d),j=this._get_search_func_or_die(i),this._prepared=!0,{search_func:j,max:g,log:e}},a.prototype._get_search_func_or_die=function(a){var b;switch(null==a&&(a=this.search),a){case"depth_first":b=Ob;break;default:Na("Unknown search strategy: "+a)}return b},a.prototype.run=function(a,b){var c,d,e,f,g,h,i,j;for(g=a.search_func,e=a.max,d=a.log,this._prepared=!1,i=this.solutions,j=this.state,f=j.space,d>=Cc&&(console.time("      - FD Solver Time"),console.log("      - FD Solver Var Count: "+f.all_var_names.length),console.log("      - FD Solver Prop Count: "+f._propagators.length)),c=0;j.more&&e>c;)g(j),"end"!==j.status&&(c++,b||(h=cc(j.space),i.push(h),d>=Bc&&(console.log("      - FD solution() ::::::::::::::::::::::::::::"),console.log(JSON.stringify(h)))));d>=Cc&&(console.timeEnd("      - FD Solver Time"),console.log("      - FD solution count: "+c))},a.prototype.space_add_var_range=function(a,b,c){return ec(this.space,a,b,c)},a.prototype.domain_from_list=function(a){return A(a)},a}(),ad=1,{Solver:Zc}}();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)(module)))

/***/ }
/******/ ]);