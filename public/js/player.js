window.onload = init;
var context;
var subtitles;
var bufferLoader;
var queue = [];
var playing = 0;
var timer;
var originalTime;
var pauseTime = 0;
var source;
var indexOfSong = 0;

function init() {
  // Fix up prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
}

async function fetch() {

  if (playing === 1)
    return toast("Already Playing");

  if (queue.length === 0)
    return toast("Queue is empty");

  bufferLoader = await new BufferLoader(
    context,
    ['/audio/'+queue[0]+'.mp3'],
    synchronise
  );

  document.getElementById("fixed-snackbar").setAttribute("text", {
    value: ""
  });

  toast("Playing "+queue[0]);

  if (typeof timer !== 'undefined')
    timer.clear();

  await loadJSON(function (response) {
    subtitles = JSON.parse(response);
  }, '/audio/'+queue[0]+'.json');

  queue.splice(0, 1);
  bufferLoader.load();

}

async function add(song='example') {
	await queue.push(song);
  let sceneEl = document.querySelector('#aframe-queue');
  let entityEl = document.createElement('a-entity');
  entityEl.setAttribute('geometry', {
    primitive: 'box',
    height: .5,
    width: 2,
    depth: 0,
  });
  entityEl.setAttribute('material', 'color', '#101010');
  entityEl.setAttribute('position', { x: 0, y: 1.6 - .8 * indexOfSong++, z: .01 });
  entityEl.setAttribute('text', { value: song, align: 'center', width: 6 });
  sceneEl.appendChild(entityEl);

	return toast("Added "+song+" to Queue");

}

async function next() {

  socket.emit('clear', roomId);

  if( typeof source !== 'undefined')
    source.onended = null;

  if (playing === 1) {
    source.stop();
    playing = 0;
  }

  toast("Score : " + Math.round(10*Math.random()) + "/10", 4000, "fixed-score");
  document.getElementById("aframe-pauseBtn").setAttribute("text", {value: 'PAUSE'});
  document.getElementById("fixed-snackbar").setAttribute("text", {
    value: ""
  });

  if (typeof timer !== 'undefined')
    timer.clear();

  await fetch();

  if (context.state === 'suspended')
    context.resume();

}

async function synchronise(bufferList) {

  source = await context.createBufferSource();
  source.onended = next;
  source.buffer = bufferList[0];

  await source.connect(context.destination);
  socket.emit('standby', roomId);

}

async function finishedLoading() {

  if (playing === 0)
      source.start(0);

  timer = await new InvervalTimer(function () {
    displaySubtitles(subtitles);
  }, 200);

  playing = 1;

}

async function pauseres() {
  if (context.state === 'running') {
    context.suspend().then(function () {
      if (typeof timer !== 'undefined')
      timer.pause();
      toast("Paused");
      if (typeof pauseTime !== 'undefined')
      pauseTime = new Date().getTime()/1000;
      document.getElementById("aframe-pauseBtn").setAttribute("text", {value: 'RESUME'});

    });

  } else if (context.state === 'suspended') {
    context.resume().then(function () {
      if (typeof timer !== 'undefined')
      timer.resume();
      toast("Resuming");
      if (typeof originalTime !== 'undefined' && typeof pauseTime !== 'undefined')
      originalTime+= (new Date().getTime()/1000 - pauseTime);
      document.getElementById("aframe-pauseBtn").setAttribute("text", {value: 'PAUSE'});
    });
  }
}

function toast(message, timeout = 2000, defaultTag = "fixed-snackbar") {

  document.getElementById(defaultTag).setAttribute("text", {
    value: message
  });

  setTimeout(function(){
   document.getElementById(defaultTag).setAttribute("text", {
    value: '' })}, timeout);

}

function InvervalTimer(callback, interval) {

  var timerId, startTime, remaining = 0;
  var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed
  originalTime = new Date().getTime() / 1000;

  this.pause = function () {
    if (state != 1) return;

    remaining = interval - (new Date() - startTime);
    window.clearInterval(timerId);
    state = 2;
  };

  this.clear = function () {
    window.clearInterval(timerId);
  };

  this.resume = function () {
    if (state != 2) return;

    state = 3;
    window.setTimeout(this.timeoutCallback, remaining);
  };

  this.timeoutCallback = function () {
    if (state != 3) return;

    callback();

    startTime = new Date();
    timerId = window.setInterval(callback, interval);
    state = 1;
  };

  startTime = new Date();
  timerId = window.setInterval(callback, interval);
  state = 1;
}

async function displaySubtitles (subs) {

  var t = new Date().getTime() / 1000 - originalTime;
  var n = document.getElementById("subs");

  subtitles.forEach(function (element, index, array) {

    if (t >= element.start && t <= element.end) {

      document.getElementById("subs").setAttribute("text", {
        value: element.text
      })

    }

  });
}
