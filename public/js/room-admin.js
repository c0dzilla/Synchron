var clipboard = new Clipboard('.btn');
clipboard.on('success', function(e) {
	
})
var socket = io();
var peer = new Peer({key : '2pr6j8fsr9roogvi'});
peer.on('open', function(id) {
	socket.emit('peerId', id);
})
socket.on('sendRoomId', function(id) {
	swal({
			title: "Room has been created",
			text: "ID : " + id,
			icon: "success",
			button: "COPY URL"
	})
	.then (() => {
		$("#copy-btn").attr("data-clipboard-text", socket.id);
		$("#copy-btn").trigger("click");
	});
})

socket.on('addPeer', function(id) {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia({video: true, audio: true}, function(stream) {
		var call = peer.call(id, mediaStream);
		call.on('stream', function(remoteStream) {
    		console.log("called");
  		});
	},
	function(err) {
  		console.log('Failed to get local stream' ,err);
	});
})