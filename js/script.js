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
	toastr.success('Login was successfull.\nNow, you can enter invitation address and procede with next step.');
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
	if (document.getElementById('addy').value.length == 42) {
		let addy = document.getElementById('addy').value;
		let nonce = await getNonce(addy);
		let epoch = await getEpoch();
		nonce++;
		document.getElementById('nonce').value = nonce;
		document.getElementById('epoch').value = epoch;
		toastr.success('Nonce: '+nonce+'\nEpoch: '+epoch);
} else {
    toastr.error('Please login first.');
  }
}

//encode rawTX
function encodeRawTx() {
	if (document.getElementById('nonce').value == "") {
	toastr.error("Please don't skip steps.");
	} else {
	  Window.Wblock3();
	  toastr.success('RawTx: '+ document.getElementById('rawTx').value);
  }
}

//sign rawTX
function signRawTx() {
	if (document.getElementById('rawTx').value == "") {
	toastr.error("Please don't skip steps.");
	} else {
  Window.Wblock5();
  toastr.success('Signed RawTx: '+ document.getElementById('signedRawTx').value);
	}
}

//send transaction to delete invitation
async function deleteInvitation() {
	if (document.getElementById('signedRawTx').value == "") {
	toastr.error("Please don't skip steps.");
	} else {
		let signedRawTx = document.getElementById('signedRawTx').value;
		let tx = await sendRawTx(signedRawTx);
		var fwdTx = tx;
		toastr.success('Transaction was sent');
		document.getElementById('resultTx').innerHTML = '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div> Please wait...';
		setTimeout(function(){
			document.getElementById('resultTx').innerHTML = 'Check your transaction on Idena explorer:<br><a href="https://scan.idena.io/transaction/'+fwdTx+'" target="_blank">'+fwdTx+'</a>';
		}, 20000);
	}
}