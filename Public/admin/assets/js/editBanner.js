//============= EDIT PRODUCT VALIDATION==================
document.getElementById('editBanner').addEventListener('click', function (event) {

      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;

      const titleError = document.getElementById('titleError')
      const desError = document.getElementById('desError')
      if (title.trim() == "") {
            titleError.style.display = ""
            titleError.textContent = "Banner title is required."
            event.preventDefault()
      } else if (description.trim() == "") {
            desError.style.display = ""
            desError.textContent = "Description id required."
            event.preventDefault()
      } else if (title.length < 11) {
            titleError.style.display = ""
            titleError.textContent = "Banner title must contain 10 letters."
            event.preventDefault()
      } else if (description.length < 21) {
            desError.style.display = ""
            desError.textContent = "Description must contain 20 letters."
            event.preventDefault()
      }

})