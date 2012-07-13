$(function(){
  var userInfo = getLocalStorageData("lsUserInfo"); //----- lsUserInfo - localStorage user (name of string in LS)
  if (userInfo == undefined) {
    if ($("html").attr("data-username") == "guest") {
      $("#login-page").removeClass("invisible").addClass("visible");
    }
    else {
      var user = $("html").attr("data-username");
      var accessToken = $("html").attr("data-access-token");

      var userInfo = {"username": user, "accessToken": accessToken};
      localStorage.setItem("lsUserInfo", JSON.stringify(userInfo));

      $("#login-page").removeClass("visible").addClass("invisible");
      $("#user-info").removeClass("invisible").addClass("visible");
      $("#username").html(user);

      showPage("create-poll-page", showUserRepos);
    }
  } else {
    var user = userInfo.username;       
    var accessToken = userInfo.accessToken;

    $("#login-page").removeClass("visible").addClass("invisible");
    $("#user-info").removeClass("invisible").addClass("visible");
    $("#username").html(user);
    $("#welcome").text('Welcome back');

    showPage("create-poll-page", showUserRepos);
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

  // function showCreatePollPage() {
  //   $("#login-page").removeClass("visible").addClass("invisible");
  //   $("#create-poll-page").removeClass("invisible").addClass("visible");
    

  //   showUserRepos();
  // }

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

  function getLocalStorageData(key) {
    var key = localStorage.getItem(key);
    if (key == undefined) {
      return undefined;
    } else {
      return JSON.parse(key);
    }
  }

  function showPage(pagename, functionname) {
    $(".page.visible").removeClass('visible').addClass('invisible');

    $("#" + pagename).removeClass('invisible').addClass('visible');

    functionname();
  }

  // page('', function(){
  //   $('#login-form').removeClass('invisible').addClass('visible');
  //   $('#user-info').removeClass('visible').addClass('invisible');
  // });
  // page.start({ click: false });
});