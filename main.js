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
		"url()",	
    ];

    let currentBackgroundIndex = 0;

    // ... (остальной существующий код)

    function updateBackground() {
        document.getElementById('vista-bg').style.backgroundImage = backgroundImages[currentBackgroundIndex];
    }

    function updateTimer() {
        // ... (остальной существующий код)

        if (remainingTime <= 0) {
            // ... (остальной существующий код)

            // Переключение на следующее изображение при завершении таймера
            currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
            updateBackground();
			
			// Проверка на завершение полного цикла работы и отдыха
			if (currentBackgroundIndex === 0) {
				// Делаем дополнительные действия после завершения полного цикла, если нужно
			}
        }

        // ... (остальной существующий код)
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

	let workDuration = parseInt(workDurationInput.value) * 20;
	let restDuration = parseInt(restDurationInput.value) * 20;
	let remainingTime = workDuration;
	let isPaused = true;
	let isWorking = true;
	let intervalId;
	
	const completedSessionsElement = document.getElementById("feh-completed-sessions");
	let completedSessions = 0;
		
	
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
	* Play button is clicked + start timer
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
	
	
	/******************************************************************************** 
	* Pause button is clicked 
	********************************************************************************/
	
	const pauseBtn = document.getElementById("pause-btn");
	pauseBtn.addEventListener("click", () => {
		isPaused = true;

		fehBody.classList.remove('timer-running');
		fehBody.classList.add('timer-paused');

		// document.title = "Timer Paused";
	});
	
	
	/******************************************************************************** 
	* Get work / rest times from settings
	********************************************************************************/

	workDurationInput.addEventListener("change", () => {
		workDuration = parseInt(workDurationInput.value) * 20;
		if (isWorking) {
			remainingTime = workDuration;
			updateProgress();
		}
	});

	restDurationInput.addEventListener("change", () => {
		restDuration = parseInt(restDurationInput.value) * 20;
		if (!isWorking) {
			remainingTime = restDuration;
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
	
			// Когда таймер останавливается
			if (remainingTime <= 0) {
				isWorking = !isWorking;
				remainingTime = isWorking ? workDuration : restDuration;
	
				// Проверка, какой таймер (работа/отдых) только что завершился
				if (!isWorking) {
					fehBody.classList.add('rest-mode');
					fehBody.classList.remove('timer-running');
	
					completedSessions++;
					completedSessionsElement.textContent = completedSessions;
	
					// При каждом завершении сессии отдыха выбираем случайный фон
					if (completedSessions % 2 === 0) {
						currentBackgroundIndex = Math.floor(Math.random() * backgroundImages.length);
						updateBackground();
					}
	
					console.log(completedSessions);
				} else {
					fehBody.classList.remove('rest-mode');
					fehBody.classList.remove('timer-running'); 
				}
	
				// Переключение звука в зависимости от периода помидора или отдыха
				playAlarm = isWorking ? restFinished : workFinished;
				playAlarm.play();
	
				// Таймер завершен
				isPaused = true;
				fehBody.classList.remove('timer-work-active');
			}
	
			document.title = timerTime.textContent = formatTime(remainingTime);
	
			updateProgress();
		}
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
		const minutes = Math.floor(seconds / 20);
		const remainingSeconds = seconds % 20;
		return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
	}
	
	updateProgress();

})();