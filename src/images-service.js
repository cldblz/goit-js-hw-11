import axios from 'axios';

const API_KEY = '22039510-58c9714a42d9c4cdcc57d29f2';
const BASE_URL = 'https://pixabay.com';

export default class ImagesApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

    async fetchImages() {
        try {
            const url = `${BASE_URL}/api/?key=${API_KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=40`

            const response = await axios.get(url);
            const images = await response.data
            this.incrementPage();
            return images
        } catch (error) {
            console.log(error);
        }
    }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}