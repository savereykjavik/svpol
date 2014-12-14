var tree = {"name" : "flare", "children": []};

var secObj = {};
var primary = "hej";
var budgetFix = [];
var s = "foo";
var bar = 0;


function getbudget(callback) {
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

			primObj = {};

			// go through the list of posts, to add every primary category to an object as a key
			for (var i=0; i < budgetFix.length; i++) {

				if (budgetFix[i].third == "" && budgetFix[i].secondary == "") {

					var primary = budgetFix[i].primary;

					primObj[primary] = budgetFix[i].sum;
				}
			}

			// prints the object containing a key for each variable
			console.log(primObj);
			console.log("this is primeObj!")

			for (key in primObj) {
				tree.children.push( {
					name: key,
					size: primObj[key],
					children: []
				});
			}
			console.log(tree);
			console.log("this is tree!");


// 1. go through the primary categories one by one
// 2. go through the budget lines and create an object of all the secondary categories for that primary category, and their values
// 3. iterate over the obj and add each category as a children object, with name, value and children array
			

			// goes through the array of primary children
			for (var a=0; a < tree.children.length; a++) {

				secObj = {};
				primary = tree.children[a];

			
				// go through the budget lines to find lines that belong to that primary category
				for (var i=0; i < budgetFix.length; i++) {

					// find the lines that belongs to the primary category, and are secondary categories
					if (budgetFix[i].primary == primary.name && budgetFix[i].secondary != "" && budgetFix[i].third == "") {

						//fill up the array with secondary categories that havent been added
						var secondary = budgetFix[i].secondary;

						secObj[secondary] = budgetFix[i].sum;
					}
				}


				for (key in secObj) {
					primary.children.push( {
						name: key,
						size: secObj[key],
						children: []
					});
				}


				// now go through the secondary children objects added, and add the third and last level of budget lines

				// go through all these created children objects
				for (var child = 0; child < primary.children.length; child++) {

					s = primary.children[child];

					// go through the budget lines to find lines that belong to that primary category
					for (var i=0; i < budgetFix.length; i++) {

						// find the lines that belongs to the secondary category, and has the full child structure
						if (budgetFix[i].secondary == s.name && budgetFix[i].third != "") {
							s.children.push ({
								name: budgetFix[i].third,
								size: budgetFix[i].sum
							});
						}
					}
				}

			console.log(secObj);
			console.log("this is secObj!");

			};


		console.log(tree);
		console.log("this is new tree!");

		callback(tree);

	});
}
