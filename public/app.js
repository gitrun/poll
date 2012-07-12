$(function(){
	var user = $("html").attr("data-username");
	var accessToken = $("html").attr("data-access-token");

	var userReposContainer = $('select#user-repos');

	function showUserRepos(){
		$.getJSON("https://api.github.com/user/repos?access_token=" + accessToken, function(userRepos){
			var html;

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
      		var html;

      		var l = 0;
		      for (; l < orgRepos.length; l++) {
		      	html += "<option>" + orgRepos[l].full_name + "</option>";
		      }
		      userReposContainer.append(html);
      	});
      }
    });
	}
	showUserRepos();

	var issueTitle = 'xxx1';
	// $("#poll-name").val();
	var pollData = {"title": issueTitle};

	$.post('https://api.github.com/repos/' + user + '/githubpoll/issues?access_token=' + accessToken, JSON.stringify(pollData), function(data) {
	  console.log(data);
	});
});