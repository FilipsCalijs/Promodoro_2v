

(function () {





	/******************************************************************************** 
	* Declare vars
	********************************************************************************/

	const fehBody = document.body;
	const workDurationInput = document.getElementById("work-duration");
	const restDurationInput = document.getElementById("rest-duration");
	const circleProgress = document.querySelector(".circle-progress");
	const timerTime = document.getElementById("feh-timer-time");
	const intervalInput = document.getElementById("long-rest-interval");
	
	const btnToggleSettings = document.getElementById('feh-toggle-settings');
	const btnCloseSettings = document.getElementById('feh-close-settings');
	const btnRestart = document.getElementById('feh-toggle-restart');
	const completedSessionsElement = document.getElementById("feh-completed-sessions");
	const longRestDurationInput = document.getElementById("long-rest-duration");



	let workDuration = parseInt(workDurationInput.value) * 60;
	let restDuration = parseInt(restDurationInput.value) * 60;
	let longRestDuration = parseInt(longRestDurationInput.value) * 60; 
	let Interval = parseInt(intervalInput.value);
	let remainingTime = workDuration;
	let isPaused = true;
	let isWorking = true;
	let isLong = false;
	let intervalId;
	let completedSessions = 0;
	let longBreakInterval = Interval;
	
	
	


	/******************************************************************************** 
	* BG
	********************************************************************************/


		//here you can add your bg it's like a feature 
	 const backgroundImages = [
		
		"url(https://www.pixground.com/wp-content/uploads/2023/04/Sunset-Forest-Scenery-AI-Generated-4K-Wallpaper.jpg)",
		"url(https://images5.alphacoders.com/133/1338269.png)",
		"url(https://images.alphacoders.com/134/1343532.png)",
		"url(https://images4.alphacoders.com/134/1341419.png)",
		"url(https://www.pixground.com/wp-content/uploads/2023/09/Sunset-Anime-Comet-Stars-AI-Generated-4K-Wallpaper-1-jpg.webp)",
		"url(https://www.pixground.com/wp-content/uploads/2024/02/Glowing-Colorful-River-AI-Generated-4K-Wallpaper-2048x1152.webp)",
		"url(https://www.pixground.com/wp-content/uploads/2024/02/Frozen-Chunks-Of-Iceberg-AI-Generated-4K-Wallpaper-2048x1152.webp)",
	


    ];

    let currentBackgroundIndex = 0;



    function updateBackground() {
		
        document.getElementById('vista-bg').style.backgroundImage = backgroundImages[currentBackgroundIndex];
		if (currentBackgroundIndex <= backgroundImages.length){
			currentBackgroundIndex = currentBackgroundIndex + 1;
		}else{
			currentBackgroundIndex = 0
		}
		
    }




    updateBackground(); 





	/******************************************************************************** 
	* Pomodoro overlay screen
	********************************************************************************/

	window.addEventListener("load", () => {
		fehBody.classList.add('page-loaded');
	});
	
	
	/******************************************************************************** 
	* Toggle settings screen
	********************************************************************************/
	
	function setBodySettings() {
		fehBody.classList.contains('settings-active') ? fehBody.classList.remove('settings-active') : fehBody.classList.add('settings-active');
	}

	function toggleSettings() {
		if (event.type === 'click') {
			setBodySettings();
		}
		else if((event.type === 'keydown' && event.keyCode === 27)) {
			fehBody.classList.remove('settings-active');
		}
	}

	btnToggleSettings.addEventListener('click', toggleSettings);
	btnCloseSettings.addEventListener('click', toggleSettings);
	document.addEventListener('keydown', toggleSettings);
	
	
	/******************************************************************************** 
	* Play button is clicked + start timer + restat button
	********************************************************************************/

	const startBtn = document.getElementById("start-btn");
	startBtn.addEventListener("click", () => {
		isPaused = false;

		fehBody.classList.add('timer-running');

		/** 
		* Is work timer
		*/
		if (isWorking) {
			fehBody.classList.remove('timer-paused');
		}
		/** 
		* or rest timer
		*/
		else {
			fehBody.classList.add('rest-mode');
			fehBody.classList.remove('timer-paused');
		}

		if (!intervalId) {
			intervalId = setInterval(updateTimer, 1000);
		}
	});
	
	btnRestart.addEventListener('click', resetTimer);
	function resetTimer() {
		clearInterval(intervalId); 
		intervalId = null; 
		isPaused = true;
		isWorking = true;
		isLong = false;
		remainingTime = isWorking ? workDuration : isLong ? longRestDuration : restDuration;
		fehBody.classList.remove('timer-running');
		updateProgress();

		document.title = "Restart Timer | Time has been stoped";
	}
	
	
	
	
	
	
	/******************************************************************************** 
	* Pause button is clicked 
	********************************************************************************/
	
	const pauseBtn = document.getElementById("pause-btn");
	pauseBtn.addEventListener("click", () => {
		isPaused = true;

		fehBody.classList.remove('timer-running');
		fehBody.classList.add('timer-paused');
		updateProgress()

		
	});
	
	
	/******************************************************************************** 
	* Get work / rest times from settings
	********************************************************************************/

	workDurationInput.addEventListener("change", () => {
		workDuration = parseInt(workDurationInput.value) * 60;
		if (isWorking) {
			remainingTime = workDuration;
			updateProgress();
		}
	});

	restDurationInput.addEventListener("change", () => {
		restDuration = parseInt(restDurationInput.value) * 60;
		if (!isWorking && completedSessions % longBreakInterval !== 0) {
			if (!isWorking) {
				remainingTime = restDuration;
				updateProgress();
			}
		}
	});


	longRestDurationInput.addEventListener("change", () => {
		longRestDuration = parseInt(longRestDurationInput.value) * 60;
		if (!isWorking && completedSessions % longBreakInterval === 0) {
			isLong = true;
			remainingTime = longRestDuration;
			updateProgress();
		}
	});


	intervalInput.addEventListener("change", () => {
		Interval = parseInt(intervalInput.value);
		longBreakInterval = Interval;
	
		console.log(Interval)

	});

	
	
	/******************************************************************************** 
	* Timer
	********************************************************************************/

	function updateTimer() {
		const workFinished = new Audio("/music/success-fanfare-trumpets-6185.mp3");
		const restFinished = new Audio("/music/error-when-entering-the-game-menu-132111.mp3");
	
		
		if (!isPaused) {
			remainingTime--;
			updateProgress()
		
			if (remainingTime <= 0) {

				isWorking = !isWorking;
    			remainingTime = isWorking ? workDuration : isLong ? longRestDuration : restDuration;	
				
				if (!isWorking) {
					if (completedSessions % longBreakInterval === 0) {

						fehBody.classList.add('rest-mode');
						fehBody.classList.remove('timer-running');
						
						completedSessions++;
						completedSessionsElement.textContent = completedSessions;
						
						updateBackground();
					
						console.log("short", backgroundImages.length);
						console.log("interval", longBreakInterval, Interval)
	
						console.log(completedSessions, "interval",longBreakInterval);
						
					} else {

						fehBody.classList.remove('rest-mode');
						fehBody.classList.remove('timer-running'); 
						
						completedSessions++;
						completedSessionsElement.textContent = completedSessions;
						updateBackground();

						console.log("long", backgroundImages.length);
						console.log("interval", longBreakInterval, Interval)
	
						console.log(completedSessions, "interval",longBreakInterval);
					}

					
				} else {

					console.log("work",backgroundImages.length);
					console.log("interval", longBreakInterval, Interval)

					console.log(completedSessions, "interval",longBreakInterval);
					fehBody.classList.remove('rest-mode');
					fehBody.classList.remove('timer-running'); 

					updateBackground();
				}

				playAlarm = isWorking ? restFinished : workFinished;
				playAlarm.play();
	
	
				isPaused = true;
				startNextCycle();
				fehBody.classList.remove('timer-work-active');

				
			}
	
			document.title = timerTime.textContent = formatTime(remainingTime) + " Time left";
	
			updateProgress();
		}
	}
	
	function startNextCycle() {
		circleProgress.style.strokeDashoffset = 0;
		if (completedSessions % longBreakInterval === 0 && !isWorking) {
			remainingTime = longRestDuration;
			isLong = true;
		} else {
			remainingTime = isWorking ? workDuration : restDuration;
			isLong = false;
		}
		startBtn.click();
	}
	
 	
	
	
	/******************************************************************************** 
	* Update circle progress
	********************************************************************************/

	function updateProgress() {

		const radius = 45;
		const circumference = 2 * Math.PI * radius;
		let totalDuration;
		if (isLong){
			totalDuration = isWorking ? workDuration : longRestDuration;
		} else{
			totalDuration = isWorking ? workDuration : restDuration;
		}
		const dashOffset = circumference * remainingTime / totalDuration;
		
		circleProgress.style.strokeDashoffset = dashOffset;
		
		timerTime.textContent = formatTime(remainingTime);
	}

	/******************************************************************************** 
	* Format time
	********************************************************************************/

	function formatTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
	}
	
	updateProgress();

})();