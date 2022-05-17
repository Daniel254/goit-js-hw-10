import { fetchCountries } from './js/fetchCountries.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
import './css/styles.css';

const refs = {
  searchBoxEl: document.getElementById('search-box'),
  countryListEl: document.querySelector('.country-list'),
  countryInfoEl: document.querySelector('.country-info'),
};

const DEBOUNCE_DELAY = 300;
const apiOtions = {
  baseUrl: 'https://restcountries.com/v3.1/name/',
  fieldsFilter: ['name', 'capital', 'population', 'flags', 'languages'],
};

refs.searchBoxEl.addEventListener('input', e => searchInputHandler(e.target));

function renderSearchResult(data) {
  if (data?.length > 10) {
    Notify.info('Too many matches found. Please enter a more specific name.');
    clearElement(refs.countryInfoEl);
    clearElement(refs.countryListEl);
    return;
  }
  if (data?.length > 1) {
    clearElement(refs.countryInfoEl);
    refs.countryListEl.innerHTML = createCountryList(data);
    return;
  }
  if (data?.length === 1) {
    clearElement(refs.countryListEl);
    refs.countryInfoEl.innerHTML = createCountryCard(data[0]);
    return;
  }
  clearElement(refs.countryInfoEl);
  clearElement(refs.countryListEl);
}
function createCountryCard({
  name: { official: name },
  flags: { svg: flag },
  capital,
  population,
  languages,
}) {
  return `<img src="${flag}" class="country-card__flag" alt="Flag" width="50"/>
	<h1 class="country-card__h">${name}</h1>
	<p><span class="country-card__label">Capital:</span> ${capital}</p>
	<p><span class="country-card__label">Population:</span> ${population}</p>
	<p><span class="country-card__label">Languages:</span> ${Object.values(languages).join(', ')}</p>`;
}
function createCountryList(countriesArr) {
  return countriesArr.reduce((acc, curr) => acc + createCountryListElement(curr), '');
}
function createCountryListElement({ flags: { svg: flag }, name: { common: name } }) {
  return `<li class="country-list-item">
	<img src="${flag}" alt="${name} flag" class="country-list-item__flag" width="40"/>
	<span class="country-list-item__country-name">
	${name}
	</span>
	</li>`;
}
function clearElement(el) {
  if (!el.hasChildNodes()) {
    return;
  }
  el.innerHTML = '';
}

function createApiUrl({ baseUrl, countryName, fieldsFilter }) {
  return baseUrl + countryName + '?fields=' + fieldsFilter.join(',');
}
const searchInputHandler = debounce(target => {
  const value = target.value.trim();
  if (value.length < 1) {
    renderSearchResult();
    return;
  }
  const apiUrl = createApiUrl({ ...apiOtions, countryName: value });
  fetchCountries(apiUrl)
    .then(data => {
      renderSearchResult(data);
    })
    .catch(error => {
      renderSearchResult();
      if (error.message === '404') {
        Notify.failure('Oops, there is no country with that name');
      }
    });
}, DEBOUNCE_DELAY);
