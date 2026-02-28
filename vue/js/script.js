document.addEventListener("DOMContentLoaded", function() {

const allCategories = ["Prénom","Pays","Ville","Animal","Objet","Métier","Marque","Fruit / Légume","Sport",
    "Couleur","Film / Série","Chanteur","Instrument","Voiture","Capitale","Monument","Émission TV","Végétale","Titre de chanson", "Partie du corps", "Vêtement", "Moyen de transport"
    , "Boisson", "Plat", "Mot anglais", "Mot espagnol", "Sportif", "Chose qui se trouve dans un sac à main", "Chose qui sent mauvais"];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let totalScore = 0;
let usedLetters = [];
let roundData = [];
let timerInterval = null;

// =============================
// RENDER CATEGORIES
// =============================
function renderCategorySelection(){
    const container = document.getElementById("categorySelection");
    container.innerHTML = "";
    allCategories.forEach(cat=>{
        container.innerHTML += `<label><input type="checkbox" value="${cat}">${cat}</label>`;
    });
}
renderCategorySelection();

// =============================
// UPDATE LETTER DROPDOWN
// =============================
function updateLetterDropdown(){
    const select = document.getElementById("letterSelect");
    select.innerHTML = "";
    alphabet.forEach(letter=>{
        if(!usedLetters.includes(letter)){
            select.innerHTML += `<option value="${letter}">${letter}</option>`;
        }
    });
}
updateLetterDropdown();

// =============================
function updateUsedLettersDisplay(){
    document.getElementById("usedLettersDisplay").textContent =
        "Lettres utilisées : " + usedLetters.join(" - ");
}

// =============================
function closeAllRounds(){
    document.querySelectorAll(".round").forEach(r=>{
        r.classList.remove("open");
    });
    document.querySelectorAll(".timer-container").forEach(t=>{
        t.classList.remove("fixed-timer");
    });
}

// =============================
// START ROUND
// =============================
window.startRound = function(letter){

    const num = parseInt(document.getElementById("numCategories").value);
    const time = parseInt(document.getElementById("gameTime").value);
    const checked = document.querySelectorAll("#categorySelection input:checked");

    if(checked.length !== num){
        alert("Sélectionne exactement " + num + " catégories.");
        return;
    }

    if(!letter || usedLetters.includes(letter)){
        alert("Lettre invalide ou déjà utilisée.");
        return;
    }

    usedLetters.push(letter);
    updateLetterDropdown();
    updateUsedLettersDisplay();
    closeAllRounds();

    const categories = Array.from(checked).map(cb=>cb.value);
    let currentTime = time;

    const roundDiv = document.createElement("div");
    roundDiv.className = "round open";

    roundDiv.innerHTML = `
        <div class="round-header">
            <span>Lettre : ${letter}</span>
            <span class="header-score">Score : 0</span>
        </div>

        <div class="round-content">
            <div class="timer-container">
                <div>Temps restant : <span class="time">${currentTime}</span>s</div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Catégorie</th>
                            <th>Réponse</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map(cat=>`
                            <tr>
                                <td data-label="Catégorie" class="categorie_manche">${cat}</td>
                                <td data-label="Réponse"><input type="text"></td>
                                <td data-label="Points">
                                    <select disabled>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                    </select>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <button class="validateBtn" disabled>
                Valider la manche
            </button>
        </div>
    `;

    document.getElementById("rounds").appendChild(roundDiv);

    // =============================
    // MENU DEROULANT PROPRE
    // =============================
    roundDiv.querySelector(".round-header").onclick = () => {

        if(roundDiv.classList.contains("open")){
            roundDiv.classList.remove("open");
        } else {
            document.querySelectorAll(".round").forEach(r=>{
                r.classList.remove("open");
            });
            roundDiv.classList.add("open");
        }
    };

    const timerContainer = roundDiv.querySelector(".timer-container");
    const timerDisplay = roundDiv.querySelector(".time");
    const progressFill = roundDiv.querySelector(".progress-fill");
    const validateBtn = roundDiv.querySelector(".validateBtn");
    const inputs = roundDiv.querySelectorAll("input[type=text]");

    // =============================
    // TIMER FIXE AU SCROLL (mobile)
    // =============================
    const originalOffsetTop = timerContainer.offsetTop;

    function handleScroll(){
        if(window.innerWidth > 768){
            timerContainer.classList.remove("fixed-timer");
            return;
        }

        if(window.scrollY >= originalOffsetTop){
            timerContainer.classList.add("fixed-timer");
        } else {
            timerContainer.classList.remove("fixed-timer");
        }
    }

    window.addEventListener("scroll", handleScroll);

    // =============================
    // TIMER
    // =============================
    clearInterval(timerInterval);

    timerInterval = setInterval(()=>{
        currentTime--;
        timerDisplay.textContent = currentTime;

        let percent = (currentTime / time) * 100;
        progressFill.style.width = percent + "%";

        let hue = percent * 1.2;
        progressFill.style.background = `hsl(${hue},85%,50%)`;

        if(currentTime <= 0){
            clearInterval(timerInterval);
            progressFill.style.width = "0%";
            roundDiv.querySelectorAll("select").forEach(s=>s.disabled=false);
            inputs.forEach(input=>input.readOnly=true);
            validateBtn.disabled=false;
        }
    },1000);

    // =============================
    // VALIDATE BUTTON
    // =============================
    validateBtn.onclick = function(){

        let roundScore = 0;

        roundDiv.querySelectorAll("select").forEach(sel=>{
            roundScore += parseInt(sel.value);
        });

        totalScore += roundScore;

        roundDiv.querySelector(".header-score").textContent =
            "Score : " + roundScore;

        document.getElementById("totalScore").textContent =
            "Score total : " + totalScore;

        // Animation bouton
        validateBtn.classList.add("animated");

        roundDiv.classList.add("validated");

        roundData.push({
            letter: letter,
            score: roundScore
        });

        validateBtn.disabled = true;
    };
};

// =============================
// AUTRES FONCTIONS
// =============================

// =============================
// LANCER MANCHE (nouveau système)
// =============================
window.launchRound = function(){

    const mode = document.querySelector('input[name="letterMode"]:checked').value;

    if(mode === "random"){

        const remaining = alphabet.filter(l => !usedLetters.includes(l));

        if(remaining.length === 0){
            alert("Toutes les lettres ont été utilisées !");
            return;
        }

        const randomLetter =
            remaining[Math.floor(Math.random() * remaining.length)];

        startRound(randomLetter);

    } else {

        const letter = document.getElementById("letterSelect").value;

        if(!letter || usedLetters.includes(letter)){
            alert("Lettre invalide ou déjà utilisée.");
            return;
        }

        startRound(letter);
    }
};

window.finishGame = function(){

    if(roundData.length === 0) return;

    let avg = (totalScore/roundData.length).toFixed(2);
    let best = Math.max(...roundData.map(r=>r.score));

    document.getElementById("statistics").innerHTML = `
        <div class="stats">
            <h3>Statistiques</h3>
            <p>Manches jouées : ${roundData.length}</p>
            <p>Score total : ${totalScore}</p>
            <p>Moyenne par manche : ${avg}</p>
            <p>Meilleure manche : ${best}</p>
        </div>
    `;
};

window.restartGame = function(){
    clearInterval(timerInterval);

    totalScore = 0;
    usedLetters = [];
    roundData = [];

    document.getElementById("rounds").innerHTML = "";
    document.getElementById("statistics").innerHTML = "";
    document.getElementById("totalScore").textContent = "Score total : 0";

    updateLetterDropdown();
    updateUsedLettersDisplay();

    document.querySelectorAll("#categorySelection input")
        .forEach(cb=>cb.checked=false);

    document.querySelectorAll(".timer-container")
        .forEach(t=>t.classList.remove("fixed-timer"));
};


});




