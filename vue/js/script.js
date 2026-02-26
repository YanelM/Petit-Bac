const allCategories = ["Prénom","Pays","Ville","Animal","Objet","Métier","Marque","Fruit","Légume","Sport"];
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

function startRound(letter){

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

    const categories=Array.from(checked).map(cb=>cb.value);
    let currentTime=time;

    const roundDiv=document.createElement("div");
    roundDiv.className="round";

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

            <table>
                <thead>
                    <tr><th>Catégorie</th><th>Réponse</th><th>Points</th></tr>
                </thead>
                <tbody>
                ${categories.map(cat=>`
                    <tr>
                        <td>${cat}</td>
                        <td><input type="text"></td>
                        <td>
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

            <button class="validateBtn" disabled>Valider la manche</button>
        </div>
    `;

    document.getElementById("rounds").appendChild(roundDiv);

    const timerDisplay=roundDiv.querySelector(".time");
    const progressFill=roundDiv.querySelector(".progress-fill");
    const validateBtn=roundDiv.querySelector(".validateBtn");
    const inputs=roundDiv.querySelectorAll("input[type=text]");

    clearInterval(timerInterval);

    timerInterval=setInterval(()=>{

        currentTime--;
        timerDisplay.textContent=currentTime;

        let percent=(currentTime/time)*100;
        progressFill.style.width=percent+"%";

        // 🎨 Dégradé progressif vert → rouge
        let hue = (percent * 1.2); 
        progressFill.style.background = `hsl(${hue}, 85%, 50%)`;

        if(percent <= 20){
            progressFill.classList.add("danger");
        }

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

        validateBtn.disabled=true;
    };
}

function startRoundRandom(){
    const remaining=alphabet.filter(l=>!usedLetters.includes(l));
    if(remaining.length===0) return;
    const randomLetter=remaining[Math.floor(Math.random()*remaining.length)];
    startRound(randomLetter);
}

function startRoundManual(){
    startRound(document.getElementById("letterSelect").value);
}

function restartGame(){
    clearInterval(timerInterval);
    totalScore=0;
    usedLetters=[];
    document.getElementById("rounds").innerHTML="";
    document.getElementById("totalScore").textContent="Score total : 0";
    updateLetterDropdown();
}
