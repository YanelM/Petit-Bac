document.addEventListener("DOMContentLoaded", function() {

const allCategories = ["Prénom","Pays","Ville","Animal","Objet","Métier","Marque","Fruit","Légume","Sport",
"Couleur","Film","Chanteur","Instrument","Voiture","Capitale","Monument"];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let totalScore=0, usedLetters=[], roundData=[], timerInterval;

function renderCategorySelection(){
    const container=document.getElementById("categorySelection");
    container.innerHTML="";
    allCategories.forEach(cat=>{
        container.innerHTML+=`<label><input type="checkbox" value="${cat}">${cat}</label>`;
    });
}
renderCategorySelection();

function updateLetterDropdown(){
    const select=document.getElementById("letterSelect");
    select.innerHTML="";
    alphabet.forEach(letter=>{
        if(!usedLetters.includes(letter))
            select.innerHTML+=`<option value="${letter}">${letter}</option>`;
    });
}
updateLetterDropdown();

function updateUsedLettersDisplay(){
    document.getElementById("usedLettersDisplay").textContent=
        "Lettres utilisées : "+usedLetters.join(" - ");
}

function closeAllRounds(){
    document.querySelectorAll(".round").forEach(r=>{
        r.classList.remove("open");
        r.querySelector(".round-content").style.maxHeight="0px";
    });
    document.querySelectorAll(".timer-container")
        .forEach(t=>t.classList.remove("fixed-timer"));
}

window.startRound = function(letter){

    const num=parseInt(document.getElementById("numCategories").value);
    const time=parseInt(document.getElementById("gameTime").value);
    const checked=document.querySelectorAll("#categorySelection input:checked");

    if(checked.length!==num){
        alert("Sélectionne exactement "+num+" catégories.");
        return;
    }

    if(!letter||usedLetters.includes(letter)){
        alert("Lettre invalide ou déjà utilisée.");
        return;
    }

    usedLetters.push(letter);
    updateLetterDropdown();
    updateUsedLettersDisplay();
    closeAllRounds();

    const categories=Array.from(checked).map(cb=>cb.value);
    let currentTime=time;

    const roundDiv=document.createElement("div");
    roundDiv.className="round open";

    roundDiv.innerHTML=`
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
                        <tr><th>Catégorie</th><th>Réponse</th><th>Points</th></tr>
                    </thead>
                    <tbody>
                    ${categories.map(cat=>`
                        <tr>
                            <td data-label="Catégorie">${cat}</td>
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
            <button class="validateBtn" disabled>Valider la manche</button>
        </div>
    `;

    document.getElementById("rounds").appendChild(roundDiv);

    const content=roundDiv.querySelector(".round-content");
    setTimeout(()=>{ content.style.maxHeight=content.scrollHeight+"px"; },50);

    roundDiv.querySelector(".round-header").onclick=()=>{
        if(roundDiv.classList.contains("open")){
            roundDiv.classList.remove("open");
            content.style.maxHeight="0px";
        } else {
            closeAllRounds();
            roundDiv.classList.add("open");
            content.style.maxHeight=content.scrollHeight+"px";
        }
    };

    const timerContainer=roundDiv.querySelector(".timer-container");
    const timerDisplay=roundDiv.querySelector(".time");
    const progressFill=roundDiv.querySelector(".progress-fill");
    const validateBtn=roundDiv.querySelector(".validateBtn");
    const inputs=roundDiv.querySelectorAll("input[type=text]");

    function handleScroll(){
        if(window.innerWidth>768) return;
        const rect=timerContainer.getBoundingClientRect();
        if(rect.top<=0){
            timerContainer.classList.add("fixed-timer");
        } else {
            timerContainer.classList.remove("fixed-timer");
        }
    }

    window.addEventListener("scroll",handleScroll);

    clearInterval(timerInterval);

    timerInterval=setInterval(()=>{
        currentTime--;
        timerDisplay.textContent=currentTime;

        let percent=(currentTime/time)*100;
        progressFill.style.width=percent+"%";
        let hue=percent*1.2;
        progressFill.style.background=`hsl(${hue},85%,50%)`;

        if(percent<=20) progressFill.classList.add("danger");

        if(currentTime<=0){
            clearInterval(timerInterval);
            progressFill.style.width="0%";
            roundDiv.querySelectorAll("select").forEach(s=>s.disabled=false);
            inputs.forEach(input=>input.readOnly=true);
            validateBtn.disabled=false;
        }
    },1000);

    validateBtn.onclick=function(){
        let roundScore=0;
        roundDiv.querySelectorAll("select").forEach(sel=>{
            roundScore+=parseInt(sel.value);
        });
        totalScore+=roundScore;
        roundDiv.querySelector(".header-score").textContent="Score : "+roundScore;
        document.getElementById("totalScore").textContent="Score total : "+totalScore;
        roundDiv.classList.add("validated");
        validateBtn.disabled=true;
    };
};

window.startRoundRandom = function(){
    const remaining=alphabet.filter(l=>!usedLetters.includes(l));
    if(remaining.length===0) return;
    const randomLetter=remaining[Math.floor(Math.random()*remaining.length)];
    startRound(randomLetter);
};

window.startRoundManual = function(){
    startRound(document.getElementById("letterSelect").value);
};

window.finishGame = function(){};

window.restartGame = function(){
    clearInterval(timerInterval);
    totalScore=0;
    usedLetters=[];
    document.getElementById("rounds").innerHTML="";
    document.getElementById("statistics").innerHTML="";
    document.getElementById("totalScore").textContent="Score total : 0";
    updateLetterDropdown();
    updateUsedLettersDisplay();
};

});
