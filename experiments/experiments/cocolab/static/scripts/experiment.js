var banditParams;
var teacherData;
var currBanditParams;
var currTeacherData;
var numTeachers;
var trialTeachersChosen;
var trialArmsPulled;
var trialRewardsGotten;
var actionsRevealed;
var trialIndex = 0;
var stageIndex = 0;
var data_log = [];
var nTrials = 3;
var nStages = 5; // should be 5 in the main experiment
var nActions = 3;
var actionsRevealed = 0;
var teachersToLearnFrom = 5;
var trialInfo = {
  1: {
    'teachersChosen': [],
    'armsPulled': [],
    'rewardsGotten': []
  },
  2: {
    'teachersChosen': [],
    'armsPulled': [],
    'rewardsGotten': []
  },
  3: {
    'teachersChosen': [],
    'armsPulled': [],
    'rewardsGotten': []
  }
}

var trialLocations = ['Rainforest', 'Beach', 'Mountains'];
var stageLocations = ['North', 'East', 'West'];
var trialSpecies = ['Blue-and-Yellow Macaw', 'Albatross', 'Elegant Trogon']
var trialMessages;

// CSS classes
var buttonClasses = "btn btn-primary action ml-2 ml-2";
var instructionClasses = "d-flex flex-column mt-3";
var stageClasses = "d-flex flex-column justify-content-center text-center mt-3";
var trialClasses = "row justify-content-center";
var tableClasses = "w3-table w3-border w3-bordered w3-centered";
var tableContainerClasses = "position-fixed"
var tableContainerStyles = "overflow-y: auto;overflow-x: hidden;"

var create_agent = function() {
  dallinger.createAgent()
    .done(function (resp) {
      my_node_id = resp.node.id;
      console.log("Created agent: " + my_node_id);
      get_info();
    })
    .fail(function (rejection) {
      // A 403 is our signal that it's time to go to the questionnaire
      console.log("Failed to create agent.")
      if (rejection.status === 403) {
        dallinger.allowExit();
        // dallinger.goToPage('questionnaire');
      } else {
        dallinger.error(rejection);
      }
    });
}

var get_info = function() {
  console.log("Getting info");
  dallinger.getReceivedInfos(my_node_id)
    .done(function (resp) {
      contents = JSON.parse(resp.infos[0].contents);
      banditParams = contents["params"];
      teacherData = contents["teacher_data"];
      newTrial();
    })
    .fail(function (rejection) {
      console.log(rejection);
      $('body').html(rejection.html);
    });
}

function log_data(data){
	data["event_time"] = Date.now()
	console.log(data)
	data_log.push(data)
}

nextStage = function() {
  stageIndex++;
  if (stageIndex > nStages) {
    setTimeout(newTrial, 3000);
  } else {
    renderStage();
  }
}

newTrial = function() {
  // reset the game
  trialIndex++;
  stageIndex = 1;
  $(".main_div").html("");
  if (trialIndex <= nTrials) {
    currBanditParams = banditParams[trialIndex];
    currTeacherData = teacherData[trialIndex]["data"];
    numTeachers = teacherData[trialIndex]["n"];
    trialMessages = [`You didn't see any birds today. :(`, `You saw one ${trialSpecies[trialIndex - 1]}.`, `You saw a whole flock of ${trialSpecies[trialIndex - 1]}!`];
    // window.alert(trialIndex)
    // window.alert(JSON.stringify(banditParams));
    // window.alert(JSON.stringify(teacherData));
    // window.alert(JSON.stringify(currBanditParams))
    // window.alert(JSON.stringify(currTeacherData))
    // window.alert(JSON.stringify(numTeachers));
    trialTeachersChosen = [];
    trialArmsPulled = [];
    trialRewardsGotten = [];
    $(".main_div").append(`<div class="${instructionClasses}" id="trial-${trialIndex}-instructions"></div>`);
    $(`#trial-${trialIndex}-instructions`).append(`<h1>Bird Watching, Trip ${trialIndex} in the ${trialLocations[trialIndex - 1]}.</h1>`);
    $(`#trial-${trialIndex}-instructions`).append(`<p>You are in a ${trialLocations[trialIndex - 1]}, trying to take catch a cool photo of the rare ${trialSpecies[trialIndex - 1]}. You are here for five days, trying to choose between three locations: ${stageLocations}. </p>`);
    $(`#trial-${trialIndex}-instructions`).append(`<p>Each spot in the ${trialLocations[trialIndex - 1]} has a variable chance of spotting a bird, with some locations having more rare and desirable features. The prevalence of birds doesn’t change day by day.</p>`);
    $(`#trial-${trialIndex}-instructions`).append(`<p>There are ${numTeachers} expert birdwatchers who've spent a lot of time in this region before. You must choose a total of ${teachersToLearnFrom} birdwatchers location choices to help you make your decision. You can click on <span style="color: blue">Rank</span> or <span style="color: blue">Score</span> to sort the table in increasing/decreasing order.</p>`);
    $(`#trial-${trialIndex}-instructions`).append(`<p id="trial-${trialIndex}-tracker">You have chosen to learn from ${actionsRevealed} birdwatchers, please choose ${teachersToLearnFrom - actionsRevealed} more.</p>`);
    $(".main_div").append(`<div class="tableContainer ${tableContainerClasses}" style="${tableContainerStyles}"><table id="stage-${stageIndex}-table" width="320" class="${tableClasses}" border="1"><tr><th onclick="sortTable()"style="color: blue">Rank</th><th onclick="sortTable()"style="color: blue"> Score</th><th> Locations </th></tr></table></div>`);
    loadTableData();
    revealActions();
    $(".tableContainer").css("max-height", `${window.innerHeight - 25 - $(".tableContainer").offset().top}px`);
    $(".main_div").append(`<h1 class="${trialClasses}" id="trial-${trialIndex}-label">Trial ${trialIndex}</h1>`);
  } else {
    endExperiment();
  }
}

renderStage = function() {
  $(".main_div").append(`<div class="${stageClasses}" id="stage-${stageIndex}"></div>`);
  $(`#stage-${stageIndex}`).append(`<h2>Day ${stageIndex}</p>`);
  $(`#stage-${stageIndex}`).append(`<div id="stage-${stageIndex}-actions"></div>`);
  $(`#stage-${stageIndex}-actions`).append(`<p>Choose a birdwatching location!</p>`);
  for (var i = 1; i <= nActions; i++) {
    $(`#stage-${stageIndex}-actions`).append(`<button type="button" class="${buttonClasses}" id="stage-${stageIndex}-action-${i}">${stageLocations[i - 1]}</button>`);
    $(`#stage-${stageIndex}-action-${i}`).click(makeActionFn(stageIndex, i))
  }
  trialInfo[trialIndex]["armsPulled"] = trialArmsPulled;
  trialInfo[trialIndex]["rewardsGotten"] = trialRewardsGotten;
  $(`#stage-${stageIndex}`).append(`<div class="result" id="stage-${stageIndex}-result" style="display: none; color: blue; font-size: 160%; "><strong>Reward: <span id="stage-${stageIndex}-reward"></span></strong></div>`);
  $(`#stage-${stageIndex}`).append(`<div class="result" id="stage-${stageIndex}-message" style="display: none; color: blue; font-size: 100%; "><span id="stage-${stageIndex}-message"></span></div>`);
}

var makeActionFn = function(stageIndex, actionNum) {
  var takeAction = function() {
    // disable the actions
    for (var i = 1; i <= nActions; i++) {
      if (i != actionNum) {
        $(`#stage-${stageIndex}-action-${i}`).addClass("disabled");
      }
      $(`#stage-${stageIndex}-action-${i}`).prop("onclick", null).off("click");
    }
    // compute and display the reward
    var rewardIdx = Math.random() < currBanditParams[actionNum]["p_reward"] ? Math.round(Math.random()) : -1;
    var reward = rewardIdx < 0 ? 0 : currBanditParams[actionNum]["reward_amount"][rewardIdx]
    trialArmsPulled.push(actionNum);
    trialRewardsGotten.push(reward);
    log_data({"event_type": "Arm Chosen", "event_info": {trialIndex, actionNum, reward}})
    $(`#stage-${stageIndex}-reward`).html(reward);
    $(`#stage-${stageIndex}-result`).show();
    $(`#stage-${stageIndex}-message`).html(trialMessages[rewardIdx + 1]);
    $(`#stage-${stageIndex}-message`).show();
    nextStage();
  }
  return takeAction;
}

function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById(`stage-${stageIndex}-table`);
  switching = true;
  dir = "asc";
  while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
          shouldSwitch = false;
          x = rows[i].getElementsByTagName("TD")[0];
          y = rows[i + 1].getElementsByTagName("TD")[0];
          if (dir == "asc") {
              if (Number(x.innerHTML) > Number(y.innerHTML)) {
                  shouldSwitch = true;
                  break;
              }
          } else if (dir == "desc") {
              if (Number(x.innerHTML) < Number(y.innerHTML)) {
                  shouldSwitch = true;
                  break;
              }
          }
      }
      if (shouldSwitch) {
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
          switchcount ++;
      } else {
          if (switchcount == 0 && dir == "asc") {
              dir = "desc";
              switching = true;
          }
      }
  }
};

function revealActions() {
  var table = document.getElementById(`stage-${stageIndex}-table`)
  var actionsRevealed = 0;
  if (table != null) {
    for (var i = 1; i < table.rows.length; i++) {
        table.rows[i].cells[2].onclick = function () {
          if (actionsRevealed < teachersToLearnFrom) {
            if (tableText(this)) {
              actionsRevealed++
              var teacherTracker = document.getElementById(`trial-${trialIndex}-tracker`);
              if (actionsRevealed == teachersToLearnFrom) {
                teacherTracker.innerHTML = `You have chosen all ${actionsRevealed} teachers, please begin the task.`;
                trialInfo[trialIndex]["teachersChosen"] = trialTeachersChosen;
                renderStage();
              } else {
                teacherTracker.innerHTML = `You have chosen ${actionsRevealed} teachers, please choose ${teachersToLearnFrom - actionsRevealed} more.`;
              }
            }
          }
        };
    }
  }
};

function tableText(tableCell) {
    if (tableCell.innerHTML === "---") {
      rank = tableCell.closest('tr').rowIndex
      trialTeachersChosen.push(rank);
      var actions = currTeacherData[rank - 1]["actions"]
      tableCell.innerHTML = [`${stageLocations[actions[0]]}`, `${stageLocations[actions[1]]}`, `${stageLocations[actions[2]]}`]
      tableCell.style.color = "red";
      log_data({"event_type": "Teacher Chosen", "event_info": {trialIndex, rank}})
      return true
    }
    return false
}

function loadTableData() {
  const table = document.getElementById(`stage-${stageIndex}-table`);
  currTeacherData.forEach( item => {
    let row = table.insertRow();
    let rank = row.insertCell(0);
    rank.innerHTML = item["rank"];
    let score = row.insertCell(1);
    score.innerHTML = item["score"];
    let actions = row.insertCell(2);
    actions.innerHTML = "---";
  });
}

var endExperiment = function() {
  dallinger.createInfo(my_node_id, {
    contents: JSON.stringify(data_log), 
    info_type: 'Info'
  });
  dallinger.createInfo(my_node_id, {
    contents: JSON.stringify(trialInfo), 
    info_type: 'Info'
  });
  $(".main_div").append("<p>Experiment complete!</p>")
  setTimeout(function() { dallinger.goToPage('questionnaire'); }, 3000);
}