var allBanditParams;
var currBanditParams;
var trialIndex = 0;
var stageIndex = 0;
var nTrials = 3;
var nStages = 3; // should be 5 in the main experiment
var nActions = 3;
var numTeachers = 5;

// CSS classes
var buttonClasses = "btn btn-primary action ml-2 ml-2";
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
    $(".main_div").append(`<table id="stage-${stageIndex}-table" width="320" class="${tableClasses}" border="1"><tr><th onclick="sortTable()">Rank</th><th onclick="sortTable()"> Score</th><th> Actions </th></tr></table>`);
    loadTableData(data);
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
              if (actionsRevealed == numTeachers) {
                renderStage();
              }
            }
          }
        };
    }
  }
};

const data = [
  { rank: "1", score: "25", actions: "2, 3, 4"},
  { rank: "2", score: "23", actions: "1, 1, 1"},
  { rank: "3", score: "21", actions: "2, 3, 2"},
  { rank: "4", score: "19", actions: "1, 2, 2"},
  { rank: "5", score: "18", actions: "1, 2, 2"},
  { rank: "6", score: "17", actions: "1, 2, 2"},
  { rank: "7", score: "16", actions: "1, 2, 2"},
  { rank: "8", score: "15", actions: "1, 2, 2"},
  { rank: "9", score: "14", actions: "1, 2, 2"},
  { rank: "10", score: "12", actions: "1, 2, 2"},
];

function tableText(tableCell) {
    if (tableCell.innerHTML === "---") {
      // var currBanditDict = JSON.parse(currBanditParams);
      rank = tableCell.closest('tr').rowIndex
      tableCell.innerHTML = currBanditParams[10][rank - 1]["actions"]
      tableCell.style.color = "red";
      return true
    }
    return false
}

function loadTableData(items) {
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
  $(".main_div").append("<p>Experiment complete!</p>")
  setTimeout(function() { dallinger.goToPage('questionnaire'); }, 3000);
}
