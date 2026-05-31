$(document).ready(function() {

  //Кнопка бургер
  const burger = document.querySelector('.burger');
  const menuMobile = document.querySelector('.menu-mobile');
  if (burger && menuMobile) {
    burger.addEventListener('click', (evt) => {
      evt.target.classList.toggle('active');
      menuMobile.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    })
  }

  // Функция для debounce
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
  }

  //Слайдер — популярные товары
  let sliderPopular = $('.slick-popular');
  let sliderPopularCount = sliderPopular.find('.slick-popular__item').length;

  if (sliderPopular.length > 0 && sliderPopularCount > 3) {
    sliderPopular.slick({
      slidesToShow: 3,
      infinite: true,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1025,
          settings: {
            slidesToShow: 3.12,
            infinite: false,
            slidesToScroll: 1,
            arrows: false
          }
        },
        {
          breakpoint: 769,
          settings: {
            slidesToShow: 2.2,
            infinite: false,
            slidesToScroll: 1,
            arrows: false
          }
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 1,
            centerMode: true,
            infinite: true,
            arrows: false,
            variableWidth: true,
          }
        },
      ]
    });
  }

  //Слайдер — новинки
  let sliderProductsNews = $('.slick-products-new');
  let slickInitialized = false;

  if (sliderProductsNews.length > 0) {
    const checkSlider = () => {
        const windowWidth = window.innerWidth;
        if (windowWidth < 767 && slickInitialized) {
            sliderProductsNews.slick('unslick');
            slickInitialized = false;
        } else if (windowWidth >= 768 && !slickInitialized) {
          sliderProductsNews.slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            responsive: [
              {
                breakpoint: 1025,
                settings: {
                  arrows: false      
                }
              },
              {
                breakpoint: 769,
                settings: {
                  slidesToShow: 2.2,
                  infinite: false,
                  slidesToScroll: 1,
                  arrows: false
                }
              },
            ]
          });
          slickInitialized = true;
        }
    };
  
    const debouncedCheckSlider = debounce(checkSlider, 250);
    checkSlider();
    $(window).on('resize', debouncedCheckSlider);
  }


  //Слайдер — отзывы
  let sliderReview = $('.slick-reviews');
  let sliderReviewCount = sliderReview.find('.slick-reviews__item').length;

  if (sliderReview.length > 0 && sliderReviewCount > 3) {
    sliderReview.slick({
      slidesToShow: 3,
      infinite: true,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1025,
          settings: {
            slidesToShow: 2.764,
            infinite: false,
            slidesToScroll: 1,
            arrows: false
          }
        },
        {
          breakpoint: 769,
          settings: {
            slidesToShow: 2.2,
            infinite: false,
            slidesToScroll: 1,
            arrows: false
          }
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 1,
            centerMode: true,
            infinite: true,
            arrows: false,
            variableWidth: true,
          }
        },
      ]
    });
  }

    //Уведомления
    const notifyForm = (() => {
      document.addEventListener('click', (evt) => {
        if (evt.target.classList.contains("notify__close")) {
          evt.target.parentNode.remove();
        }
      });

      const notifyNodeWrap = document.createElement('div');
      notifyNodeWrap.setAttribute('class','notify');
      document.body.appendChild(notifyNodeWrap);

      return ({ message, delay }) => {
        const buttonClose = document.createElement("button");
        buttonClose.setAttribute('class','notify__close');
        buttonClose.innerHTML = "Закрыть";

        const notifyNode = document.createElement('div');
        notifyNode.setAttribute('class','notify__item');
        notifyNode.innerHTML = message;

        notifyNode.appendChild(buttonClose);
        notifyNodeWrap.appendChild(notifyNode);

        let int = 0;
        
        $.fancybox.close();
        const timer = setInterval(() => {
          int += 1;
          if (int === delay) {
            const notify = document.querySelector('.notify__item');
            if (notify) {
              notifyNodeWrap.removeChild(notify);
              clearInterval(timer);
            }
          }
        }, 1000);
      }
  })();


  //Валидация форм при событии submit
  const formValidationOnSubmit = (evt, form) => {
    {
      evt.preventDefault();

      /** Понадобится, если переделать на метод POST */
      // const formData = new FormData(evt.target);
      //const data = Object.fromEntries(formData.entries());

      const requiredFields = form.querySelectorAll('input[data-required="true"]');
      let isValid = true;

      requiredFields.forEach(field => {
        const value = field.value.trim();
        const isEmpty = value === '' ? true : false;
        
        if (isEmpty) {
          isValid = false;
        }

        if (field.type === 'checkbox' && field.name === 'policy' && !field.checked) {
          isValid = false;
        }

        if (!isValid && field.type !== 'checkbox') {
          field.parentNode.classList.add('field-is-error');
        }
      });

      if (isValid) {
        $.ajax({
          url: evt.target.action, 
          method: 'GET',
          dataType: 'json',
          success: function(data) {
            notifyForm({
              message: data.messageSuccess,
              delay: 3,
            });
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.error('Ошибка загрузки JSON:', textStatus, errorThrown);
          }
        });
      }
    }
  };

  const feedbackForm = document.querySelector('.feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (evt) => formValidationOnSubmit(evt, feedbackForm));
  }

  const subscribeForm = document.querySelector('.subscribe-form');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (evt) => formValidationOnSubmit(evt, subscribeForm));
  }

  const modalFormParthner = document.querySelector('.modal-form-parthner');
  if (modalFormParthner) {
    modalFormParthner.addEventListener('submit', (evt) => formValidationOnSubmit(evt, modalFormParthner));
  }

  formValidation({ formId: '.feedback-form' }, { 
    policy: (target) => ({
      isValidate: (() => {
       if (!target.checked) {
        return false;
       }
        return true;
      })(),
      errorText: 'Пожалуйста, подтвердите согласие с политикой конфиденциальности'
    }),
  });

  formValidation({ formId: '.subscribe-form' });
  formValidation({ formId: '.modal-form-parthner' });
  
  //Открытия описания товара в модальном окне через AJAX
  const getNextProduct = ($current, $items) => {
    const currentIndex = $items.index($current);
    const nextIndex = (currentIndex + 1) % $items.length;
    return $items.eq(nextIndex);
  };
  
  const getPreviousProduct = ($current, $items) => {
    const currentIndex = $items.index($current);
    const prevIndex = currentIndex === 0 ? $items.length - 1 : currentIndex - 1;
    return $items.eq(prevIndex);
  };
  
  const updateModalContent = (url, ajaxCallback) => {
    $.ajax({
      url: url,
      success: (response) => {
        ajaxCallback(response)
        $('.modal-product-card').removeClass('hide');
      },
      error: () => console.log('Ошибка загрузки данных')
    });
  };
  
  const fancyBoxProductsModal = ({ productClassItem }, ajaxCallback) => {
    $('body').on('click', productClassItem, (evt) => {
      const $currentProduct = $(evt.currentTarget);
      const jsonUrl = $currentProduct.data('json-url');
      $('.modal-product-card').addClass('hide');
    
      if (!jsonUrl) {
        console.error('Не указан data-json-url для элемента');
        return;
      }
    
      const modalState = {
        currentProduct: $currentProduct,
        productItems: $(productClassItem)
      };
    
      $.fancybox.open({
        src: '#modal-product-new',
        opts: {
          afterShow: () => {
            updateModalContent(jsonUrl, ajaxCallback);
    
            const $nextSlide = $('.modal-product-card .next-slide');
            const $prevSlide = $('.modal-product-card .prev-slide');
    
            const handleSlideChange = (getProductFn) => {
              const newProduct = getProductFn(modalState.currentProduct, modalState.productItems);
              if (newProduct) {
                modalState.currentProduct = newProduct;
                updateModalContent(newProduct.data('json-url'), ajaxCallback);
              }
            };
    
            $nextSlide.off('click').on('click', (e) => {
              e.stopPropagation();
              handleSlideChange(getNextProduct);
            });
    
            $prevSlide.off('click').on('click', (e) => {
              e.stopPropagation();
              handleSlideChange(getPreviousProduct);
            });
          },
          afterClose: () => {
            $('.modal-product-card .next-slide, .modal-product-card .prev-slide').off('click');
          }
        }
      });
    });
  };

  const setContentFancyboxProductsModal = ({ title, descr, image, price, volume, links }) => {

    const modalCard = document.querySelector('.modal-product-card');
    modalCard.classList.add('modal-product-card--new');
    
    const elementsToUpdate = [
      { selector: '.modal-product-card__title', value: title },
      { selector: '.modal-product-card__descr', value: descr },
      { selector: '.modal-product-card__volume', value: volume },
      { selector: '.modal-product-card__price', value: price },
    ];
    
    elementsToUpdate.forEach(({ selector, value }) => {
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = value || '';
      }
    });

    const linksContainer = document.querySelector('.modal-product-card__links');
    if (Array.isArray(links) && links.length > 0) {
      linksContainer.innerHTML = '<span class="modal-product-card__links-label">Где купить:</span>';
      links.forEach((item) => {
        linksContainer.innerHTML += `<a class="modal-product-card__shop-link" href="${item.url}">
          <img src="${item.image}" alt="${item.title ? item.title : ''}">
        </a>`
      });
    } else if (linksContainer) {
      linksContainer.innerHTML = '';
    }
    
    // Обрабатываем изображения отдельно
    if (image?.desktop) {
      document.querySelector('.modal-product-card__image img')
        .setAttribute('src', image.desktop);
    }
    if (image?.mobile) {
      document.querySelector('.modal-product-card__image source')
        .setAttribute('srcset', image.mobile);
    }
  };

  fancyBoxProductsModal({
    productClassItem: '.products-new'
  }, ({ title, descr, image, price, volume, links }) => {
    setContentFancyboxProductsModal({ title, descr, image, price, volume, links });
  });

  fancyBoxProductsModal({
    productClassItem: '.product-card-new'
  }, ({ title, descr, image, price, volume, links }) => {
    setContentFancyboxProductsModal({ title, descr, image, price, volume, links });
  });

  fancyBoxProductsModal({
    productClassItem: '.product-popular__button-more'
  }, ({ title, descr, image, price, volume, links }) => {
    setContentFancyboxProductsModal({ title, descr, image, price, volume, links });
  });

  fancyBoxProductsModal({
    productClassItem: '.product-card__button-more'
  }, ({ title, descr, image, price, volume, links }) => {
    setContentFancyboxProductsModal({ title, descr, image, price, volume, links });
  });

  //Фильтр каталога продукции c диапазоном цен
  let RangeSlider = document.getElementById('range-slider');

  if (typeof noUiSlider !== 'undefined' && RangeSlider) {
    let formatForSlider = {
      from: function (formattedValue) {
        return Number(formattedValue);
      },
      to: function(numericValue) {
        return Math.round(numericValue);
      }
    };
  
    noUiSlider.create(RangeSlider, {
      start: [1000, 5000],
      connect: true,
      tooltips: true,
      format: formatForSlider,
      range: {
        'min': 0,
        'max': 5000
      },
      step: 1
    });
  }
  
  const filterProducts = () => {
    const filter = document.querySelector('.filter');
    if (!filter) {
      return;
    }
  
    const params = new URLSearchParams(window.location.search);
    const volumeParam = params.get('volume');
    const priceParam = params.get('price');
  
    const volumeCheckboxes = document.querySelectorAll('.filter input[type="checkbox"][name="volume[]"]');
  
    const sendAjaxRequest = () => {
      const currentUrl = `${window.location.pathname}?${params.toString()}`;
      console.log('Выполняем AJAX-запрос:', currentUrl);
      // Ваш AJAX-код
    };
  
    const debouncedAjax = debounce(sendAjaxRequest, 1000);
    let isInitializing = true;
  
    // Проверяет, есть ли активные фильтры
    const hasActiveFilters = () => {
      // Проверяем чекбоксы объёма
      const hasVolumeFilters = Array.from(volumeCheckboxes).some(cb => cb.checked);
    
      // Проверяем текущее значение слайдера (а не параметр из URL)
      let hasPriceFilter = false;
      if (RangeSlider?.noUiSlider) {
        const sliderValues = RangeSlider.noUiSlider.get();
        if (sliderValues && sliderValues.length === 2) {
          const [minPrice, maxPrice] = sliderValues.map(val => parseInt(val, 10));
          // Считаем фильтр активным, если диапазон не стандартный (0–5000)
          hasPriceFilter = !(minPrice === 0 && maxPrice === 5000);
        }
      }
    
      return hasVolumeFilters || hasPriceFilter;
    };
  
    const updateUrlFromCheckboxes = () => {
      const checkedValues = Array.from(volumeCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
  
      if (checkedValues.length > 0) {
        params.set('volume', checkedValues.join(','));
      } else {
        params.delete('volume');
      }
  
      updateUrl();
      if (hasActiveFilters()) { // Запускаем AJAX только при активных фильтрах
        debouncedAjax();
      }
    };
  
    const updateUrlFromSlider = (values) => {
      if (values && values.length === 2) {
        const [minPrice, maxPrice] = values.map(val => parseInt(val, 10));
        params.set('price', `${minPrice},${maxPrice}`);
      } else {
        params.delete('price');
      }
  
      updateUrl();
      if (hasActiveFilters()) { // Запускаем AJAX только при активных фильтрах
        debouncedAjax();
      }
    };
  
    const updateUrl = () => {
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
    };
  
    if (volumeParam) {
      const volumeValues = volumeParam.split(',').map(v => v.trim());
      volumeCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      volumeValues.forEach(value => {
        const targetCheckbox = document.querySelector(
          `.filter input[type="checkbox"][name="volume[]"][value="${value}"]`);
        if (targetCheckbox) {
          targetCheckbox.checked = true;
        } else {
          console.warn(`Чекбокс с value="${value}" не найден`);
        }
      });
    }
    // Убрали else-блок с вызовом updateUrlFromCheckboxes()
  
    if (priceParam && RangeSlider?.noUiSlider) {
      const [minPrice, maxPrice] = priceParam.split(',')
        .map(p => parseInt(p, 10))
        .filter(p => !isNaN(p));
      if (minPrice !== undefined && maxPrice !== undefined) {
        RangeSlider.noUiSlider.set([minPrice, maxPrice], false);
      }
    }
  
    volumeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (event) => {
        event.preventDefault();
        updateUrlFromCheckboxes();
      });
    });
  
    if (RangeSlider?.noUiSlider) {
      RangeSlider.noUiSlider.on('update', function(values) {
        if (!isInitializing) {
          updateUrlFromSlider(values);
        }
      });
    }
  
    setTimeout(() => {
      isInitializing = false;
    }, 100);
  };
  
  filterProducts();

  //Скрытие/показ фильтров на мобильном
  const filterTogger = document.querySelector('.filter__title');

  if (filterTogger) {
    filterTogger.addEventListener('click', (evt) => {
      const filterList = document.querySelector('.filter__list');
      if (filterList) {
        filterList.classList.toggle('active');
        evt.target.classList.toggle('active');
      }
    });
  }


});