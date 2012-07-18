$(function(){

// LOGIN

  var userInfo = getLocalStorageData("lsUserInfo"); //----- lsUserInfo - localStorage user (name of string in LS)
  if (userInfo == undefined) {
    if ($("html").attr("data-username") == "guest") {
      $("#login").removeClass("invisible").addClass("visible");
    }
    else {
      var user = $("html").attr("data-username");
      var accessToken = $("html").attr("data-access-token");

      var userInfo = {"username": user, "accessToken": accessToken};
      localStorage.setItem("lsUserInfo", JSON.stringify(userInfo));

      $("#login").removeClass("visible").addClass("invisible");
      $("#user-info").removeClass("invisible").addClass("visible");
      $("#username").html(user);
    }
  } else {
    var user = userInfo.username;       
    var accessToken = userInfo.accessToken;

    $("#login").removeClass("visible").addClass("invisible");
    $("#user-info").removeClass("invisible").addClass("visible");
    $("#username").html(user);
    $("#welcome").text('Welcome back');
  }

	var userReposContainer = $('#user-repos-select');
	function showUserRepos(){
		$.getJSON("https://api.github.com/user/repos?access_token=" + accessToken, function(userRepos){
			var html = "";

			var m = 0;
      for (; m < userRepos.length; m++) {
      	html += "<option>" + userRepos[m].full_name + "</option>";
      }
      userReposContainer.append(html);
    });

    $.getJSON("https://api.github.com/user/orgs?access_token=" + accessToken, function(userOrgs){
    	var userOrgsArray = [];

    	var i = 0;
      for (; i < userOrgs.length; i++) {
      	userOrgsArray.push(userOrgs[i].login);
      }
    	
    	var k = 0;
      for (; k < userOrgsArray.length; k++) {
      	$.getJSON("https://api.github.com/orgs/" + userOrgsArray[k] + "/repos?access_token=" + accessToken, function(orgRepos){
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

    $.post('https://api.github.com/repos/' + issueRepoFullname + '/issues?access_token=' + accessToken, JSON.stringify(issueData), function(data) {
      console.log(data);
    });
  });

  // POLL PAGE

  function buildPollPage(repoFullName, number){
    if (accessToken == undefined) {
      var urlIssue = "https://api.github.com/repos/" + repoFullName + "/issues/" + number;
      var urlComments = "https://api.github.com/repos/" + repoFullName + "/issues/" + number + "/comments";
    } else {
      var urlIssue = "https://api.github.com/repos/" + repoFullName + "/issues/" + number + "?access_token=" + accessToken;
      var urlComments = "https://api.github.com/repos/" + repoFullName + "/issues/" + number + "/comments?access_token=" + accessToken;
    }

    $.getJSON(urlIssue, function(issueData){
      var pollTitleContainer = $('#poll-title');
      var pollDescriptionContainer = $("#poll-description");

      pollTitleContainer.html(issueData.title);
      pollDescriptionContainer.html(issueData.body);
    });
    $.getJSON(urlComments, function(issueCommentsData){
      var yesContainer = $('#yes');
      var noContainer = $('#no');
      var issueCommentsContainer = $('#issue-comments');

      var yesArray = [];
      var noArray = [];

      var i = 0;
      for (; i < issueCommentsData.length; i++) {
        if (issueCommentsData[i].body == '+1') {
          console.log(issueCommentsData[i].body);
          yesArray.push('+1');
        } else if (issueCommentsData[i].body == '-1') {
          console.log(issueCommentsData[i].body);
          noArray.push('-1');
        }
      }

      yesContainer.append(yesArray.length);
      noContainer.append(noArray.length);

      var data = [{"label": "yes", "value": yesArray.length}, 
                  {"label": "no", "value": noArray.length}];
      pie(data);

      var yesCommentBody = {"body": "+1"};
      var noCommentBody = {"body": "-1"};

      $('#vote-btns').on('click', 'button', function() {
        if ($(this).attr('id') == 'yes-btn') {
          $.post('https://api.github.com/repos/' + repoFullName + '/issues/' + number + '/comments?access_token=' + accessToken, JSON.stringify(yesCommentBody));
        } else if ($(this).attr('id') == 'no-btn') {
          $.post('https://api.github.com/repos/' + repoFullName + '/issues/' + number + '/comments?access_token=' + accessToken, JSON.stringify(noCommentBody));
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

  // ROUTER

  page('/:user/:repoName/:number', function(ctx){
    var repoFullName = ctx.params.user + "/" + ctx.params.repoName;
    var number = ctx.params.number;

    showPage("poll-page", function(){
      buildPollPage(repoFullName, number);
    });
  });

  page('', function(){
    showPage("create-poll-page", showUserRepos);
  });
  page.start({ click: false });
});