var peer = new Peer({key : '2pr6j8fsr9roogvi'});
var peerId;
var calls = [];
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var mediaDiv = '<video width="320" height="240" class = "media" controls';
var numOfPeers = 0;

peer.on('open', async function(id) {
  peerId = id;
  await getStream();
	socket.emit('peerId', id);
  await listenForCall();
  socket.on('addPeer', function(id) {
    callPeer(id);
  })
})

function getStream() {
  navigator.getUserMedia({video: true, audio: true}, function(stream) {
    window.localStream = stream;
    $("#self").prop("src", URL.createObjectURL(stream));
  },
  function(err) {
    console.log(err);
  });
}

function listenForCall() {
  peer.on('call', function(call) {
    call.answer(window.localStream);
    call.on('stream', function(remoteStream) {
      addMedia(remoteStream);
    });
  });
}

function callPeer(id) {
  calls.push(peer.call(id, window.localStream));
  calls[calls.length - 1].on('stream', function(remoteStream) {
    addMedia(remoteStream);
  });
}

function addMedia(remoteStream) {
  numOfPeers++;
  mediaDiv += 'id = ' + '"' + numOfPeers + '">';
  $("body").append(mediaDiv);
  $("#" + numOfPeers).prop("src", URL.createObjectURL(remoteStream));
}
  /*
  navigator.getUserMedia({video: true, audio: true}, function(stream) {
    window.localStream = stream;
    for (var i = 0; i < members.length; i++) {
      calls[i] = peer.call(id, stream);
      calls[i].on('stream', function(remoteStream) {

      });  
    }
        var call = peer.call(id, stream);
        call.on('stream', function(remoteStream) {
          });
      },
      function(err) {
          console.log('Failed to get local stream' ,err);
      });
}
*/