var informationArray = [];
const months = ["January", "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"];
$( document ).ready(function() {
	function setUserObject(data){
		informationArray.gamerTag = data.data.user.player.gamerTag
	}

	function getUserTournaments( user_id = "" ){
		var data = JSON.stringify({
			query: `
			query User($slug: String!) {
				user(slug: $slug){
					player{
						gamerTag
					}
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
			variables: {"slug": "user/"+user_id}
		});
		$.ajax({
			type: "POST",
			url: 'https://api.smash.gg/gql/alpha',
			data: data,
			contentType: "application/json;charset=utf-8",
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "Bearer 96b64a3ff60d5c4a70614105bc8d6f94")
				let loading_wheel_detached = $('.sgg-lite-loading-wheel').detach();
				$(".sgg-lite-tournament-listing-button").after(loading_wheel_detached);
				loading_wheel_detached.removeClass('loading-wheel-hide');
			}, success: function(data){
				$('.sgg-lite-loading-wheel').addClass('loading-wheel-hide sgg-loading-wheel-centered');
				if(typeof data.data !== 'undefined' && data.data.user !== null){
					setUserObject(data);

					$('.sgg-lite-user-details-wrapper').slideUp();
					let userTournaments = data.data.user.tournaments.nodes;
					$('.sgg-lite-userid').hide();
					$('.sgg-lite-tournament-wrapper').show();
					for (var i = 0; i < 10; i++) {
						var tournamentID = userTournaments[i].id;
						var tournamentName = userTournaments[i].name;
						$('.sgg-lite-user-tournaments').append(
						`<div class="sgg-lite-tournament-container-outer">
						<div class="sgg-lite-tournament-container">
							<button class="sgg-lite-tournament" data-tournament-id="`+tournamentID+`">`
								+tournamentName+
							`</button>
						</div>`);
					}
				}else{
					alert("Incorrect User ID/No Tournaments Found");
				}
			}
		});
	}

	$('.sgg-lite-tournament-listing-button').click(function(){
		getUserTournaments($("#sgg-lite-userid-value").val());
	});

	$('#sgg-lite-userid-value').keypress(function (e) {
		var key = e.which;
		if(key == 13)  // the enter key code
		 {
			$('.sgg-lite-tournament-listing-button').click();
		 }
	   });   

	function showUserEvents(data = null){
		informationArray.userEvents = data.participant.events;
		let tournamentID = informationArray.tourneyInfo.id;
		let tournamentButton = $("button[data-tournament-id='"+tournamentID+"']");
		let formattedStartDate = new Date(informationArray.tourneyInfo.startAt*1000);
		let formattedEndDate = new Date(informationArray.tourneyInfo.endAt*1000);
		formattedStartDate =  months[formattedStartDate.getMonth()] + " " + formattedStartDate.getDate() + ", " + formattedStartDate.getFullYear() + " " + formattedStartDate.getHours() + ":" + (formattedStartDate.getMinutes() < 10 ? "0":"") + formattedStartDate.getMinutes()
		formattedEndDate =  months[formattedEndDate.getMonth()] + " " + formattedEndDate.getDate() + ", " + formattedEndDate.getFullYear() + " " + formattedEndDate.getHours() + ":" + (formattedEndDate.getMinutes() < 10 ? "0":"") + formattedEndDate.getMinutes()
		tournamentButton.addClass('has-tourney-info').hide();
		tournamentButton.closest('.sgg-lite-tournament-container').append(`
			<div>
				<h2 class="sgg-lite-tournament-title"><a href="`+informationArray.tourneyInfo.url+`">`+tournamentButton.text()+`</a></h2>
				<ul class="sgg-lite-tournament-information-list">
					<li class="sgg-lite-tournament-information">Start: `+formattedStartDate+`</li>
					<li class="sgg-lite-tournament-information">End: `+formattedEndDate+`</li>
					<li class="sgg-lite-tournament-information">Rules: `+informationArray.tourneyInfo.rules+`</li>
					<li class="sgg-lite-tournament-information">Number of Attendees: `+informationArray.tourneyInfo.numAttendees+`</li>

				</ul>
			</div>
			<div class="sgg-lite-events-container">
				<h2 class="sgg-lite-events-title">Your Events</h2>
			</div>
		`);
		tournamentButton.closest('.sgg-lite-tournament-container').find('.sgg-lite-tournament-information-list').slideToggle(300);
		let eventsContainer = tournamentButton.closest('.sgg-lite-tournament-container-outer').find(".sgg-lite-events-container");
		for (let userEvent of informationArray.userEvents) {
			userEvent.tourneyID = tournamentID;
			eventsContainer.append('<button class="sgg-lite-tournament-event" data-event-information="'+JSON.stringify(userEvent)+'">'+userEvent.name+'</button>');
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
			},
			success: function(data){
				$('.sgg-lite-loading-wheel').addClass('loading-wheel-hide');
				if(typeof data.data !== 'undefined' && data.data.participant.events !== null){
					showUserEvents(data.data);
				}else{
					alert("No Events Found/Incorrect Participant ID");
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
					  gamerTag: "`+informationArray.gamerTag+`"
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
				let loading_wheel_detached = $('.sgg-lite-loading-wheel').detach();
				$("button[data-tournament-id='"+tournamentID+"']").after(loading_wheel_detached);
				loading_wheel_detached.removeClass('loading-wheel-hide');
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
