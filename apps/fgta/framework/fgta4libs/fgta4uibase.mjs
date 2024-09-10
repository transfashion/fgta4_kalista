/**
 * fgta-uibase-4.8.2.js
 * fungsi-fungsi dasar dari sebuah modul
 * seluruh mjs modul fungsi dengan pengenal export
 * akan diwarisi oleh semua modul
 *
 * Agung Nugroho <agung@ferrine.com> http://www.ferrine.com
 * Jakarta, 30 Agustus 2019
 *
 */

const uibase = {
	maskshowing: false,
	dlgmaskshowing: 'none'
}

const MASKS = [];

const fgta_output = $('#fgta_output')
const fgta_output_content = $('#fgta_output_content')
const fgta_output_error = $('#fgta_output_error')


var PAGES;
var LastScroll = 0;

export var events = {
	OnSizeRecalculated: new CustomEvent('OnSizeRecalculated', {detail: {}}),
	OnButtonBack: new CustomEvent('OnButtonBack', {detail: {cancel: false}}),
	OnButtonHome: new CustomEvent('OnButtonHome', {detail: {cancel: false}}),
}



/**
 * ready
 * di panggil pada saat window modul telah selesai dimuat
 */
export async function ready() {
	
	$ui.resizing_ev = null;
	$(window).on("resize", () => {
		clearTimeout($ui.resizing_ev);
		$ui.resizing_ev = setTimeout($ui.iframe_resize, 200)
	})

	let contentsize = $ui.iframe_resize();
	$ui.OnSizeRecalculated(contentsize.width, contentsize.height);


	window.back = (fn_cancel) => {
		events.OnButtonBack.detail.cancel = false
		$ui.triggerevent(events.OnButtonBack, {})
		fn_cancel(events.OnButtonBack.detail.cancel)
	}

	window.home = (fn_cancel) => {
		events.OnButtonHome.detail.cancel = false
		$ui.triggerevent(events.OnButtonHome, {})
		fn_cancel(events.OnButtonHome.detail.cancel)
	}

	if(window.fgtaTimingPatch) {
		setTimeout($ui.iframe_resize, 100);
	}

	if(window.self !== window.top) {
		// IFRAME
		console.log(`module ${window.global.modulefullname} ready`);
		var variancename = document.querySelector('meta[name="variancename"]').content
		//console.log(variancename);


		/* development mode */
		var div = document.createElement('div');
		div.style.position = 'fixed';
		div.style.bottom = '30px';
		div.style.right = '30px';
		div.style.cursor = 'pointer';
		div.innerHTML = 'reload';
		div.addEventListener('click', (evt)=>{
			window.location.href += `?variancename=${variancename}`;
		})
		var body = document.getElementsByTagName('body')[0];
		body.appendChild(div);

	} else {
		// PARENT
		// console.log(`parent module ready`);
		// console.log(document.location.href + window.location.search);
	}
}
	


/**
 * init
 * di panggil pada setiap modul selesai dimuat
 * digunakan untuk melakukan inisiasi di tingkat modul
 * pada uibase, fungsi ini kosong
 * apabila akan di gunakan, fungsi ini di ovveride pada modul
 */
export async function init() {
	console.log('module initialization not created yet')
}



export function setPages(pages) {
	PAGES = pages
}

export function getPages() {
	return PAGES
}


export function getTimestamp() {
	var date = new Date();
	var unixTimeStamp = Math.floor(date.getTime()/1000);
	return unixTimeStamp;
}


export function mask(message, code=null) {
	if (code==null) {
		code = getTimestamp();
	}

	var body = document.getElementsByTagName('body')[0];
	if(window.self !== window.top) {
		body = window.parent.document.getElementsByTagName('body')[0];
	}

	var div = document.createElement('div');
	div.id = `__fgta-mask-${code}__`;
	div.code = code;
	div.classList.add('fgta_mask')

	if (message!=null) {
		var dialog = document.createElement('div');
		dialog.innerHTML = message;
		dialog.classList.add('fgta_mask_message');
		div.appendChild(dialog);
	}

	body.appendChild(div);
	MASKS.push(div);
	div.focus();

	return div;
}

export function unmask(mask=null, fn_maskclear) {
	var code = null;
	if (mask!=null) {
		if (mask.hasOwnProperty('code')) {
			code = mask.code;
		} 
	}

	if (code==null) {
		if (MASKS.length>0) {
			let div = MASKS.pop();
			div.remove();
		}
	} else {
		var index = null;
		var divid = `__fgta-mask-${code}__`;
		for (let div of MASKS) {
			if (div.id==divid) {
				index = MASKS.indexOf(div);
				div.remove();

			}
		}
		if (index!=null) {
			MASKS.splice(index, 1);
		}
	}
	if (typeof fn_maskclear === 'function') {
		fn_maskclear()
	}
}



export async function ShowMessage(message, buttons, fn_callback) {
	let layercode = getTimestamp() + '-message';
	return new Promise(async (resolve) => {
		var icon = null;
		var msgori = message;
		if (message.substring(0, 7)==='[ERROR]') {
			msgori = message.replace('[ERROR]', '')
			icon = 'icon-dialog-error.svg'
		} else if (message.substring(0, 9)==='[WARNING]') {
			msgori = message.replace('[WARNING]', '')
			icon = 'icon-dialog-warning.svg'
		}  else if (message.substring(0, 10)==='[QUESTION]') {
			msgori = message.replace('[QUESTION]', '')
			icon = 'icon-dialog-question.svg'
		} else if (message.substring(0, 6)==='[INFO]') {
			msgori = message.replace('[INFO]', '')
			icon = 'icon-dialog-info.svg'
		} 
		message = msgori;
		
	
		var MASK = mask(null, layercode);
		var dialog = document.createElement('div');
		dialog.classList.add('fgta_mask_dialogcontainer');
	
		var divup = document.createElement('div');
		divup.classList.add('fgta_mask_dialogup');
		if (icon==null) {
			divup.innerHTML = message;
		} else {
			divup.innerHTML = `
				<div>
					<img src="index.php/public/images/${icon}" style="width:32px; height:32px">
				</div>
				<div style="margin-left: 10px">
					${message}
				</div>
			`;
		}
	
		var divdw = document.createElement('div');
		divdw.classList.add('fgta_mask_dialogdw');
		if (buttons==undefined) {
			buttons = {
				Ok: async () => {

				}
			}
		}
	
		var lastbutton;
		for (var btnname in buttons) {
			let btn_click_handler = buttons[btnname];
			let btn = document.createElement('a')
			btn.innerHTML = btnname;
			btn.classList.add('c8');
			btn.classList.add('fgta_mask_dialogbtn');
			$(btn).linkbutton({})
	
			btn.addEventListener('click', async (evt)=>{
				if (typeof btn_click_handler === 'function') {
					evt.layercode = layercode;
					await btn_click_handler(evt);
					evt.stopPropagation();
					unmask(layercode)
					resolve();
				}
			});
	
			divdw.appendChild(btn);
			lastbutton = btn;
		}
	
		dialog.appendChild(divup);
		dialog.appendChild(divdw);
		MASK.appendChild(dialog);

		if (lastbutton!=null) {
			// console.log('focus to');
			// console.log(lastbutton);
			lastbutton.focus();
		}

	
		if (typeof fn_callback === 'function') {
			await fn_callback();
		}

	});

}



async function readfile(file) {
	return new Promise((resolve, reject) => {
		var reader = new FileReader();
		reader.onload = function(evt) {
			if(evt.target.readyState != 2) return;
			if(evt.target.error) {
				reject('Error while reading file')
			}

			var filecontent = evt.target.result;
			var f = {
				name: file.name,
				size: file.size,
				type: file.type,
				data: filecontent
			};

			if (file.type.startsWith('image')) {
				var image = new Image();
				image.src = evt.target.result;
				image.onload = function() {
					f.width = this.width;
					f.height = this.height;
					resolve(f);
				}
			} else {
				resolve(f);
			}
	
		};
		reader.readAsDataURL(file);
	})
}



export async function getNonce(api) {
	let getnonceurl = `index.php/get/fgta/framework/otp/getnonce/${api}/getnonce`
	let getnonce = async (getnonceurl) => {

		return new Promise(function(resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange= function () {
				if (xhr.readyState==4) {
					try {
						if (xhr.status==200) {
							resolve(xhr.response);
						} else {
							throw Error(hr.statusText);
						}
					} catch (err) {
						reject(err)
					}
				}
			}			

			xhr.open("GET", getnonceurl, true);
			xhr.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
			xhr.setRequestHeader('cache-control', 'max-age=0');
			xhr.setRequestHeader('expires', '0');
			xhr.setRequestHeader('pragma', 'no-cache');
			


			var headers = [];
			headers['fgta-appid'] = 'appid';
			headers['fgta-secret'] = 'secret';
			headers['fgta-tokenid'] = Cookies.get('tokenid');
			headers['fgta-mode'] = 'api';

			if (typeof $ui.setApiHeaders === 'function') {
				$ui.setApiHeaders(headers);
			}

			for (var headername in headers) {
				// console.log(headername, headers[headername]);
				xhr.setRequestHeader(headername, headers[headername]);
			}
			// xhr.setRequestHeader('fgta-appid', 'appid');
			// xhr.setRequestHeader('fgta-secret', 'secret');
			// xhr.setRequestHeader('fgta-tokenid', Cookies.get('tokenid'));
			// xhr.setRequestHeader('fgta-mode', 'api');
			
			xhr.send();

		})
	}


	try {
		var jsonresult = await getnonce(getnonceurl);
		var res = JSON.parse(jsonresult);
		if (res.code==0) {
			return res.responseData.nonce;
		} else {
			throw Error('Error on getNonce. ' + res.message);
		}
	} catch (err) {
		throw err;
	}

}




export async function download(url, args, fn_handler) {
	console.log(url);
	console.log(args);

	let downloadparams = {}
	for (let paramname in args) {
		if (paramname=='files') {
			throw Error(`cannot use 'files' as main parameter name`);
		}
		downloadparams[paramname] = args[paramname]
	}

	var postdata = {
		txid: null,
		requestParam: downloadparams
	}

	let downloadurl = `index.php/download/${url}`
	let getdownloadtarget = async (downloadurl, postdata, nonce) => {
		return new Promise(function(resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.onload = function () {
				try {
					if (xhr.status==200) {
						var contenttype = xhr.getResponseHeader('content-type');
						var disposition = xhr.getResponseHeader('content-disposition');
						var regex = /filename="(.+?)"/gi;
						var matches = regex.exec(disposition);
						var filename = (matches != null && matches[1] ? matches[1] : 'filename');
						//var blob = new Blob([xhr.response.data], { type: contenttype });
	
						if (matches!=null) {
							resolve({
								filename: filename,
								contenttype: contenttype,
								data: xhr.response
							});
						} else {
							throw Error(xhr.responseText);
						}
					} else {
						throw Error(xhr.statusText);
					}
				} catch (err) {
					reject(err);
				}
			}

			xhr.open("POST", downloadurl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
			xhr.setRequestHeader('cache-control', 'max-age=0');
			xhr.setRequestHeader('expires', '0');
			xhr.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
			xhr.setRequestHeader('pragma', 'no-cache');
			
			xhr.setRequestHeader('fgta-appid', 'appid');
			xhr.setRequestHeader('fgta-secret', 'secret');
			xhr.setRequestHeader('fgta-nonce', nonce);
			xhr.setRequestHeader('fgta-tokenid', Cookies.get('tokenid'));
			
			var jsondata = JSON.stringify(postdata);
			xhr.send(jsondata);


		});
	}


	try {

		fgta_output_content.html('')	
		fgta_output_error.html('')
	
		try {

			var nonce = await getNonce(url);
			var response = await getdownloadtarget(downloadurl, postdata, nonce);
			var contentoutput = "";

			if (typeof(fn_handler)==='function') {
				fn_handler(response);
			} else {
				var link = document.createElement('A');				
				link.href = response.data;
				link.download = response.filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}

		} catch (err) {
			fn_handler(null, err, args);
			var handled = args!=null?args.handled:false;
			if (!handled) {
				fgta_output_content.html(contentoutput);
				fgta_output_error.html(err.message);
				throw err;
			}
		}
	} catch (err) {
		//$ui.ShowErrorWindow();
		throw err;
	}
}




/**
 * apicall
 * memanggil api di server menggunakan ajax
 *
 * @param api url dari api
 * @param args argumen yang akan dikirimkan ke api
 */
export async function apicall(api, args, files) {
	let postparams = {}
	for (let paramname in args) {
		if (paramname=='files') {
			throw Error(`cannot use 'files' as main parameter name`);
		}
		postparams[paramname] = args[paramname]
	}

	// get file
	var filedata = {}
	for (var fli in files) {
		if (files[fli]===undefined) continue;
		var file = files[fli];
		var filecontent = await readfile(file);
		filedata[fli] = filecontent;
	}
	postparams['files'] = filedata;


	var postdata = {
		txid: null,
		requestParam: postparams
	}

	let apiurl = `index.php/api/${api}`
	let ajax = async (apiurl, postdata, nonce) => {

		return new Promise(function(resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange= function () {
				if (xhr.readyState==4) {
					try {
						if (xhr.status==200) {
							resolve(xhr.response);
						} else {
							throw Error(xhr.statusText);
						}
					} catch (err) {
						reject(err)
					}
				}
			}			

			xhr.open("POST", apiurl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
			xhr.setRequestHeader('cache-control', 'max-age=0');
			xhr.setRequestHeader('expires', '0');
			xhr.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
			xhr.setRequestHeader('pragma', 'no-cache');
			

			var headers = [];
			headers['fgta-appid'] = 'appid';
			headers['fgta-secret'] = 'secret';
			headers['fgta-nonce'] = nonce;
			headers['fgta-tokenid'] = Cookies.get('tokenid');

			if (typeof $ui.setApiHeaders === 'function') {
				$ui.setApiHeaders(headers);
			}

			for (var headername in headers) {
				// console.log(headername, headers[headername]);
				xhr.setRequestHeader(headername, headers[headername]);
			}

			// xhr.setRequestHeader('fgta-appid', 'appid');
			// xhr.setRequestHeader('fgta-secret', 'secret');
			// xhr.setRequestHeader('fgta-nonce', nonce);
			// xhr.setRequestHeader('fgta-tokenid', Cookies.get('tokenid'));
			
			var jsondata = JSON.stringify(postdata);
			xhr.send(jsondata);

		})
	}


	try {
		
		fgta_output_content.html('')	
		fgta_output_error.html('')
		
		try {
			var result = {};
			var nonce = await getNonce(api);
			var response = await ajax(apiurl, postdata, nonce);
			var contentoutput = "";

			try {
				result = JSON.parse(response);
			} catch (err) {
				contentoutput = response;
				throw err;
			}
			
			if (result.contentoutput!=null || result.contentoutput!=undefined) {
				contentoutput = result.contentoutput;
			}

			if (result.code!==0) {
				contentoutput += '<div>Error Code: ' + result.code + '</div>';	
				var error = Error(result.message);
				if (result.trace!=undefined) {
					console.error(result.trace);
				}
				throw error;
			}
			
			return result.responseData;
		} catch (err) {
			err.contentoutput = contentoutput;
			throw err;
		}
	} catch (err) {
		throw err;
	}


}

export function triggerevent(event, args) {
	Object.assign(event.detail, args)
	return document.dispatchEvent(event)
}


export function home() {
	if (parent==null)
		return

	if (parent.$ui==null)
		return;	

	if (typeof parent.$ui.OpenHomeMenu == 'function') {
		parent.$ui.OpenHomeMenu();
	}
}


export async function exitconfirm(message) {
	return new Promise((resolve, reject) => {
		$.messager.confirm('Exit', message, (r)=>{
			if (r) {
				resolve(true)
			} else {
				resolve(false)
			}
		})
	})
}



export function iframe_resize() {
	let contentsize = get_content_size(document.body)
	triggerevent(events.OnSizeRecalculated, {
		width: contentsize.width,
		height: contentsize.height
	})

	return contentsize;
}

export function get_content_size(el) {
	let istyle = el.currentStyle || window.getComputedStyle(el)
	let margin = {
		Top: parseInt(istyle.marginTop),
		Bottom: parseInt(istyle.marginBottom),
		Left: parseInt(istyle.marginLeft),
		Right: parseInt(istyle.marginRight)
	}

	let padding = {
		Top: parseInt(istyle.paddingTop),
		Bottom: parseInt(istyle.paddingBottom),
		Left: parseInt(istyle.paddingLeft),
		Right: parseInt(istyle.paddingRight),
	}

	return {
		width: window.innerWidth - margin.Left - margin.Right - padding.Left - padding.Right,
		height: window.innerHeight - margin.Top - margin.Bottom - padding.Top - padding.Right
	}
}

export function OnSizeRecalculated(width, height) {

}


export function redirecttologinpage() {
	if (parent!=null) {
		parent.location.reload()
	} else {
		location.reload()
	}
}


export function IsMessageShowing() {
	if (uibase.dlgmaskshowing=='none') {
		return false
	} else {
		return true;
	}
}


export function __ShowMessage(message, buttons, fn_callback) {
	var top = $(window).scrollTop()

	let progressmask = document.createElement('div')
	let progresswaitmask = document.createElement('div')
	let progresswrap = document.createElement('div')
	let progresswaiting = document.createElement('div')
	let progressbuttonbar = document.createElement('div')

	progressmask.id = '__dialogmessage-mask__'
	progresswaitmask.id = '__dialogmessage-waitmask__'
	progresswaiting.id = '__dialogmessage-waiting__'

	Object.assign(progressmask.style, {
		position: 'fixed',
		overflowY: 'scroll',		
		// position: 'absolute',
		top: `0px`,
		left: '0px',
		width: 'calc(100vw - (100vw - 100%))',
		height: '100vh',
		overflow: 'hidden',
		display: 'table',
		backgroundColor: 'black',
		opacity: 0,
		zIndex: 8998
	});


	Object.assign(progresswaitmask.style, {
		position: 'fixed',
		overflowY: 'scroll',
		// position: 'absolute',
		top: `0px`,
		left: '0px',
		width: 'calc(100vw - (100vw - 100%))',
		height: '100vh',
		overflow: 'hidden',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 8999
	});

	Object.assign(progresswrap.style, {
		// width: '414px',
		// height: '100px',		
	})

	Object.assign(progresswaiting.style, {
		margin: 'auto',
		textAlign: 'center',
		backgroundColor: '#ffffff',
		color: '#000000',
		width: '50vh',
		height: '100px',
		padding: '10px 10px 10px 10px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	})


	if (buttons===undefined) {
		buttons = {
			"OK" : () => {}
		}
	}


	var lbtns = []
	for (var b in buttons) {
		var btnclick = buttons[b]
		var buttontext = b

		let btn = document.createElement('a')
		btn.innerHTML = buttontext
		btn.classList.add('c8')
		Object.assign(btn.style, {
			width: '60px',
			height: '30px',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			marginLeft: '3px',
			marginRight: '3px',
			marginBottom: '20px'		
		})
	
		$(btn).linkbutton({})

		btn.click_handler = btnclick
		btn.button_click = () => {
			if (uibase.dlgmaskshowing=='none') {
				return;
			}

			if (typeof btnclick === 'function') {
				btn.click_handler()
			}

			if (progressmask.parentNode!=null) {
				progressmask.parentNode.removeChild(progressmask);
			}
			
			if (progresswaitmask.parentNode!=null) {
				progresswaitmask.parentNode.removeChild(progresswaitmask);
			}
			
			uibase.dlgmaskshowing = 'none';
		}


		btn.addEventListener('click', (ev)=>{
			btn.button_click()
			ev.stopPropagation()
		})
		progressbuttonbar.appendChild(btn)

		lbtns.push(btn)
	}

	
	var EnterPressed = (ev) => {
		if (ev.key=='Enter') {
			document.removeEventListener('keyup', EnterPressed)
			lbtns[0].button_click()
			ev.stopPropagation()
		}
	}


	Object.assign(progressbuttonbar.style, {
		height: '40px',
		backgroundColor: '#ffffff',
		color: '#000000',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	})

	if (message.substring(0, 7)==='[ERROR]') {
		var msgori = message.replace('[ERROR]', '')
		message = `<div><div style="display: flex; justify-content: center"><div style="width:32px; height:32px; background: url('images/messager_icons.png') 64px 0;"></div></div><div style="color:red; margin-top: 10px">${msgori}</div></div>`
	} else if (message.substring(0, 9)==='[WARNING]') {
		var msgori = message.replace('[WARNING]', '')
		message = `<div><div style="display: flex; justify-content: center"><div style="width:32px; height:32px; background: url('images/messager_icons.png') 32px 0;"></div></div><div style="margin-top: 10px">${msgori}</div></div>`
	}  else if (message.substring(0, 10)==='[QUESTION]') {
		var msgori = message.replace('[QUESTION]', '')
		message = `<div><div style="display: flex; justify-content: center"><div style="width:32px; height:32px; background: url('images/messager_icons.png') 96px 0;"></div></div><div style="margin-top: 10px">${msgori}</div></div>`
	} else if (message.substring(0, 6)==='[INFO]') {
		var msgori = message.replace('[INFO]', '')
		message = `<div><div style="display: flex; justify-content: center"><div style="width:32px; height:32px; background: url('images/messager_icons.png') 0 0;"></div></div><div style="margin-top: 10px">${msgori}</div></div>`
	} 
	
	uibase.dlgmaskshowing = 'showing'; 
	let progresswait = document.getElementById('__dialogmessage-waitmask__')
	if (progresswait!==null) {
		let progresswaitingtext = document.getElementById('__dialogmessage-waiting__')
		progresswaitingtext.innerHTML = message
	} else {
		let opacity = 0
		progressmask.style.opacity = 0
		progresswaiting.innerHTML = message
		progresswrap.appendChild(progresswaiting)
		progresswrap.appendChild(progressbuttonbar)
		progresswaitmask.appendChild(progresswrap)
		document.body.appendChild(progressmask)
		document.body.appendChild(progresswaitmask)
		$.parser.parse('#__dialogmessage-waiting__');

		if (typeof fn_callback === 'function') {
			fn_callback();
		}

		// console.log('test');
		let fadein = setInterval(() => {
			if (opacity < 7) {
				opacity += 1;
				progressmask.style.opacity = opacity/10
			} else {
				document.addEventListener("keyup", EnterPressed)

				uibase.dlgmaskshowing = 'showed';
				// console.log('dialog showed');
				clearInterval(fadein);
			}
		}, 20)
	}

	

}



export async function fgta_longrun(options) {

	if (options.process_cookie===null || options.process_cookie===undefined) {
		$ui.ShowMessage(`process_cookie belum didefinisikan`)
		return;
	}

	if (options.api_url_start===null || options.api_url_start===undefined) {
		$ui.ShowMessage(`api_url_start belum didefinisikan`)
		return;		
	}

	if (options.api_url_status===null || options.api_url_status===undefined) {
		$ui.ShowMessage(`api_url_status belum didefinisikan`)
		return;		
	}

	var process_cookie = options.process_cookie
	var api_url_start = options.api_url_start
	var api_url_status = options.api_url_status

	var onStarting = typeof options.onStarting === 'function' ? options.onStarting : () => {}
	var onError = typeof options.onError === 'function' ? options.onError : () => {}
	var onProgress = typeof  options.onProgress === 'function' ? options.onProgress : () => {}
	var onFinished = typeof options.onFinished === 'function' ? options.onFinished : () => {}
	var onTick = typeof options.onTick === 'function' ? options.onTick : () => {}

	
	var cookie_uploader_var = process_cookie

	var args = {
		options: {
			process_id: Cookies.get(cookie_uploader_var),
			data: options.data
		}
	}

	
	var apiurl = api_url_start
	
	try {
		var result = await $ui.apicall(apiurl, args)
		if (result.respond===undefined) {
			throw {errormessage:'Tidak ada respond dari microsevice'}
		}

		args.options.process_id = result.process_id
		if (result.respond.started === true) {
			Cookies.set(cookie_uploader_var, result.process_id);

			onStarting(result)
			
			var report = setInterval(async ()=>{
				var statuscekurl = api_url_status
				try {

					var result = await $ui.apicall(statuscekurl, args)
					onTick(result)

					if (result.respond===undefined) {
						Cookies.remove(cookie_uploader_var)
						clearInterval(report)
						throw {errormessage:'Tidak ada respond dari microsevice'}
					}
	
					var status = result.respond
					var finished = status.finished || status.started===false
					var error = status.error
					var errormessage = status.errormessage
	
					if (error) {
						Cookies.remove(cookie_uploader_var)
						clearInterval(report)
						throw {errormessage: errormessage}
					}
	
					if (finished===true) {
						Cookies.remove(cookie_uploader_var)
						clearInterval(report)					
						setTimeout(()=> {
							onFinished(status)
						}, 1000)
					} else {
						onProgress(status)
					}


				} catch (err) {
					clearInterval(report)	
					Cookies.remove(cookie_uploader_var)	
					onError(err)
					if (err.suppresserror!==true) {
						$ui.ShowMessage('[ERROR]' + err.errormessage)
					}
				}

			}, 1000)
		}

	} catch (err) {
		Cookies.remove(cookie_uploader_var)
		onError(err)
		if (err.suppresserror!==true) {
			$ui.ShowMessage('[ERROR]' + err.errormessage)
		}
	}
}


export function KeepScroll() {
	LastScroll = $(window).scrollTop()
}

export function ResumeScroll(fn_callback) {
	setTimeout(()=>{
		$(window).scrollTop(LastScroll)
		if (typeof fn_callback === 'function') {
			fn_callback()
		}
	}, 300)
}
