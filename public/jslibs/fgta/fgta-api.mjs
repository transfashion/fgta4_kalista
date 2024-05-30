async function ajaxrequest (method, endpoint, payload, headers) {
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

		xhr.open(method, endpoint, true);
		xhr.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
		xhr.setRequestHeader('cache-control', 'max-age=0');
		xhr.setRequestHeader('expires', '0');
		xhr.setRequestHeader('pragma', 'no-cache');
		

		var use_headers = [];
		use_headers['fgta-appid'] = 'appid';
		use_headers['fgta-secret'] = 'secret';
		use_headers['fgta-tokenid'] = Cookies.get('tokenid');

		// merge def_headers dgn header
		if (typeof headers === 'object' && headers !== null) {
			for (var headername in headers) {
				use_headers[headername] = headers[headername];
			}
		}

		// compose header request
		for (var headername in use_headers) {
			xhr.setRequestHeader(headername, use_headers[headername]);
		}

		
		if (method==='POST') {
			xhr.send(payload);
		} else {
			xhr.send();
		}
	})
}






async function getNonce(endpoint, headers) {
	try {
		var getnonceurl = `index.php/get/fgta/framework/otp/getnonce/${endpoint}/getnonce`;
		var jsonresult = await ajaxrequest('GET', getnonceurl, null, headers);
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

export async function call(endpoint, params, options) {
	try {

		var apiurl = `index.php/api/${endpoint}`
		var postparams = {}
		for (let paramname in params) {
			if (paramname=='files') {
				throw Error(`cannot use 'files' as main parameter name`);
			}
			postparams[paramname] = params[paramname]
		}

		var postdata = {
			txid: null,
			requestParam: postparams
		}

		var payload = JSON.stringify(postdata);
		var nonce = await getNonce(endpoint, {"fgta-mode": "api"});
		var jsonresult = await ajaxrequest('POST', apiurl, payload, {"fgta-nonce": nonce});
		var dataresult = parseJson(jsonresult, options);

		// tampilkan content output
		if (dataresult.contentoutput!='' && dataresult.contentoutput!=null) {
			if (typeof options.OnContentOutput === 'function') {
				options.OnContentOutput(dataresult.contentoutput);
			}
		}

		// cek logical api error
		if (dataresult.code!=0) {
			var err;
			if (dataresult.message!='' && dataresult.message!=null) {
				err = new Error(dataresult.message);
			} else {
				err = new Error(`Api Error ${dataresult.code}`);
			}

			console.error(err);
			if (dataresult.trace!=null) {
				var trace = dataresult.trace.split("\n");
				for (var line of trace) {
					console.log(line);
				}
			}
			err.code = dataresult.code;
			err.trace = dataresult.trace;
			throw err;
		}

		return dataresult.responseData;
	} catch (err) {
		throw err;
	}
}

function parseJson(jsondata, options) {
	try {
		var result = JSON.parse(jsondata);
		return result;
	} catch (err) {
		if (typeof options.OnJsonParseError === 'function') {
			options.OnJsonParseError(err, result);
		} else {
			throw new Error('cannot parse json result.')
		} 
	}
}