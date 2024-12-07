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
