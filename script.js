// Add More Fields Logic
function addField(sectionId, fieldName, label, isTextarea=false) {
  const section = document.getElementById(sectionId);
  const div = document.createElement('div');
  div.style.marginTop = '8px';
  const labelElem = document.createElement('label');
  labelElem.textContent = label;
  if (isTextarea) {
    const textarea = document.createElement('textarea');
    textarea.name = fieldName + '[]';
    textarea.rows = 3;
    textarea.placeholder = `Add more ${label.toLowerCase()}`;
    div.appendChild(labelElem);
    div.appendChild(textarea);
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = fieldName + '[]';
    input.placeholder = `Add more ${label.toLowerCase()}`;
    div.appendChild(labelElem);
    div.appendChild(input);
  }
  section.appendChild(div);
}

// Load selected template from URL
const urlParams = new URLSearchParams(window.location.search);
const templateField = document.getElementById("templateField");
if (templateField) {
  templateField.value = urlParams.get("template") || "";
}

// EmailJS is initialized in form.html using the recommended method

function sendMail(e) {
  e.preventDefault();
  var form = document.getElementById('resumeForm');
  var submitBtn = document.getElementById('submitBtn');
  var confirmationMsg = document.getElementById('confirmationMsg');
  var successModal = document.getElementById('successModal');
  var closeSuccessModal = document.getElementById('closeSuccessModal');
  submitBtn.disabled = true;
  confirmationMsg.style.display = 'none';

  var imageInput = form.querySelector('input[type="file"]');
  var imageFile = imageInput && imageInput.files && imageInput.files[0];

  // Check image file size (max 1MB)
  if (imageFile && imageFile.size > 1024 * 1024) { // 1MB limit
    confirmationMsg.textContent = "Image file is too large. Please select an image under 1MB.";
    confirmationMsg.style.display = 'block';
    submitBtn.disabled = false;
    return;
  }

  // Collect all form data
  var formData = new FormData(form);
  var message = '';
  for (let [key, value] of formData.entries()) {
    // Handle array fields (education[], skills[], etc.)
    if (key.endsWith('[]')) {
      if (!message.includes(key.replace('[]', ''))) {
        let allValues = formData.getAll(key);
        message += `${key.replace('[]', '')}:\n  - ${allValues.join('\n  - ')}\n`;
      }
    } else if (key !== 'profilePic') {
      message += `${key}: ${value}\n`;
    }
  }

  function sendEmailWithImage(imageBase64) {
    var params = {
      name: form.fullName.value,
      time: new Date().toLocaleString(),
      message: message,
      image_base64: imageBase64 || ''
    };
    var serviceID = "service_izndceb";
    var templateID = "template_04o55pn";
    emailjs.send(serviceID, templateID, params)
      .then(function(res) {
        form.reset();
        if (successModal) {
          successModal.style.display = 'block';
          closeSuccessModal.onclick = function() {
            successModal.style.display = 'none';
          };
          window.onclick = function(event) {
            if (event.target === successModal) {
              successModal.style.display = 'none';
            }
          };
        }
        confirmationMsg.textContent = "Your resume request has been received and emailed successfully.";
        confirmationMsg.style.display = 'block';
        submitBtn.disabled = false;
      }, function(err) {
        confirmationMsg.textContent = "There was an error sending your request. Please try again.";
        confirmationMsg.style.display = 'block';
        submitBtn.disabled = false;
        console.log(err);
      });
  }

  if (imageFile) {
    var reader = new FileReader();
    reader.onload = function(e) {
      sendEmailWithImage(e.target.result);
    };
    reader.readAsDataURL(imageFile);
  } else {
    sendEmailWithImage('');
  }
}

document.getElementById("resumeForm").addEventListener("submit", sendMail);