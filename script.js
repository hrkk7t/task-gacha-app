document.addEventListener('DOMContentLoaded', () => {

    // --- DOM要素の取得 ---
    const openSettingsButton = document.getElementById('open-settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalButton = settingsModal.querySelector('.close-modal-btn');
    const drawButton = document.getElementById('draw-button');
    const masterTaskList = document.getElementById('master-task-list');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const dailyTodoList = document.getElementById('daily-todo-list');
    const displayDateSpan = document.getElementById('display-date');
    const resultModal = document.getElementById('result-modal');
    const resultText = document.getElementById('result-text');
    const prevDateBtn = document.getElementById('prev-date-btn');
    const nextDateBtn = document.getElementById('next-date-btn');
    const roulette = document.getElementById('roulette');
    const resetTodayBtn = document.getElementById('reset-today-btn');

    // --- グローバル変数 ---
    let masterTasks = [];
    let currentDate = new Date();

    // --- ヘルパー関数 ---
    const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const formatDisplayDate = (date) => {
        const today = new Date();
        if (formatDate(date) === formatDate(today)) {
            return 'Today';
        }
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    // --- データ管理関数 ---
    const saveMasterTasks = () => {
        localStorage.setItem('masterTasks', JSON.stringify(masterTasks));
    };
    const loadMasterTasks = () => {
        const savedTasks = localStorage.getItem('masterTasks');
        if (savedTasks) {
            masterTasks = JSON.parse(savedTasks);
        } else {
            // ↓↓↓ サンプルタスクを日常的なものに変更 ↓↓↓
            masterTasks = [
                '15分間の読書をする',
                '部屋の掃除機をかける',
                '5分間ストレッチをする',
                '近所を散歩する',
                '新しい音楽プレイリストを作る',
                '観葉植物の世話をする'
            ];
            // ↑↑↑ サンプルタスクを日常的なものに変更 ↑↑↑
            saveMasterTasks();
        }
    };
    const saveDailyTasks = (date, tasks) => {
        localStorage.setItem(`dailyTasks_${formatDate(date)}`, JSON.stringify(tasks));
    };
    const loadDailyTasks = (date) => {
        const savedTasks = localStorage.getItem(`dailyTasks_${formatDate(date)}`);
        return savedTasks ? JSON.parse(savedTasks) : [];
    };

    // --- 描画・UI更新関数 ---
    const renderMasterTasks = () => {
        masterTaskList.innerHTML = '';
        if (masterTasks.length === 0) {
            masterTaskList.innerHTML = '<p class="empty-message">タスクを追加してください</p>';
            return;
        }
        masterTasks.forEach((taskText, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${taskText}</span>
                <button class="delete-master-task" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
            `;
            masterTaskList.appendChild(li);
        });
    };
    const renderDailyTasks = (tasks) => {
        dailyTodoList.innerHTML = '';
        if (tasks.length === 0) {
            dailyTodoList.innerHTML = '<li class="empty-message">タスクはありません</li>';
            return;
        }
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            const isToday = formatDate(currentDate) === formatDate(new Date());
            li.innerHTML = `
                <div class="checkbox-container" data-index="${index}" style="${isToday ? '' : 'pointer-events: none;'}">
                    <i class="fa-solid fa-check"></i>
                </div>
                <span class="task-text">${task.text}</span>
            `;
            dailyTodoList.appendChild(li);
        });
    };
    const updateUIForDate = () => {
        displayDateSpan.textContent = formatDisplayDate(currentDate);
        const tasks = loadDailyTasks(currentDate);
        renderDailyTasks(tasks);
        const isToday = formatDate(currentDate) === formatDate(new Date());
        nextDateBtn.disabled = isToday;
        drawButton.disabled = !isToday;
        resetTodayBtn.style.visibility = isToday ? 'visible' : 'hidden';
    };

    // --- イベント処理関数 ---
    const addMasterTask = () => {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            masterTasks.push(taskText);
            saveMasterTasks();
            renderMasterTasks();
            newTaskInput.value = '';
        }
    };
    const drawGacha = () => {
        if (masterTasks.length < 2) {
            alert('ガチャを回すには、タスクが2つ以上必要です！設定（⚙️）からタスクを追加してください。');
            return;
        }
        resultText.classList.add('hidden');
        roulette.innerHTML = '';
        roulette.style.transform = 'translateY(0)';
        roulette.classList.remove('is-rolling');
        const shuffledTasks = [...masterTasks].sort(() => Math.random() - 0.5);
        const rouletteItems = [...shuffledTasks, ...shuffledTasks, ...shuffledTasks];
        rouletteItems.forEach(task => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'roulette-item';
            itemDiv.textContent = task;
            roulette.appendChild(itemDiv);
        });
        const dailyTasks = loadDailyTasks(currentDate);
        const availableTasks = masterTasks.filter(mt => !dailyTasks.some(dt => dt.text === mt));
        const targetTask = availableTasks.length > 0
            ? availableTasks[Math.floor(Math.random() * availableTasks.length)]
            : masterTasks[Math.floor(Math.random() * masterTasks.length)];
        const targetIndex = rouletteItems.length - shuffledTasks.length + shuffledTasks.indexOf(targetTask);
        const positionY = -targetIndex * 100;
        resultModal.classList.remove('hidden');
        setTimeout(() => {
            roulette.classList.add('is-rolling');
            roulette.style.transform = `translateY(${positionY}px)`;
        }, 100);
        setTimeout(() => {
            resultText.textContent = '...に決定！';
            resultText.classList.remove('hidden');
            setTimeout(() => {
                resultModal.classList.add('hidden');
                if (!dailyTasks.some(task => task.text === targetTask)) {
                    dailyTasks.push({ text: targetTask, completed: false });
                    saveDailyTasks(currentDate, dailyTasks);
                    updateUIForDate();
                }
            }, 1500);
        }, 3500);
    };

    // --- イベントリスナーの設定 ---
    openSettingsButton.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });
    closeModalButton.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });
    addTaskButton.addEventListener('click', addMasterTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addMasterTask();
        }
    });
    drawButton.addEventListener('click', drawGacha);
    masterTaskList.addEventListener('click', (e) => {
        if (e.target.closest('.delete-master-task')) {
            const button = e.target.closest('.delete-master-task');
            const index = parseInt(button.dataset.index, 10);
            masterTasks.splice(index, 1);
            saveMasterTasks();
            renderMasterTasks();
        }
    });
    prevDateBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateUIForDate();
    });
    nextDateBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateUIForDate();
    });
    dailyTodoList.addEventListener('click', (e) => {
        const isToday = formatDate(currentDate) === formatDate(new Date());
        if (!isToday) {
            return;
        }
        if (e.target.closest('.checkbox-container')) {
            const checkbox = e.target.closest('.checkbox-container');
            const index = parseInt(checkbox.dataset.index, 10);
            const tasks = loadDailyTasks(currentDate);
            tasks[index].completed = !tasks[index].completed;
            saveDailyTasks(currentDate, tasks);
            renderDailyTasks(tasks);
        }
    });
    resetTodayBtn.addEventListener('click', () => {
        const tasks = loadDailyTasks(currentDate);
        if (tasks.length === 0) {
            alert('リセットするタスクがありません。');
            return;
        }
        const isConfirmed = confirm('今日のリストをリセットしますか？');
        if (isConfirmed) {
            saveDailyTasks(currentDate, []);
            updateUIForDate();
        }
    });

    // --- 初期化処理 ---
    const init = () => {
        loadMasterTasks();
        renderMasterTasks();
        updateUIForDate();
    };
    init();

});