const listers = document.getElementById("liters");
const percentage = document.getElementById("percentage");
const remained = document.getElementById("remained");
const minus = document.getElementById("minus");
const plus = document.getElementById("plus");
const smallCups = document.querySelectorAll(".cup-small");
const cups = document.getElementById("cups");
//converting NodeList from querySelectorAll() to an array
let smallCupsArr = Array.from(smallCups);
let goal = 2;

minus.addEventListener("click", () => updateGoal("-"));
plus.addEventListener("click", () => updateGoal("+"));

function updateGoal(sign) {
  //taking plus or minus string sign
  if (sign == "+" && goal < 3.75) {
    goal += 0.25;
    addCup();
  } else if (sign == "-" && goal > 2) {
    goal -= 0.25;
    deleteCup();
  }
  document.getElementById("goal").innerText = goal;
  listers.innerText = `${goal}L`;
  updateBigCup();
  console.log(smallCupsArr);
}

const addCup = () => {
  const newCup = document.createElement("div");
  newCup.classList.add("cup", "cup-small");
  const newContent = document.createTextNode("250 ml");
  newCup.appendChild(newContent);
  const INDEX = smallCupsArr.length;
  newCup.addEventListener("click", () => highlightCups(INDEX));
  cups.appendChild(newCup);
  smallCupsArr.push(newCup);
};

const deleteCup = () => {
  cups.removeChild(cups.lastChild);
  smallCupsArr.pop();
};

updateBigCup();

smallCupsArr.forEach((cup, idx) => {
  cup.addEventListener("click", () => highlightCups(idx));
});

function highlightCups(idx) {
  if (
    idx === smallCupsArr.length - 1 &&
    smallCupsArr[idx].classList.contains("full")
  )
    idx--;
  else if (
    smallCupsArr[idx].classList.contains("full") &&
    !smallCupsArr[idx].nextElementSibling.classList.contains("full")
  ) {
    idx--;
  }

  smallCupsArr.forEach((cup, idx2) => {
    if (idx2 <= idx) {
      cup.classList.add("full");
    } else {
      cup.classList.remove("full");
    }
  });

  updateBigCup();
}

function updateBigCup() {
  const fullCups = document.querySelectorAll(".cup-small.full").length;
  const totalCups = smallCupsArr.length;

  if (fullCups === 0) {
    percentage.style.visibility = "hidden";
    percentage.style.height = 0;
  } else {
    percentage.style.visibility = "visible";
    percentage.style.height = `${(fullCups / totalCups) * 330}px`;
    percentage.innerText = `${Math.round((fullCups / totalCups) * 100)}%`;
  }

  if (fullCups === totalCups) {
    remained.style.visibility = "hidden";
    remained.style.height = 0;
  } else {
    remained.style.visibility = "visible";
    listers.innerText = `${goal - (250 * fullCups) / 1000}L`;
  }
}

const DAILY_GOAL = 2000;

function loadLogs() {
  const stored = localStorage.getItem("hydrationLogs");

  if (stored) {
    const logs = JSON.parse(stored);
    showHydrationHistory(logs);
  } else {
    fetch("hydration.json")
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("hydrationLogs", JSON.stringify(data));
        showHydrationHistory(data);
      });
  }
}

loadLogs();

function log250ml() {
  const newEntry = {
    amount: 250,
    timestamp: new Date().toISOString(),
  };

  // Get existing logs from localStorage
  let logs = JSON.parse(localStorage.getItem("hydrationLogs")) || [];

  // Add the new log
  logs.push(newEntry);

  // Save it back to localStorage
  localStorage.setItem("hydrationLogs", JSON.stringify(logs));

  // Refresh hydration history
  showHydrationHistory(logs);
}

function showHydrationHistory(logs) {
  const history = groupLogsByDate(logs);
  const container = document.getElementById("history-container");
  container.innerHTML = "";

  Object.keys(history)
    .sort()
    .reverse()
    .forEach((date) => {
      const entries = history[date];
      const total = entries.reduce((sum, log) => sum + log.amount, 0);
      const goalMsg =
        total >= DAILY_GOAL
          ? `<span style="color:green;">✅ Goal Achieved! 🎉</span>`
          : `<span style="color:orange;">🔄 ${total}/${DAILY_GOAL} ml</span>`;

      let html = `<h3>${date} — ${goalMsg}</h3><ul>`;
      entries.forEach((entry) => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        html += `<li>${time} — ${entry.amount} ml</li>`;
      });
      html += "</ul>";
      container.innerHTML += html;
    });
}

function groupLogsByDate(logs) {
  const history = {};
  logs.forEach((log) => {
    const date = log.timestamp.slice(0, 10);
    if (!history[date]) history[date] = [];
    history[date].push(log);
  });
  return history;
}

let lastDate = new Date().toISOString().slice(0, 10);

setInterval(() => {
  const currentDate = new Date().toISOString().slice(0, 10);
  if (currentDate !== lastDate) {
    lastDate = currentDate;
    // Reload logs and refresh view
    loadLogs(); // call your existing function
  }
}, 60000); // check every 60 seconds

// fetch("hydration.json")
//   .then((response) => response.json())
//   .then((data) => showHydrationHistory(data));

// function groupLogsByDate(logs) {
//   const history = {};

//   logs.forEach((log) => {
//     const date = log.timestamp.slice(0, 10); // 'YYYY-MM-DD'
//     if (!history[date]) history[date] = [];
//     history[date].push(log);
//   });

//   return history;
// }

// function showHydrationHistory(logs) {
//   const history = groupLogsByDate(logs);
//   const container = document.getElementById("history-container");
//   container.innerHTML = "";

//   Object.keys(history)
//     .sort()
//     .reverse()
//     .forEach((date) => {
//       const entries = history[date];
//       const total = entries.reduce((sum, log) => sum + log.amount, 0);

//       let html = `<h3>📅 ${date} — Total: ${total} ml</h3><ul>`;
//       entries.forEach((entry) => {
//         const time = new Date(entry.timestamp).toLocaleTimeString();
//         html += `<li>${time} — ${entry.amount} ml</li>`;
//       });
//       html += `</ul>`;
//       container.innerHTML += html;
//     });
// }
