(function () {
    // ... (весь существующий код)

    const backgroundImages = [
		"url(https://www.pixground.com/wp-content/uploads/2023/04/Sunset-Forest-Scenery-AI-Generated-4K-Wallpaper.jpg)",
		"url(https://www.pixground.com/wp-content/uploads/2023/09/Sunset-Anime-Comet-Stars-AI-Generated-4K-Wallpaper-1-jpg.webp)",
		"url(https://www.pixground.com/wp-content/uploads/2024/02/Glowing-Colorful-River-AI-Generated-4K-Wallpaper-2048x1152.webp)",
		"url(https://www.pixground.com/wp-content/uploads/2024/02/Frozen-Chunks-Of-Iceberg-AI-Generated-4K-Wallpaper-2048x1152.webp)",
		"url(https://www.pixground.com/wp-content/uploads/2024/02/Small-House-Facing-Tempest-AI-Generated-4K-Wallpaper-2048x1152.webp)",
		"url(https://www.pixground.com/wp-content/uploads/2023/12/Sunrise-Over-Planet-Earth-AI-Generated-4K-Wallpaper-2048x1152.webp)",
		"url(https://www.pixground.com/wp-content/uploads/2024/02/Palm-Silhouettes-At-Dusk-AI-Generated-4K-Wallpaper-2048x1152.webp)",

    ];

    let currentBackgroundIndex = 0;

    // ... (остальной существующий код)

    function updateBackground() {
        document.getElementById('vista-bg').style.backgroundImage = backgroundImages[currentBackgroundIndex];
    }



    // ... (остальной существующий код)

    updateBackground(); // Установка изначального фона

})();



(function () {

	/******************************************************************************** 
	* Declare vars
	********************************************************************************/

	const fehBody = document.body;
	const workDurationInput = document.getElementById("work-duration");
	const restDurationInput = document.getElementById("rest-duration");
	const circleProgress = document.querySelector(".circle-progress");
	const timerTime = document.getElementById("feh-timer-time");
	
	const btnToggleSettings = document.getElementById('feh-toggle-settings');
	const btnCloseSettings = document.getElementById('feh-close-settings');
	const btnRestart = document.getElementById('feh-toggle-restart');


	let workDuration = parseInt(workDurationInput.value) * 6;
	let restDuration = parseInt(restDurationInput.value) * 6;
	let remainingTime = workDuration;
	let isPaused = true;
	let isWorking = true;
	let isLong = false;
	let intervalId;
	const longBreakInterval = 2;
	
	const completedSessionsElement = document.getElementById("feh-completed-sessions");
	let completedSessions = 0;
		
	const longRestDurationInput = document.getElementById("long-rest-duration");
	let longRestDuration = parseInt(longRestDurationInput.value) * 6; 



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
		clearInterval(intervalId); // Очищаем интервал
		intervalId = null; // Обнуляем переменную интервала
		isPaused = true;
		isWorking = true;
		isLong = false;
		remainingTime = workDuration; // Устанавливаем оставшееся время в изначальное значение
		fehBody.classList.remove('timer-running', 'timer-paused', 'rest-mode');
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

		// document.title = "Timer Paused";
	});
	
	
	/******************************************************************************** 
	* Get work / rest times from settings
	********************************************************************************/

	workDurationInput.addEventListener("change", () => {
		workDuration = parseInt(workDurationInput.value) * 6;
		if (isWorking) {
			remainingTime = workDuration;
			updateProgress();
		}
	});

	restDurationInput.addEventListener("change", () => {
		restDuration = parseInt(restDurationInput.value) * 6;
		if (!isWorking && completedSessions % longBreakInterval !== 0) {
			if (!isWorking) {
				remainingTime = restDuration;
				updateProgress();
			}
		}
	});


	longRestDurationInput.addEventListener("change", () => {
		longRestDuration = parseInt(longRestDurationInput.value) * 6;
		if (!isWorking && completedSessions % longBreakInterval === 0) {
			isLong = true;
			remainingTime = longRestDuration;
			updateProgress();
		}
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
			// Когда таймер останавливается
			if (remainingTime <= 0) {

				isWorking = !isWorking;
    			remainingTime = isWorking ? workDuration : isLong ? longRestDuration : restDuration;	
				
								// Проверка, какой таймер (работа/отдых) только что завершился
				if (!isWorking) {
					if (completedSessions % longBreakInterval === 0) {
						// Действия при завершении long rest
						fehBody.classList.add('rest-mode');
						fehBody.classList.remove('timer-running');
						
						completedSessions++;
						completedSessionsElement.textContent = completedSessions;
						
						console.log("short");
						
					} else {
						// Действия при завершении обычного отдыха
						fehBody.classList.remove('rest-mode');
						fehBody.classList.remove('timer-running'); 

						completedSessions++;
						completedSessionsElement.textContent = completedSessions;

						console.log("long");
					}

					// Только здесь увеличиваем completedSessions, после того как проверили, нужно ли делать long rest
				} else {
					// Действия при завершении работы
					fehBody.classList.remove('rest-mode');
					fehBody.classList.remove('timer-running'); 
				}

	
				// Переключение звука в зависимости от периода помидора или отдыха
				playAlarm = isWorking ? restFinished : workFinished;
				playAlarm.play();
	
				// Таймер завершен
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
		if (completedSessions % longBreakInterval === 0) {
			remainingTime = longRestDuration;
		} else {
			remainingTime = isWorking ? workDuration : restDuration;
		}
		startBtn.click();
	}
	
 	
	
	
	/******************************************************************************** 
	* Update circle progress
	********************************************************************************/

	function updateProgress() {

		const radius = 45;
		const circumference = 2 * Math.PI * radius;

		const totalDuration = isWorking ? workDuration : restDuration;
		const dashOffset = circumference * remainingTime / totalDuration;
		
		circleProgress.style.strokeDashoffset = dashOffset;
		
		timerTime.textContent = formatTime(remainingTime);
	}

	/******************************************************************************** 
	* Format time
	********************************************************************************/

	function formatTime(seconds) {
		const minutes = Math.floor(seconds / 6);
		const remainingSeconds = seconds % 6;
		return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
	}
	
	updateProgress();

})();
