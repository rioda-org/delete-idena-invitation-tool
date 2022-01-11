toastr.options = {
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-bottom-right",
  "preventDuplicates": false,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

function checkLogin() {
  if (document.getElementById('block2-pk').value.length == 120) {
    Window.Wblock2();
	let pKey = document.getElementById('unencryptedPK').value;
	let addy = document.getElementById('addy').value;
	if(pKey.length==64 && addy.length==42)
	toastr.success('You have signed in successfully.');
	$("#login").addClass("d-none");
	$("#logged").removeClass("d-none");
	$("#delett").removeClass("d-none");
	$("#avatar").attr("src","https://robohash.idena.io/"+addy);
	$("#link").attr("href","https://scan.idena.io/address/"+addy);
	$("#link2").attr("href","https://scan.idena.io/address/"+addy);
	document.getElementById('link').innerHTML=addy;
	getNonceEpoch();
  } else {
    toastr.error('Login was not successfull, check your login data.');
  }
}

function getNonce(addy) {
    return axios.post('https://test.idena.site', {"method":"dna_getBalance","params":[addy],"id":1,"key":"test"}).then(response => response.data["result"].mempoolNonce)
}

function getEpoch() {
    return axios.get('https://api.idena.org/api/epoch/last').then(response => response.data["result"].epoch)
}


function sendRawTx(signedRawTx) {
    return axios.post('https://test.idena.site', {"method":"bcn_sendRawTx","params":[signedRawTx],"id":1,"key":"test"}).then(response => response.data.result);
}

async function getNonceEpoch(){
		let addy = document.getElementById('addy').value;
		let nonce = await getNonce(addy);
		let epoch = await getEpoch();
		nonce++;
		document.getElementById('nonce').value = nonce;
		document.getElementById('epoch').value = epoch;
}

//encode rawTX
function encodeRawTx() {
  Window.Wblock3();
  //toastr.success('RawTx: '+ document.getElementById('rawTx').value);
}

//sign rawTX
function signRawTx() {
  Window.Wblock5();
  //toastr.success('Signed RawTx: '+ document.getElementById('signedRawTx').value);
}

//send transaction to delete invitation
async function deleteInvitation() {
	if (document.getElementById('to-addy').value == "") {
	toastr.error("Please enter invitation address for deletion.");
	} else {
		encodeRawTx();
		signRawTx();
		let signedRawTx = document.getElementById('signedRawTx').value;
		let tx = await sendRawTx(signedRawTx);
		var fwdTx = tx;
		toastr.success('Transaction was sent');
		document.getElementById('resultTx').innerHTML = '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div> Please wait...';
		setTimeout(function(){
			document.getElementById('resultTx').innerHTML = 'Check your transaction on Idena explorer:<br><a href="https://scan.idena.io/transaction/'+fwdTx+'" target="_blank">'+fwdTx+'</a><br><br>There might take some time for transaction to be confirmed, you can try to refresh transaction page in minute to see real data.';
		}, 20000);
	}
}