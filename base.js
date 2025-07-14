const prices = {
      thalai: 4,
      parcel: 1.5,
      round: 1.5
    };

    const names = {
      thalai: "Thalai Ilai Leaf",
      parcel: "Parcel Leaf",
      round: "Round Shape Leaf"
    };

    let cart = [];
    let userFormShown = false;

    function adjustQty(type, change) {
      const input = document.getElementById(`qty-${type}`);
      let qty = parseInt(input.value) || 1;
      qty = Math.max(1, qty + change);
      input.value = qty;
      updateTotal(type);
    }
    function updateTotal(type) {
      const qty = parseInt(document.getElementById(`qty-${type}`).value) || 1;
      const total = (qty * prices[type]).toFixed(2);
      document.getElementById(`total-${type}`).innerText = total;
    }