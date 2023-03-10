import ImagesService from './images-service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import debounce from 'lodash.debounce'

const searchForm = document.querySelector("#search-form")
const input = document.querySelector("input")
const galleryRef = document.querySelector(".gallery")
// const loadMoreBtn = document.querySelector(".load-more")
const imagesService = new ImagesService();
let lightbox = {}
let isEventListenerActive = false
const onScrollEnd = debounce(chattyOnScrollEnd, 300)

searchForm.addEventListener("submit", onSearch)
// loadMoreBtn.addEventListener('click', fetchImages);

function onSearch(e) {
  e.preventDefault()

  if (!isEventListenerActive) {
    window.addEventListener("scroll", onScrollEnd)
    isEventListenerActive = true
  }

  imagesService.query = input.value;

  if (imagesService.query.trim() === '') {
    return Notify.failure("Please enter your query.");
  }

  imagesService.resetPage();
  clearGallery();
  // loadMoreBtn.classList.add("is-hidden")
  fetchImages();
}

function chattyOnScrollEnd() {
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
    fetchImages()
  }
}

function fetchImages() {
  imagesService.fetchImages().then(images => {
    // loadMoreBtn.classList.add("is-hidden")

    if (images.hits.length === 0) {
        Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        return
    }

    createMarkup(images.hits)

    // loadMoreBtn.classList.remove("is-hidden")

    if (imagesService.page === 1) {
      Notify.success(`Hooray! We found ${images.totalHits} images.`);
      lightbox = new SimpleLightbox('.gallery a', {
        captions: true, captionSelector: 'img', captionType: 'attr', captionsData: "alt", captionDelay: 250
      });
    }

    if (imagesService.page > 1) {
      lightbox.refresh()

      const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
      });
    }

    let imgQuantity = document.querySelectorAll(".photo-card")
    if (imgQuantity.length >= images.totalHits) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      // loadMoreBtn.classList.add("is-hidden")
      window.removeEventListener("scroll", onScrollEnd)
      isEventListenerActive = false
    }
  });
}

function createMarkup(images) {
  const markup = images.map(image => {
    return `<a class="photo-card" href="${image.largeImageURL}">
  <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
  <div class="info">
    <div class="info-item">
      <div class="info-header"><b>Likes</b></div><div class="info-number">${image.likes}</div>
    </div>
    <div class="info-item">
      <div class="info-header"><b>Views</b></div><div class="info-number">${image.views}</div>
    </div>
    <div class="info-item">
      <div class="info-header"><b>Comments</b></div><div class="info-number">${image.comments}</div>
    </div>
    <div class="info-item">
      <div class="info-header"><b>Downloads</b></div><div class="info-number">${image.downloads}</div>
    </div>
  </div>
</a>`
   }).join("")
  galleryRef.insertAdjacentHTML("beforeend", markup)
}

function clearGallery() {
  galleryRef.innerHTML = '';
}
