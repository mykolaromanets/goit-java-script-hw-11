import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchRequest } from './fetch_request';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);

function renderGallery(images) {
  // Перевірка чи існує галерея перед вставкою даних
  if (!gallery) {
    return;
  }

  const markup = images
    .map(image => {
      const {
        id,
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;
      return `
        <a class="gallery__link" href="${largeImageURL}">
          <div class="gallery-item" id="${id}">
            <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b>Likes</b>${likes}</p>
              <p class="info-item"><b>Views</b>${views}</p>
              <p class="info-item"><b>Comments</b>${comments}</p>
              <p class="info-item"><b>Downloads</b>${downloads}</p>
            </div>
          </div>
        </a>
      `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  // Цей код дозволяє автоматично прокручувати сторінку на висоту 2 карток галереї, коли вона завантажується
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
}

function onSearchForm(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();
  gallery.innerHTML = '';
  btnLoadMore.classList.add('is-hidden');
  btnLoadMore.addEventListener('click', onloadMore);

  if (query === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    return;
  }

  fetchRequest(query, page, perPage)
    .then(({ totalHits, hits }) => {
      if (totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        renderGallery(hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        const totalPages = Math.ceil(totalHits / perPage);
        if (totalPages > 1) {
          btnLoadMore.classList.remove('is-hidden');
        }
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
}

function onloadMore() {
  page += 1;
  simpleLightBox.destroy();
  // simpleLightBox.refresh();

  fetchRequest(query, page, perPage)
    .then(({ hits, totalHits }) => {
      renderGallery(hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      const totalPages = Math.ceil(totalHits / perPage);
      if (page >= totalPages) {
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        btnLoadMore.classList.add('is-hidden');
      }
    })
    .catch(error => console.log(error));
}
