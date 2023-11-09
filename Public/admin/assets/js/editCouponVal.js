//=============EDIT COUPON VALIDATION==================
document.getElementById('editCoupon').addEventListener('click', function (event) {
      console.log("ethiiiiiiii");
      event.preventDefault()
      const name = document.getElementById('name').value;
      const code = document.getElementById('code').value;
      const discount = document.getElementById('discount').value;
      const amount = document.getElementById('amount').value;
      const active = document.getElementById('active').value;
      const expiry = document.getElementById('expiry').value;
      const limit = document.getElementById('limit').value;
      const id = document.getElementById('id').value;

      const nameError = document.getElementById('nameError')
      const codeError = document.getElementById('codeError')
      const disError = document.getElementById('disError')
      const amountError = document.getElementById('amountError')
      const activeError = document.getElementById('activeError')
      const expError = document.getElementById('expError')
      const limitError = document.getElementById('limitError')

      $.ajax({
            url: "/admin/editedCoupon?id=" + id,
            data: {
                  name: name,
                  code: code,
                  discount: discount,
                  activeDate: active,
                  expDate: expiry,
                  criteriaAmount: amount,
                  userLimit: limit
            },
            method: "post",
            success: (response) => {
                  if ((response.require)) {
                        nameError.style.display = "block";
                        nameError.textContent = "Must fillout all fields."
                  } else if (response.disMinus) {
                        disError.style.display = "block";
                        disError.textContent = "Discount not contain negative or zero value."
                  } else if (response.amountMinus) {
                        amountError.style.display = "block";
                        amountError.textContent = "Criteria amount not contain negative or zero value."
                  } else if (response.activeDate) {
                        activeError.style.display = "block";
                        activeError.textContent = "Activation date not be a past date."
                  } else if (response.expDate) {
                        expError.style.display = "block";
                        expError.textContent = "Expiry date must be after activation date."
                  } else if (response.limit) {
                        limitError.style.display = "block";
                        limitError.textContent = "Users limit must be positive value."
                  } else if (response.failed) {
                        limitError.style.display = "block";
                        limitError.textContent = "Oops! something went wrong, please try again."
                  } else {
                        window.location.href = "/admin/couponManagment"
                  }
            },
      });
})