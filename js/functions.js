var informationArray = [];
$( document ).ready(function() {
	function getUserTournaments(){
		var data = JSON.stringify({
			query: `
			query User($slug: String!) {
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
				if(typeof data.data !== 'undefined'){
					let userTournaments = data.data.user.tournaments.nodes;
					let tournamentContainer = $('.sgg-lite-user-tournaments');
					tournamentContainer.attr('data-tournament-list', JSON.stringify( userTournaments ) );
					$('.sgg-lite-tournament-listing-button').hide();
					for (var i = 0; i < 10; i++) {
						var tournamentID = userTournaments[i].id;
						var tournamentName = userTournaments[i].name;
						tournamentContainer.append('<div class="sgg-lite-tournament-container"><button class="sgg-lite-tournament" data-tournament-id="'+tournamentID+'">'+tournamentName+'</button></div>');
					}
				}else{
					$('.sgg-lite-tournament-listing-button').hide();
					alert("No Tournaments Found");
				}
			}
		});
	}

	$('.sgg-lite-tournament-listing-button').click(function(){
		getUserTournaments();
	});

	function showUserEvents(data = null){
		informationArray.userEvents = data.participant.events;
		console.log(informationArray);
		let tournamentID = informationArray.tourneyInfo.id;
		let tournamentButton = $("button[data-tournament-id='"+tournamentID+"']");
		tournamentButton.addClass('has-tourney-info');
		let tournamentContainer = tournamentButton.closest('.sgg-lite-tournament-container');
		for (const userEvent of informationArray.userEvents) {
			tournamentContainer.append('<div class="sgg-lite-tournament-event">'+userEvent.name+'</div>');
		}
		
	}

	function tournamentHandler(data = null){
		let tourneyInfo = { 
			id : data.tournament.id,
			endAt : data.tournament.endAt,
			startAt : data.tournament.startAt,
			numAttendees : data.tournament.numAttendees,
			participant : data.tournament.participants.nodes[0],
			rules : data.tournament.rules,
			state : data.tournament.state,
			url : "https://smash.gg" + data.tournament.url,
		}
		informationArray.tourneyInfo = tourneyInfo;
		var data = JSON.stringify({
			query: `
			query getParticipantEvents($id: ID!) {
				participant (id: $id){
					id
					events{
						id
						checkInBuffer
						checkInEnabled
						matchRulesMarkdown
						rulesMarkdown
						name
						numEntrants
						state
						phaseGroups{
							bracketType
							firstRoundTime
							numRounds
							startAt
							}
							standings(query: {
								page: 1,
								perPage: 500
							}){
							nodes{
								id
							}
						}
				  }
				  }
			  }
			`,
			variables: {"id": tourneyInfo.participant.id}
		});
		$.ajax({
			type: "POST",
			url: 'https://api.smash.gg/gql/alpha',
			data: data,
			contentType: "application/json;charset=utf-8",
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "Bearer 96b64a3ff60d5c4a70614105bc8d6f94");
			}, success: function(data){
				if(typeof data.data !== 'undefined'){
					showUserEvents(data.data);
				}else{
					alert("No Events Found");
				}
			}
		});


	}

	function getTournamentInfo( tournamentID = null ){
		if(tournamentID == null){
			return;
		}
		var data = JSON.stringify({
			query: `
			query getTournamentInfo($id: ID!) {
				tournament(id: $id){
					id
					numAttendees
					startAt
					endAt
					rules
					state
					url(tab: "", relative: true)
				  participants(query: {
					filter: {
					  gamerTag: "Matteo"
					}
				  }) {
					nodes {
					  id
					  gamerTag
					}
				  }
				}
			  }
			`,
			variables: {"id": tournamentID}
		});
		$.ajax({
			type: "POST",
			url: 'https://api.smash.gg/gql/alpha',
			data: data,
			contentType: "application/json;charset=utf-8",
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "Bearer 96b64a3ff60d5c4a70614105bc8d6f94")
			}, success: function(data){
				if(typeof data.data !== 'undefined'){
					tournamentHandler(data.data);
				}else{
					alert("Tournament Information Not Found");
				}
			}
		});
	}
	

	$( document ).on('click','.sgg-lite-tournament', function() {
		if(!$(this).hasClass('has-tourney-info')){
			let tournamentID = $(this).attr('data-tournament-id');
			getTournamentInfo(tournamentID);
		}else{
			alert('Tournament Information Already!');
		}

	});

});

//6279299
