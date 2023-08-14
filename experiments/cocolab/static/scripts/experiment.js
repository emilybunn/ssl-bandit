var allBanditParams;
var currBanditParams;
var trialIndex = 0;
var stageIndex = 0;
var nTrials = 3;
var nStages = 3; // should be 5 in the main experiment
var nActions = 3;

// CSS classes
var buttonClasses = "btn btn-primary action ml-2 ml-2";
var stageClasses = "d-flex flex-column justify-content-center text-center mt-3";
var trialClasses = "row justify-content-center";

var create_agent = function() {
  dallinger.createAgent()
    .done(function (resp) {
      my_node_id = resp.node.id;
      get_info();
    })
    .fail(function (rejection) {
      // A 403 is our signal that it's time to go to the questionnaire
      if (rejection.status === 403) {
        dallinger.allowExit();
        dallinger.goToPage('questionnaire');
      } else {
        dallinger.error(rejection);
      }
    });
}

var get_info = function() {
  dallinger.getExperimentProperty("all_bandit_params")
    .done(function (resp) {
      allBanditParams = resp.all_bandit_params;
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
  currBanditParams = allBanditParams[trialIndex - 1];
  $(".main_div").html("");
  if (trialIndex <= nTrials) {
    $(".main_div").append(`<h1 class="${trialClasses}" id="trial-${trialIndex}-label">Trial ${trialIndex}</h1>`);
    renderStage();
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
    var reward = Math.random() < bandit_arms[actionNum]["p_reward"] ? bandit_arms[actionNum]["reward_amount"] : 0;
    $(`#stage-${stageIndex}-reward`).html(reward);
    $(`#stage-${stageIndex}-result`).show();
    nextStage();
  }
  return takeAction;
}

var endExperiment = function() {
  $(".main_div").append("<p>Experiment complete!</p>")
  setTimeout(function() { dallinger.goToPage('questionnaire'); }, 3000);
}
