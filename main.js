// Fishgame by jasperredis
// jasperredis: jris.straw.page
// Game: jasperredis.github.io/Fishgame
// Version 1.0, yyyy-mm-dd
// Check /LICENSE for license info.
// Script file for the title screen. Runs initial processes.

// This code is absolutely miserable. I am sorry. I will probably fix it.

let page = "aaa";
let state;

function switchState(statef) { //* Script to switch state
    // Set state variable
    state = statef

    // Show/hide elements
    const titlee = document.querySelectorAll('.STATE-TITLE');
    titlee.forEach(element => {
        element.style.display = statef == "title" ? "block" : "none";
    });

    const gamee = document.querySelectorAll('.STATE-GAME');
    gamee.forEach(element => {
        element.style.display = statef == "game" ? "block" : "none";
    });

    const endingse = document.querySelectorAll('.STATE-ENDINGS');
    endingse.forEach(element => {
        element.style.display = statef == "endings-ft" || statef == "endings-fg" ? "block" : "none"
        // endings-ft is from title, endings-fg is from ingame
    });

    // NY (i literally forgot what that stands for but these always hide soooo)
    const ny = document.querySelectorAll('.STATE-GAME-NY');
    ny.forEach(element => {
        element.style.display = "none";
    });

    const ny2 = document.querySelectorAll('.STATE-TITLE-NY');
    ny2.forEach(element => {
        element.style.display = "none";
    });

    // Specialized state code
    if (statef == "game") {
        switchPageType("nor") }
    else if (statef == "endings-ft" || statef == "endings-fg") {
        loadEndingsList(); }
    else {
        page = "aaa"; }
}
///
///
switchState("title");

//* TITLE STATE
let saveManagerOpen = true;

function errorfunc(e, d) { // Function for errors
    // e is the error, d is what it was doing at the time.
    console.error(d, e);
    alert("An uexpected error has occured! It is advised to refresh the page.")
}

//* WORK WITH SAVE DATA
console.log("Checking if the user has saved data...");
if (localStorage.getItem("save_exists") !== null) {
    console.log("Saved data was found!");
} else {
    console.log("There is no existing save data.");
    console.log("Save data will be created.");
    console.log("Fetching misc/savetemp.json...");
    
    fetch('misc/savetemp.json')  // Get JSON file from the site directory
    .then(response => {
        if (!response.ok) {
            throw new Error(`An HTTP error occured. Status: ${response.status}`);
        }
        return response.json();  // Parse JSON content
    })
    .then(data => {
        console.log("Storing save data in local storage...");
        localStorage.setItem("save", JSON.stringify(data));  // Store save data
        localStorage.setItem("save_exists", "true"); // Set flag so it doesn't reset
        localStorage.setItem("please", "dont delete these"); // Beg the user not to delete these keys
        console.log("Created save data.");
        document.getElementById('welcome').style.display = "block";
    })
    .catch(error => errorfunc(error, 'Loading JSON file'));  // Handle errors
}

//* GET SAVE DATA
let savedata;
try {
    const rawSave = localStorage.getItem('save');
    savedata = JSON.parse(rawSave);
} catch (e) {
    errorfunc(e, 'Fetching save data')
}

function toggleSaveMan() { //* Function to open save manager
    saveManagerOpen = !saveManagerOpen;
    const saveManagerElements = document.querySelectorAll('.saveman');
    saveManagerElements.forEach(element => {
        element.style.display = saveManagerOpen ? "block" : "none";
    });
}

toggleSaveMan();

//* See if there is a specified page
const queries = window.location.search;
const urlparams = new URLSearchParams(queries);
if (urlparams.has('stage')) {
    switchState(urlparams.get('stage'));
} else if (urlparams.has('page')) {
    switchState('game');
    page = urlparams.get('page')
} else if (urlparams.has('r') && urlparams.get('r') == 'sv') {
    let yn = confirm("You appended ?r=sv to your URL. That will delete your save. Are you sure you want this?");
    if (yn) {
        localStorage.removeItem('save');
        localStorage.removeItem('save_exists');
        localStorage.removeItem('please');    
        alert("Save cleared.")
    } else {
        alert("Save not cleared.")
    }
}

function downloadSave() { //* Function to download save file
    const raw = localStorage.getItem("save");
    let data;
    try {
        data = JSON.stringify(JSON.parse(raw), null, 2); // pretty print JSON
    } catch (e) {
        data = raw; // fallback to raw data if it's not JSON
    }
    if (data) {
        const blob = new Blob([data], { type: "text/plain" }); 
        const url = URL.createObjectURL(blob);

        // Create a temporary link element
        const a = document.createElement("a");
        a.href = url;
        a.download = "save.json";

        // Append, click, and remove the link
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up the blob URL
        URL.revokeObjectURL(url);
    } else {
        console.error("Error: 'save' does not exist in storage. How does that even happen?")
    }
}

function importSave() { //* Function to import a save file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result); 
                // Ensure keys exist
                // Only a few keys so the code isn't large
                if ("file-ver" in data && "settings" in data && "endings" in data) {
                    localStorage.setItem("save", JSON.stringify(data));
                } else {
                    alert("That is not a valid save!")
                }
            } catch (err) {
                console.error("Error parsing JSON:", err);
            }
        };
        reader.readAsText(file);
    };

    input.click(); // Open the file dialog
}

//* GAME STATE
function errorfunc(e, d) { // Function for errors
    // e is the error, d is what it was doing at the time.
    console.error(d, e);
    alert("An uexpected error has occured! It is advised to refresh the page.")
}

function unlockEnding(pg) {
    savedata.endings[pg] = true;
    localStorage.setItem("save", JSON.stringify(savedata));  // Update save data
    console.log("Save data updated.")
}

function switchPageType(typ) { // Function to toggle between ending and regular screens
    const gone = document.querySelectorAll('.nor');
    gone.forEach(element => {
        element.style.display = typ == "nor" ? "block" : "none";
    });
    const gtwo = document.querySelectorAll('.end');
    gtwo.forEach(element => {
        element.style.display = typ == "end" ? "block" : "none";
    });
    if (typ == "end") {
        unlockEnding(lpage);
    }
}

let lpage;

function updateTxt(typ, v1, v2, v3, v4, v5) { // Update on-screen text
    if (typ == "nor") {
        document.getElementById("mtx").textContent = v1; // Update the main text
        document.getElementById("one-op").textContent = v2; // Update the option one text
        document.getElementById("two-op").textContent = v3; // Update the option two text
        document.getElementById("thr-op").textContent = v4; // Update the option three (thr) text
        document.getElementById("fou-op").textContent = v5; } // Update the option four (fou) text
    else {
        document.getElementById("emtx").textContent = v1; // Update the main text
        document.getElementById("edsc").innerHTML = v2 + "<br>Unlocked " + v3 + " Ending!";
    }
}

function loadData() { // Update the current text and events
    if (state == "game") {
        if (page === lpage) return; 
        lpage = page;

        fetch(`content/${page}.json`)  // Get JSON
        .then(response => response.json())  // Parse the JSON content
        .then(data => {
            jsonData = data;  // Store the JSON content in the variable
            let p1 = page[0];
            if (p1 == "!") {
                switchPageType("end")
                updateTxt("end", jsonData.title, jsonData.desc, jsonData.dispname, jsonData.invoke, ""); } // Update the text after data is loaded
            else {
                updateTxt("nor", jsonData.mt, jsonData.opts.a.desc, jsonData.opts.b.desc, jsonData.opts.c.desc, jsonData.opts.d.desc); } // Update the text after data is loaded
        })
        .catch(error => errorfunc(error, 'Loading JSON file'));  // Error handling
    }
}
setInterval(loadData, 30); // Trigger the update every 30ms

function newpage(opt) { // Switch pages
    fetch(`content/${page}.json`)  // Get JSON
    .then(response => response.json())  // Parse the JSON content
    .then(data => {
        jsonData = data;  // Store the JSON content in the variable
        if (opt in jsonData.opts) {
            page = jsonData.opts[opt].result }
        else {
            alert("That isn't an option!") }
    })
    .catch(error => errorfunc(error, 'Loading JSON file'));  // Error handling
}

function prevpage() { // Go to the last page
    if (page == "aaa")
    {
        switchState("title")
    } 
    else {
        fetch(`content/${page}.json`)  // Get JSON
        .then(response => response.json())  // Parse the JSON content
        .then(data => {
            jsonData = data;  // Store the JSON content in the variable
            page = data.prev
        })
        .catch(error => console.error('Error loading JSON:', error)); } // Error handling
}

function fpage() { // Go back to the first page
    page = "aaa";
    switchPageType("nor")
    loadData();
}

function endingsfg() {
    fpage()
    switchState('endings-fg')
}

///
///

//* ENDINGS STATE
function loadEndingsList() {
    fetch('misc/endings.json')  // Get JSON file from the site directory
    .then(response => {
        if (!response.ok) {
            throw new Error(`An HTTP error has occured. Status: ${response.status}`);
        }
        return response.json();  // Parse JSON content
    })
    .then(data => {
        console.log("Endings data:", data); // 🪵
        showEndingsContent(data);
    })
    .catch(error => errorfunc(error, 'Loading JSON file'));  // Handle errors
}

function showEndingsContent(data) {
    const endlist = document.getElementById("checklist");
    endlist.innerHTML = ""; // Clear content
    Object.values(data).forEach((item, index) => {
    const container = document.createElement("div");

    const img = document.createElement("img");
    img.src = savedata.endings[item.int]
        ? "assets/endings/check.png"
        : "assets/endings/uncheck.png";
    img.className = "checkbox";

    const text = document.createElement("span");
    text.textContent = item.ext;
    text.style.marginLeft = "8px";
    text.className = "checkboxtxt"

    container.appendChild(img);
    container.appendChild(text);
    checklist.appendChild(container);
});}

function endingBack() {
    if (state == "endings-ft") {
        switchState("title")
    } else if (state == "endings-fg") {
        switchState("game")
    }
}

//? Make this exist (maybe?)
// let srchShowing = true; // Track whether srch is showing
// 
// function showSearch() {
//     const srchi = document.getElementById('srch');
//     srchShowing = !srchShowing; // Toggle the visibility state
//     const srche = document.querySelectorAll('.srch');
//     srche.forEach(element => {
//         element.style.display = srchShowing ? "block" : "none";
//     });
// 
//     if (srchShowing) {
//         srchi.focus();
//     } else {
//         const inp = srchi.value.trim(); // Get the trimmed value from the input field
//         if (inp) {
//             if (inp != "!c") {
//             page = inp; } // Update the current page with what the user inputted
//         }
//         srchi.value = ''; // Clear the input
//     }
// }
// 
// showSearch