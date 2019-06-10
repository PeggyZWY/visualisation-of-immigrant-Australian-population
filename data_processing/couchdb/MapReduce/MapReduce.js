country-state-year

function (doc) {
  emit([doc.ori_country, doc.au_state, doc.year], doc.population);
}



sa2-country-year

function (doc) {
  emit([doc.au_sa2_name, doc.ori_country, doc.year], doc.population);
}



state-country-year

function (doc) {
  emit([doc.au_state, doc.ori_country, doc.year], doc.population);
}



year-country-state

function (doc) {
  emit([doc.year, doc.ori_country, doc.au_state], doc.population);
}