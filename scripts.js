/**
 * Data Catalog Project Starter Code - SEA Stage 2
 *
 * This file is where you should be doing most of your work. You should
 * also make changes to the HTML and CSS files, but we want you to prioritize
 * demonstrating your understanding of data structures, and you'll do that
 * with the JavaScript code you write in this file.
 *
 * The comments in this file are only to help you learn how the starter code
 * works. The instructions for the project are in the README. That said, here
 * are the three things you should do first to learn about the starter code:
 * - 1 - Change something small in index.html or style.css, then reload your
 *    browser and make sure you can see that change.
 * - 2 - On your browser, right click anywhere on the page and select
 *    "Inspect" to open the browser developer tools. Then, go to the "console"
 *    tab in the new window that opened up. This console is where you will see
 *    JavaScript errors and logs, which is extremely helpful for debugging.
 *    (These instructions assume you're using Chrome, opening developer tools
 *    may be different on other browsers. We suggest using Chrome.)
 * - 3 - Add another string to the titles array a few lines down. Reload your
 *    browser and observe what happens. You should see a fourth "card" appear
 *    with the string you added to the array, but a broken image.
 *
 */

// MAIN DATA STRUCTURE
let studies = [];

// HTML ELEMENTS
// where the cards go
const cardContainer = document.getElementById("card-container");
// the topic dropdown
const topicFilter = document.getElementById("topic-filter");
// the evidence dropdown
const evidenceFilter = document.getElementById("evidence-filter");
// newest/oldest dropdown
const yearSort = document.getElementById("year-sort");
// showing x of y studies
const resultCount = document.getElementById("result-count");
// the message container when no results match
const emptyState = document.getElementById("empty-state");
// hidden template card to copy each time
const templateCard = document.querySelector(".template-card");
// search input for title/author text
const searchInput = document.getElementById("search-input");
// area where topic counts will be shown
const topicCounts = document.getElementById("topic-counts");

function showCards() {
  // clear 
  cardContainer.innerHTML = "";

  // hold studies that match the filters
  const matchingStudies = [];

  // looking through the dataset for studies that matches the filters
  for (let i = 0; i < studies.length; i++) {
    const study = studies[i];

    // topic & evidence matches if filter is all OR if specific matches
    const matchesTopic = topicFilter.value === "all" || study.topic === topicFilter.value;
    const matchesEvidence = evidenceFilter.value === "all" || study.evidence === evidenceFilter.value;

    // searching matching studies lowercase title/authors/pmid
    const searchText = searchInput.value.trim().toLowerCase();
    const studyPmid = String(study.pmid || "").toLowerCase();
    const matchesSearch = searchText === "" || study.title.toLowerCase().includes(searchText) || study.authors.toLowerCase().includes(searchText) || studyPmid.includes(searchText);
    // only keep studies that pass both filters
    if (matchesTopic && matchesEvidence && matchesSearch) {
       matchingStudies.push(study);
    }
  }

  // sorting the filtered studies with sort rule based on newest or not
  matchingStudies.sort(function (a, b) {
    if (yearSort.value === "newest") {
      // returns positibe number so b before a
      return b.year - a.year;
    } else {
      // returns negative number so a before b
      return a.year - b.year;
    }
  })

  // making the cards 
  for (let i = 0; i < matchingStudies.length; i++) {
    // copy template
    const nextCard = templateCard.cloneNode(true);

    // fill in 
    editCardContent(nextCard, matchingStudies[i]);

    // put it on the page
    cardContainer.appendChild(nextCard);
  }

  // update the text above the cards
  resultCount.textContent = "Showing " + matchingStudies.length + " of " + studies.length + " studies";
  // render the topic counts
  renderTopicCounts(matchingStudies);
  // if nothing matched, show the empty message
  if (matchingStudies.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
}


// helper for filling in card content
function editCardContent(card, study) {
  // remove hidden tag
  card.classList.remove("template-card");
  card.setAttribute("aria-hidden", "false");

  // grab the parts of the card we want to update
  const cardTitle = card.querySelector(".card-title");
  const cardMeta = card.querySelector(".card-meta");
  const topicBadge = card.querySelector(".topic-badge");
  const evidenceBadge = card.querySelector(".evidence-badge");
  const studyType = card.querySelector(".study-type");
  const population = card.querySelector(".population");
  const keyFinding = card.querySelector(".key-finding");
  const practicalTakeaway = card.querySelector(".practical-takeaway");
  const sourceLink = card.querySelector(".source-link");

  // put the study data into the card
  cardTitle.textContent = study.title;
  cardMeta.textContent = study.authors + " - " + study.year;
  topicBadge.textContent = study.topic;
  evidenceBadge.textContent = study.evidence;
  studyType.textContent = "Study design: " + study.type;
  population.textContent = "Population: " + study.population;
  keyFinding.textContent = study.keyFinding;
  practicalTakeaway.textContent = study.takeaway;
  sourceLink.href = study.source;

  // remove any old evidence color classes first
  evidenceBadge.classList.remove(
    "evidence-high",
    "evidence-moderate",
    "evidence-emerging"
  );

  // add the right class based on the study's evidence level
  if (study.evidence === "High") {
    evidenceBadge.classList.add("evidence-high")
  } else if (study.evidence === "Moderate") {
    evidenceBadge.classList.add("evidence-moderate");
  } else {
    evidenceBadge.classList.add("evidence-emerging")
  }
}
// helper for rendering the topic counts
function renderTopicCounts(filteredStudies) {
  // clear old count items
  topicCounts.innerHTML = "";

  // make an object to store counts by topic
  const countsByTopic = {};

  // count how many filtered studies belong to each topic
  for (let i = 0; i < filteredStudies.length; i++) {
    const topicName = filteredStudies[i].topic;

    // if this topic is not in the object yet, start it at 0
    if (countsByTopic[topicName] === undefined) {
      countsByTopic[topicName] = 0;
    }

    // add 1 for this study
    countsByTopic[topicName] = countsByTopic[topicName] + 1;
  }

  // get the topic names so we can loop through them
  const topicNames = Object.keys(countsByTopic);

  // sort alphabetically
  topicNames.sort();

  // make one small label for each topic count
  for (let i = 0; i < topicNames.length; i++) {
    const topicName = topicNames[i];
    const countItem = document.createElement("p");

    countItem.className = "topic-count-item";
    countItem.textContent = topicName + ": " + countsByTopic[topicName];

    topicCounts.appendChild(countItem);
  }
}

// loading the studies.json into studies
// then cal the showCards() once
function loadStudies() {
  fetch("studies.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      studies = data;
      showCards();
    })
    .catch(function (error) { // just in case
      console.log("Error loading studies:", error);
      resultCount.textContent = "Could not load studies";
      emptyState.style.display = "block";
    });
}

// event listeners for the three dropdowns
topicFilter.addEventListener("change", showCards);
evidenceFilter.addEventListener("change", showCards);
yearSort.addEventListener("change", showCards);
searchInput.addEventListener("input", showCards);
loadStudies();
