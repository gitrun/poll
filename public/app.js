$(function(){
	var user = $("html").attr("data-username");
	var accessToken = $("html").attr("data-access-token");

	var issueTitle = 'xxx1';
	// $("#poll-name").val();
	var pollData = {"title": issueTitle};

	$.post('https://api.github.com/repos/' + user + '/githubpoll/issues?access_token=' + accessToken, JSON.stringify(pollData), function(data) {
	  console.log(data);
	});
});