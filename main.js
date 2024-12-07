const letters = "abcdefghijklmnopqrstuvwxyz";

let interval = null;

document.getElementById("title").onmouseover = event => {  
  let iteration = 0;

  clearInterval(interval);
  
  interval = setInterval(() => {
    event.target.innerText = event.target.innerText
      .split("")
      .map((letter, index) => {
        if(index < iteration) {
          return event.target.dataset.value[index];
        }
      
        return letters[Math.floor(Math.random() * 26)]
      })
      .join("");
    
    if(iteration >= event.target.dataset.value.length){ 
      clearInterval(interval);
    }
    
    iteration += 0.25;
  }, 20);
}


const audio = document.getElementById("audio");
const playPauseBtn = document.getElementById("play-pause-btn");
const muteBtn = document.getElementById("mute-btn");
const progress = document.getElementById("progress");

let isMuted = false;

// Play/Pause functionality
playPauseBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.querySelector("img").src = "icons/pause.png";
  } else {
    audio.pause();
    playPauseBtn.querySelector("img").src = "icons/play.png";
  }
});

// Mute/Unmute functionality
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  audio.muted = isMuted;
  muteBtn.querySelector("img").src = isMuted ? "icons/volume-off.png" : "icons/volume-on.png";
});

// Update progress bar
audio.addEventListener("timeupdate", () => {
  const progressWidth = (audio.currentTime / audio.duration) * 100;
  progress.style.width = `${progressWidth}%`;
});
