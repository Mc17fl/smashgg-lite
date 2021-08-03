$( document ).ready(function() {

    $('#test-content').text('shit');
	var data = JSON.stringify({
		query: `query User($slug: String!) {
			user(slug: $slug){
			  tournaments (
				query: { 
				  filter: { 
					past:true,
					upcoming:true
				  } 
				}) 
			  {
				nodes {
				  id
				  name
				}
			  }
			}
		}
		`,
		variables: {"slug": "user/85b7dda7"}
	});
    $.ajax({
		type: "POST",
        url: 'https://api.smash.gg/gql/alpha',
		data: data,
		contentType: "application/json;charset=utf-8",
        beforeSend: function(xhr) {
             xhr.setRequestHeader("Authorization", "Bearer 96b64a3ff60d5c4a70614105bc8d6f94")
        }, success: function(data){
			// console.log(data.errors[0].message);

			console.log(data.data.user.tournaments.nodes);
            //process the JSON data etc
        }
})

});

//6279299
