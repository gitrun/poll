$(function(){

// LOGIN
  function checkIfUserLoggedIn() {
    var userInfo = getLocalStorageData("lsUserInfo"); //----- lsUserInfo - localStorage user (name of string in LS)
    if (userInfo == undefined) {
      if (gp.user.username == "guest") {
        return "guest";
      }
      else {
        localStorage.setItem("lsUserInfo", JSON.stringify(gp.user));

        mixpanel.track("User Logged-In");
      }
    } else {
      gp.user = userInfo;
    }
  }

	var userReposContainer = $('#user-repos-select');
	function showUserRepos() {
		$.getJSON("https://api.github.com/user/repos?access_token=" + gp.user.accessToken, function(userRepos){
			var html = "";

			var m = 0;
      for (; m < userRepos.length; m++) {
      	html += "<option>" + userRepos[m].full_name + "</option>";
      }
      userReposContainer.append(html);
    });

    $.getJSON("https://api.github.com/user/orgs?access_token=" + gp.user.accessToken, function(userOrgs){
    	var userOrgsArray = [];

    	var i = 0;
      for (; i < userOrgs.length; i++) {
      	userOrgsArray.push(userOrgs[i].login);
      }
    	
    	var k = 0;
      for (; k < userOrgsArray.length; k++) {
      	$.getJSON("https://api.github.com/orgs/" + userOrgsArray[k] + "/repos?access_token=" + gp.user.accessToken, function(orgRepos){
      		var html ="";

      		var l = 0;
		      for (; l < orgRepos.length; l++) {
		      	html += "<option>" + orgRepos[l].full_name + "</option>";
		      }
		      userReposContainer.append(html);
      	});
      }
    });
	}

  $("#create-issue-button").on("click", function() {
    var issueTitle = $("#issue-title").val();
    var issueDescription = $("#issue-description").val();
    var issueRepoFullname = $("#user-repos-select").val();
    var issueMandatoryVoter = $("#mandatory-voter").val();
    var issueLabel = $("issue-label").val();

    var issueData = {"title": issueTitle};

    $.post('https://api.github.com/repos/' + issueRepoFullname + '/issues?access_token=' + gp.user.accessToken, JSON.stringify(issueData), function(data) {
      console.log(data);
    });

    mixpanel.track("Poll Created");
  });

  function logOutUser() {
    localStorage.clear();
    page('/logout');
  }

  $("#logout").on("click", logOutUser);

  // POLL PAGE

  function buildPollPage(repoFullName, number, urlIssue, urlComments){
    $.getJSON(urlIssue, function(issueData){
      var pollTitleContainer = $('#poll-title');
      var pollDescriptionContainer = $("#poll-description");

      pollTitleContainer.html(issueData.title);
      var issueDescriptionStringsArray = issueData.body.split("\n");
      var html = "";
      var i = 0;
      for (; i < issueDescriptionStringsArray.length; i++) {
        html += "<p>" + issueDescriptionStringsArray[i] + "</p>"
      }
      pollDescriptionContainer.html(html);
    });
    $.getJSON(urlComments, function(issueCommentsData){
      var issueCommentsContainer = $('#issue-comments');

      var yesArray = [];
      var noArray = [];

      var i = 0;
      for (; i < issueCommentsData.length; i++) {
        if (_.str.include(issueCommentsData[i].body, "+1")) {
          yesArray.push('+1');
        } else if (_.str.include(issueCommentsData[i].body, "-1")) {
          noArray.push('-1');
        }
      }

      if ((yesArray.length == 0) && (noArray.length == 0)) {
        $("#no-results").removeClass("invisible").addClass("visible");
        $("#results").removeClass("visible").addClass("invisible");
        $("#vote-btns").removeClass("invisible").addClass("visible");
      } else {
        updatePollResultsView(yesArray, noArray);
      }

      var yesCommentBody = {"body": "+1"};
      var noCommentBody = {"body": "-1"};

      $('#vote-btns').on('click', 'button', function() {
        if ($(this).attr('id') == 'yes-btn') {
          $.post('https://api.github.com/repos/' + repoFullName + '/issues/' + number + '/comments?access_token=' + gp.user.accessToken, JSON.stringify(yesCommentBody));
          
          yesArray.push('+1');
          updatePollResultsView(yesArray, noArray);

          mixpanel.track("Voted +1");
        } else if ($(this).attr('id') == 'no-btn') {
          $.post('https://api.github.com/repos/' + repoFullName + '/issues/' + number + '/comments?access_token=' + gp.user.accessToken, JSON.stringify(noCommentBody));
          
          noArray.push('-1');
          updatePollResultsView(yesArray, noArray);

          mixpanel.track("Voted -1");
        }
      });

    });
  }

  // COMMON FUNCTIONS

  function getLocalStorageData(key) {
    var key = localStorage.getItem(key);
    if (key == undefined) {
      return undefined;
    } else {
      return JSON.parse(key);
    }
  }

  function showPage(pagename, functionDeclaration) {
    $(".page.visible").removeClass('visible').addClass('invisible');

    $("#" + pagename).removeClass('invisible').addClass('visible');

    if (functionDeclaration) {
      functionDeclaration();
    }
  }

  function updatePollResultsView(yesArray, noArray) {
    var yesContainer = $('#yes span');
    var noContainer = $('#no span');

    yesContainer.text(yesArray.length);
    noContainer.text(noArray.length);

    var data = [{ key : "Poll Results",
                  values : [{"label": "yes", "value": yesArray.length}, 
                            {"label": "no", "value": noArray.length}]
                }];

    pie(data, "#pie-chart");
  }

  // ROUTER

  page('/:user/:repoName/:number', function(ctx){
    var repoFullName = ctx.params.user + "/" + ctx.params.repoName;
    var number = ctx.params.number;

    if (checkIfUserLoggedIn() == 'guest') {
      $("#login").removeClass("invisible").addClass("visible");

      var urlIssue = "https://api.github.com/repos/" + repoFullName + "/issues/" + number;
      var urlComments = "https://api.github.com/repos/" + repoFullName + "/issues/" + number + "/comments";

      $("#vote-btns").removeClass("visible").addClass("invisible");
    } else {
      $("#login").removeClass("visible").addClass("invisible");
      $("#user-info").removeClass("invisible").addClass("visible");
      $("#user-info img").attr("src", gp.user.avatar);
      $("#username").attr("href", gp.user.profileUrl).text(gp.user.username);

      var urlIssue = "https://api.github.com/repos/" + repoFullName + "/issues/" + number + "?access_token=" + gp.user.accessToken;
      var urlComments = "https://api.github.com/repos/" + repoFullName + "/issues/" + number + "/comments?access_token=" + gp.user.accessToken;

      $("#vote-btns").removeClass("invisible").addClass("visible");
    }

    showPage("poll-page", function(){
      buildPollPage(repoFullName, number, urlIssue, urlComments);
    });
    mixpanel.track("Poll Page Loaded");
  });

  page('', function(){
    if (checkIfUserLoggedIn() == 'guest') {
      $("#login").removeClass("invisible").addClass("visible");
    } else {
      $("#login").removeClass("visible").addClass("invisible");
      $("#user-info").removeClass("invisible").addClass("visible");
      $("#user-info img").attr("src", gp.user.avatar);
      $("#username").attr("href", gp.user.profileUrl).text(gp.user.username);

      showPage("create-poll-page", showUserRepos);
      mixpanel.track("Create Poll Page Loaded");
    }
  });

  page.start({ click: false });
  
});