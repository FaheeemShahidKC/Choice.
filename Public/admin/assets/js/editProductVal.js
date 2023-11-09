//============= EDIT PRODUCT VALIDATION==================
document.getElementById('editPro').addEventListener('click', function (event) {

      const name = document.getElementById('name').value;
      const price = document.getElementById('price').value;
      const quantity = document.getElementById('quantity').value;
      const description = document.getElementById('description').value;

      const nameError = document.getElementById('nameError')
      const priceError = document.getElementById('priceError')
      const quanError = document.getElementById('quanError')
      const descError = document.getElementById('descError')

      if (price.trim() === "" && quantity.trim() == "" && description.trim() == "") {
            nameError.style.display = ""
            nameError.textContent = "Must fillout all the fields."
            event.preventDefault()
      } else if (name.trim() == "") {
            nameError.style.display = ""
            nameError.textContent = "Product name is required."
            event.preventDefault()
      } else if (price < 1) {
            priceError.style.display = ""
            priceError.textContent = "Price must be positive value."
            event.preventDefault()
      } else if (quantity < 1) {
            quanError.style.display = ""
            quanError.textContent = "Quantity must be positive value."
            event.preventDefault()
      } else if (description.length < 10) {
            descError.style.display = ""
            descError.textContent = "Description atleast 10 letters."
      }

})