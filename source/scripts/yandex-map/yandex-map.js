// 1. Сначала объявляем debounce
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 2. Затем — остальные функции, где используется debounce
function loadYandexMapsScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=10f4c8ee-11c9-47ee-be37-675358036731';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Не удалось загрузить скрипт Яндекс Карт'));
    document.head.appendChild(script);
  });
}

let mapInitialized = false;

async function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  try {
    await loadYandexMapsScript();
    ymaps.ready(yandexMapInit);
  } catch (error) {
    console.error('Ошибка при загрузке Яндекс Карт:', error);
    const mapContainer = document.getElementById('yandex-map');
    if (mapContainer) {
      mapContainer.innerHTML = '<p>Не удалось загрузить карту. Попробуйте обновить страницу.</p>';
    }
  }
}

function handleFirstScroll() {
  window.removeEventListener('scroll', handleFirstScroll);
  initMap();
}

window.addEventListener('scroll', handleFirstScroll);

// 3. Функция инициализации карты (ваша логика)
const yandexMapInit = () => {
  const handleCreateMap = ({ yandexMapId, placemarkCoordinates } = {}, callback) => {
    const yandexMapContainer = document.querySelector(`#${yandexMapId}`);

    if (yandexMapContainer) {
      const myMap = new ymaps.Map(yandexMapId, {
        center: [58.53427, 49.973351],
        zoom: 17,
        controls: []
      }, {
        autoFitToViewport: 'always',
        suppressMapOpenBlock: true
      });

      let objectsCollection = new ymaps.GeoObjectCollection(null, {
        iconLayout: 'default#image',
        iconImageSize: [40, 40],
        iconImageHref: '../img/pngegg.png'
      });

      if (Array.isArray(placemarkCoordinates) && placemarkCoordinates.length > 0) {
        for (let i = 0; i < placemarkCoordinates.length; i += 1) {
          objectsCollection.add(new ymaps.Placemark(placemarkCoordinates[i].marker, {
            hintContent: placemarkCoordinates[i].hintContent,
          }));
        }
        myMap.geoObjects.add(objectsCollection);
      }

      const generateMap = ({ centerCoordinates, zoom, height }) => {
        document.querySelector(`#${yandexMapId}`).style = `height: ${height}px;`;
        myMap.setCenter(centerCoordinates, zoom);
        myMap.container.fitToViewport();
      };
      callback({ myMap, yandexMapId, generateMap });

      myMap.controls.add('zoomControl');
      myMap.behaviors.disable('scrollZoom');
    }
  };

  handleCreateMap({
    yandexMapId: 'yandex-map',
  }, ({ generateMap }) => {

    const handleResizeMap = () => {
      if (window.innerWidth <= 767) {
        generateMap({
          centerCoordinates: [58.53420795, 49.97322225],
          zoom: 16,
          height: '141'
        });
      } else if (window.innerWidth <= 1025) {
        console.log(window.innerWidth);
        generateMap({
          centerCoordinates: [58.53487, 49.973351],
          zoom: 17,
          height: '400'
        });
      } else {
        generateMap({
          centerCoordinates: [58.53427, 49.973351],
          zoom: 17,
          height: '577'
        });
      }
    };

    handleResizeMap();
    // 4. Теперь debounce доступен — можно использовать
    const debouncedHandleResizeMap = debounce(handleResizeMap, 500);
    window.addEventListener('resize', debouncedHandleResizeMap);
  });
};