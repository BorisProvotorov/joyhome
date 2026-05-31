const formValidation = ({ errorDefault = '', formId, submitDisabled = false }, settings) => {

  const form = document.querySelector(formId);

  if (!form) {
    return;
  }

  const inputFields = form.querySelectorAll('input, textarea, .selectbox');

  //Делаем кнопку отправки не доступной, пока в форме есть ошибки
  const formDisableButton = (inputsField, form) => {
    const fieldCompleted = [];
    const submitButton = form.querySelector('button[type="submit"]');
    let countFields = 0;
    if (submitButton) {
      for(let i = 0; i < inputsField.length; i += 1) {
        const inputField = inputsField[i];
        if (inputField.getAttribute('data-required')) {
          countFields += 1;

          const selectValue = inputField.querySelectorAll('option[disabled]').length > 0 ? inputField.querySelectorAll('option[disabled]')[0].value : false;

          if (inputField.value.length > 0 
              && !inputField.parentNode.classList.contains('field-is-error') 
              && inputField.value !== "+7(___) ___-__-__"
              && inputField.value !== selectValue) {
              
            fieldCompleted.push(inputField);
          }
        }
      }
      submitButton.disabled = fieldCompleted.length === countFields ? false : true;
    }
  }

  for(let i = 0; i < inputFields.length; i += 1) {
    
    if (inputFields[i].hasAttribute('data-required')) {
      if (settings && typeof settings[inputFields[i].name] === 'function') {
        const { errorText } = settings[inputFields[i].name](inputFields[i]);
        
        if (typeof errorText === 'string' && errorText.length > 0) {

          let errorEl = document.createElement("div");
          errorEl.setAttribute('class', 'field-error');
  
          if (inputFields[i].type !== 'checkbox') {
            inputFields[i].after(errorEl);
          }
          
          if (inputFields[i].type === 'checkbox') {
            inputFields[i].parentNode.after(errorEl);
          }
        }
      }
    }

    if (submitDisabled) {
      inputFields[i].addEventListener('change', (evt) => {
        formDisableButton(inputFields, form);
      });
    }

    inputFields[i].addEventListener('input',(evt) => {
      const target = evt.target;

      //Стилизация успешной проверки
      const hideErrors = (target) => {

        if (target.type === 'checkbox') {
          const fieldError = target.parentNode.parentNode.querySelector('.field-error');
          
          if (fieldError) {
            fieldError.innerText = "";
          }

        }

        target.nextSibling.innerText = "";
        target.parentNode.classList.add('field-is-success');
        target.parentNode.classList.remove('field-is-error');
        target.style = "border: 0px solid green";
      };

      //Стилизация при возникновении ошибки
      const showErrors = (target) => {
        target.parentNode.classList.remove('field-is-success');
        target.parentNode.classList.add('field-is-error');
        target.style = "border: 0px solid red";
      };

      //Общий вывод ошибок, просто проверка на пустоту
      const toggleErrorsGeneral = (target, errorText) => {
        if (target.value !== "" && target.value !== "+7(___) ___-__-__" && target.type !== 'checkbox') {
          hideErrors(target);
        } else if (target.type === 'checkbox' && target.checked) {
          hideErrors(target);
        } else {
          target.nextSibling.innerText = errorText? errorText : errorDefault;
          showErrors(target);
        }
      };

      //Вывод ошибок для полей с кастомной валидацией
      const toggleErrors = (isValidate, target, errorText) => {
        if (isValidate === undefined) {
          toggleErrorsGeneral(target, errorText);
        } else if (isValidate) {
          hideErrors(target);
        } else {
          
          if (target.type === 'checkbox') {
            const fieldError = target.parentNode.parentNode.querySelector('.field-error');
            if (fieldError) {
              fieldError.innerText = errorText;
            }
          } else {
            target.nextSibling.innerText = errorText;
          }

          showErrors(target);
        }
      };

      //Срабатывание валидации только для обязательных полей
      if (target.getAttribute('data-required')) {
        if (settings && settings[target.name]) {
          const { isValidate, errorText} = settings[target.name](target);
          toggleErrors(isValidate, target, errorText);
        } else {
          toggleErrorsGeneral(target);
        }
      }

      if (submitDisabled) {
        formDisableButton(inputFields, form);
      }
    });
  }
}