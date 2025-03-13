document.addEventListener("DOMContentLoaded", function() {
  function timer() {
      let x = Date.now() / 1000;

      let start = 1741478400;
      let end = 1742083200;

      let percentage = ((x - start) / (end - start)) * 100;
      percentage = Math.max(0, Math.min(100, percentage));

      let timeLeft = end - x;

      let d = Math.floor(timeLeft / (3600 * 24));
      let h = Math.floor((timeLeft % (3600 * 24)) / 3600);
      let m = Math.floor((timeLeft % 3600) / 60);
      let s = Math.floor(timeLeft % 60);

      let text = "Challenge Ended.";
      if (timeLeft > 0)
      {
        text = `${d}d ${h}h ${m}m ${s}s`
      } 
      document.getElementById("timer-text").innerText = text;

      let progressBar = document.getElementById("progress-bar");
      if (progressBar) {
          progressBar.style.width = percentage + "%";
      }
      else { console.log('bar doesnt exist');}

      setTimeout(timer, 1000);
  }
  timer();
});