$(function(){
	var user = $("html").attr("data-username");
	var accessToken = $("html").attr("data-access-token");

    function _request(path, data, accessToken, cb) {
      $.ajax({
        type: 'post',
        url: 'https://api.github.com' + path,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded',
        success: function(res) { cb(null, res); },
        error: function(err) { cb(err); },
        headers : { Authorization: 'token '+ accessToken, Accept: 'application/vnd.github.raw' }
      });
    }

	var issueTitle = 'xxx';
	// $("#poll-name").val();
	var pollData = {"title": issueTitle};

	_request('/repos/' + user + '/githubpoll/issues?access_token=' + accessToken, pollData, accessToken, function(data) {
		console.log(data);
	});

	// $.post('https://api.github.com/repos/' + user + '/githubpoll/issues?access_token=' + accessToken, pollData, function(data) {
	//   console.log(data);
	// });
});