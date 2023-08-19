var allBanditParams;
var currBanditParams;
var trialTeachersChosen;
var trialArmsPulled;
var trialRewardsGotten;
var actionsRevealed = 0;
var trialIndex = 0;
var stageIndex = 0;
var nTrials = 3;
var nStages = 3; // should be 5 in the main experiment
var nActions = 3;
var numTeachers = 5;
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

const instructions = `There are ${numTeachers} teachers to learn from. You can choose a total of ${teachersToLearnFrom} teachers' actions to reveal.`

// CSS classes
var buttonClasses = "btn btn-primary action ml-2 ml-2";
var instructionClasses = "d-flex flex-column mt-3";
var stageClasses = "d-flex flex-column justify-content-center text-center mt-3";
var trialClasses = "row justify-content-center";
var tableClasses = "position-fixed w3-table w3-border w3-bordered w3-centered";

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
      currBanditParams = JSON.parse(resp.infos[0].contents);
      newTrial();
    })
    .fail(function (rejection) {
      console.log(rejection);
      $('body').html(rejection.html);
    });
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
    trialTeachersChosen = [];
    trialArmsPulled = [];
    trialRewardsGotten = [];
    $(".main_div").append(`<div class="${instructionClasses}" id="trial-${trialIndex}-instructions"></div>`);
    $(`#trial-${trialIndex}-instructions`).append(`<h1>Learn from people.</h1>`);
    $(`#trial-${trialIndex}-instructions`).append(`<p>${instructions}</p>`);
    $(`#trial-${trialIndex}-instructions`).append(`<p id="trial-${trialIndex}-tracker">You have chosen ${actionsRevealed} teachers, please choose ${teachersToLearnFrom - actionsRevealed} more.</p>`);
    $(".main_div").append(`<table id="stage-${stageIndex}-table" width="320" class="${tableClasses}" border="1"><tr><th onclick="sortTable()">Rank</th><th onclick="sortTable()"> Score</th><th> Actions </th></tr></table>`);
    loadTableData();
    revealActions();
    $(".main_div").append(`<h1 class="${trialClasses}" id="trial-${trialIndex}-label">Trial ${trialIndex}</h1>`);
  } else {
    endExperiment();
  }
}

renderStage = function() {
  $(".main_div").append(`<div class="${stageClasses}" id="stage-${stageIndex}"></div>`);
  $(`#stage-${stageIndex}`).append(`<h2>Stage ${stageIndex}</p>`);
  $(`#stage-${stageIndex}`).append(`<div id="stage-${stageIndex}-actions"></div>`);
  $(`#stage-${stageIndex}-actions`).append(`<p>Choose an action:</p>`);
  for (var i = 1; i <= nActions; i++) {
    $(`#stage-${stageIndex}-actions`).append(`<button type="button" class="${buttonClasses}" id="stage-${stageIndex}-action-${i}">Action ${i}</button>`);
    $(`#stage-${stageIndex}-action-${i}`).click(makeActionFn(stageIndex, i))
  }
  trialInfo[trialIndex]["armsPulled"] = trialArmsPulled;
  trialInfo[trialIndex]["rewardsGotten"] = trialRewardsGotten;
  $(`#stage-${stageIndex}`).append(`<div class="result" id="stage-${stageIndex}-result" style="display: none;">Reward: <span id="stage-${stageIndex}-reward"></span></div>`);
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
    // var currBanditDict = JSON.parse(currBanditParams);
    var reward = Math.random() < currBanditParams[actionNum]["p_reward"] ? currBanditParams[actionNum]["reward_amount"] : 0;
    trialArmsPulled.push(actionNum);
    trialRewardsGotten.push(reward);
    $(`#stage-${stageIndex}-reward`).html(reward);
    $(`#stage-${stageIndex}-result`).show();
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
          if (actionsRevealed < numTeachers) {
            if (tableText(this)) {
              actionsRevealed++
              var teacherTracker = document.getElementById(`trial-${trialIndex}-tracker`);
              if (actionsRevealed == numTeachers) {
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
      // var currBanditDict = JSON.parse(currBanditParams);
      rank = tableCell.closest('tr').rowIndex
      trialTeachersChosen.push(rank);
      tableCell.innerHTML = currBanditParams[10][rank - 1]["actions"]
      tableCell.style.color = "red";
      return true
    }
    return false
}

function loadTableData() {
  const table = document.getElementById(`stage-${stageIndex}-table`);
  var numTeachers = 10
  currBanditParams[numTeachers].forEach( item => {
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
    contents: JSON.stringify(trialInfo),
    info_type: 'Info'
  });
  $(".main_div").append("<p>Experiment complete!</p>")
  setTimeout(function() { dallinger.goToPage('questionnaire'); }, 3000);
}
