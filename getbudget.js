var tree = {"name" : "flare", "children": []};

//an array where each line from the sheet will be stored as an object - rowobj, primobj, secobj
var budgetFix = [];
var primFix = [];


function getbudget(callback) {
	$.getJSON("https://spreadsheets.google.com/feeds/list/1eyb7wNs0URtE4WXMZsrrxZgIxvys-fj6WiG4sjHloLQ/1/public/values?alt=json",

		function(data) {

			// go through result and store wanted parameters in a new object, in array "budgetFix"
			for (var i=0; i < data.feed.entry.length; i++) {

				var rowObj = {}

				rowObj.primary = data.feed.entry[i].gsx$primary.$t;
				rowObj.secondary = data.feed.entry[i].gsx$secondary.$t;
				rowObj.third = data.feed.entry[i].gsx$third.$t;
				rowObj.sum1 = data.feed.entry[i].gsx$sum1.$t;
				rowObj.sum2 = data.feed.entry[i].gsx$sum2.$t;
				rowObj.diff = data.feed.entry[i].gsx$diff.$t;

				budgetFix[i] = rowObj;
			}

			// go through the list of posts, to add every primary category to an object as a key
			for (var i=0; i < budgetFix.length; i++) {

				var primObj = {};

				if (budgetFix[i].third == "" && budgetFix[i].secondary == "") {

					primObj.name = budgetFix[i].primary;
					primObj.size = budgetFix[i].sum2;
					primObj.size2 = budgetFix[i].sum1;
					primObj.diff = budgetFix[i].diff;
					primObj.children = [];

					primFix.push(primObj);
				}
			}

			tree.children = primFix;

// 1. go through the primary categories one by one
// 2. go through the budget lines and create an array of all the secondary categories for that primary category, and their values
// 3. iterate over the obj and add each category as a children object, with name, value and children array


			// goes through the primary array
			// for each line.. (primary object)
			for (var a=0; a < tree.children.length; a++) {

				// create shortcut to the primary object we are at
				primary = tree.children[a];

				// create an array that will be its children
				var secFix = [];

				// go through the budget lines to find the lines that belong to that primary category
				for (var i=0; i < budgetFix.length; i++) {


					// find the lines that belongs to the primary category, and are secondary categories
					if (budgetFix[i].primary == primary.name && budgetFix[i].secondary != "" && budgetFix[i].third == "") {

						// create an object to store a matching secondary budget line in.
						secObj = {};

						//store the line with all its data in secObj
						secObj.name = budgetFix[i].secondary;
						secObj.size = budgetFix[i].sum2;
						secObj.size2 = budgetFix[i].sum1;
						secObj.diff = budgetFix[i].diff;
						secObj.children = [];

						// push it into the children array
						secFix.push(secObj);
					}
				}

				primary.children = secFix;

				// now, still on the same primary object, go through the children array added, and add the third and last level of budget lines

				// go through all these created children objects
				for (var x = 0; x < primary.children.length; x++) {

					var current = primary.children[x];

					// go through the budget lines to find lines that belong to that primary category
					for (var i=0; i < budgetFix.length; i++) {

						// find the lines that belongs to the secondary category, and has the full child structure
						if (budgetFix[i].secondary == current.name && budgetFix[i].third != "") {
							current.children.push ({
								name: budgetFix[i].third,
								size: budgetFix[i].sum2,
								size2: budgetFix[i].sum1,
								diff: budgetFix[i].diff
							});
						}
					}

					if (current.children.length == 0) {
						delete current.children;
					}
				}

				if (primary.children.length == 0) {
					delete primary.children;
				}
			};
		console.log("this is the final tree, an object named tree");
		console.log(tree);

		callback(tree);
	});
}
