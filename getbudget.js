var budgetFix = [];
var onlyThird = [];

var tree = {"name" : "flare", "children": []};

var secArray = [];
var primary = "hej";
var s = "foo";
var bar = 0;


function getbudget() {
	$.getJSON("https://spreadsheets.google.com/feeds/list/1eyb7wNs0URtE4WXMZsrrxZgIxvys-fj6WiG4sjHloLQ/1/public/values?alt=json", 

		function(data) {

			console.log(data.feed.entry.length);

			// go through result and store wanted parameters in a new object, in array "budgetFix"
			for (var i=0; i < data.feed.entry.length; i++) {

				var rowObj = {}

				rowObj.primary = data.feed.entry[i].gsx$primary.$t;
				rowObj.secondary = data.feed.entry[i].gsx$secondary.$t;
				rowObj.third = data.feed.entry[i].gsx$third.$t;
				rowObj.sum = data.feed.entry[i].gsx$sum.$t;

				budgetFix[i] = rowObj;
			}

			console.log(budgetFix);
			thirdPlace = 0;


			// go through the array and extract only the third level posts
			for (var i=0; i < budgetFix.length; i++) {

				if (! budgetFix[i].third == "") {

				var third = {};

				third.primary = budgetFix[i].primary;
				third.secondary = budgetFix[i].secondary;
				third.third = budgetFix[i].third;
				third.sum = budgetFix[i].sum;

				onlyThird[thirdPlace] = third;
				thirdPlace++;

				}
			}

			console.log(onlyThird.length);
			console.log(onlyThird);


			primObj = {};

			// go through the list of posts, to add every new instance of a primary category to an object as a key
			for (var i=0; i < onlyThird.length; i++) {

				var primary = onlyThird[i].primary;
				var primaryname = primObj[primary]

				if (!primaryname) {
					primObj[primary] = 1;
				};
			}

			// prints the object containing a key for each variable
			console.log(primObj);

			for (key in primObj) {
				tree.children.push( {
					name: key,
					children: []
				});
			}


// 1. go through the primary categories one by one
// 2. go through the budget lines and create and array of all the secondary categories for that primary category
// 3. loop over the array and add each category as a children object, with name and children array
			

			// goes through the array of primary children
			for (var a=0; a < tree.children.length; a++) {
				primary = tree.children[a];

			
			// go through the budget lines to find lines that belong to that primary category
				for (var i=0; i < onlyThird.length; i++) {

					// find the lines that belongs to the primary category, and has the full child structure
					if (onlyThird[i].primary == primary.name && onlyThird[i].secondary != "" && onlyThird[i].third != "") {

						//fill up the array with secondary categories that havent been added
						if (secArray.indexOf(onlyThird[i].secondary) == -1) {
							secArray.push(onlyThird[i].secondary);
						}
					}
				}

				// goes through the list and adds them as children objects
				if (secArray.length > 0) {
					for (var b = 0; b < secArray.length; b++) {
						primary.children.push ({
							name: secArray[b],
							children: []
						});
					}
				console.log(secArray);
				}

				// NOW, go through all these created children objects
				for (var child = 0; child < primary.children.length; child++) {

					s = primary.children[child];

					// go through the budget lines to find lines that belong to that primary category
					for (var i=0; i < onlyThird.length; i++) {

						// find the lines that belongs to the secondary category, and has the full child structure
						if (onlyThird[i].secondary == s.name) {
							s.children.push ({
								name: onlyThird[i].third,
								size: onlyThird[i].sum
							});
						}
					}
				}

				secArray = [];
			}

			// 1. go through the primary categories one by one
			// 2. go through the budget lines and create and array of all the only third category matches
			// 3. add that line as an object under primary category

			
			// goes through the array of primary children
			for (var a=0; a < tree.children.length; a++) {
				bar = a;
				// then go through the budget lines to find lines that belong to that primary category
				for (var i=0; i < onlyThird.length; i++) {
					// find the lines that belongs to the primary category, and has the short child
					if (onlyThird[i].primary == tree.children[bar].name && onlyThird[i].secondary == "") {

						tree.children[bar].children.push ({
							name: onlyThird[i].third,
							size: onlyThird[i].sum
						});
					}
				}
			};

		console.log(tree);
		console.log(JSON.stringify(tree));
	});
}

window.onload = getbudget;
