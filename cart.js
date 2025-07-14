function persistCart () {
      localStorage.setItem('cartData', JSON.stringify(cart));
    }
    function addToCart(type) {
  const qty   = parseInt(document.getElementById(`qty-${type}`).value) || 1;
  const price = prices[type];
  const name  = names[type];

  // 👉 look for an existing line with the same name
  const line = cart.find(item => item.name === name);

  if (line) {
    // already in cart → bump its quantity & total
    line.quantity += qty;
    line.total     = (line.quantity * price).toFixed(2);
  } else {
    // not yet in cart → create a fresh entry
    cart.push({
      name,
      quantity: qty,
      price,
      total: (qty * price).toFixed(2)
    });
  }

  persistCart();      // keep localStorage in sync
  renderCart();       // refresh the UI

  if (!userFormShown) { showUserForm(); userFormShown = true; }
}
    function removeFromCart(index) {
  cart.splice(index, 1);
  persistCart();
  renderCart();
}

    function changeCartQty(index, delta) {
  const line = cart[index];
  if (!line) return;

  line.quantity += delta;            // bump up/down
  if (line.quantity <= 0) {          // 0 or less → remove
    cart.splice(index, 1);
  } else {
    line.total = (line.quantity * line.price).toFixed(2);
  }

  persistCart();                     // keep localStorage in‑sync
  renderCart();                      // refresh UI
}

    function renderCart() {
  const cartDiv = document.getElementById("cart-items");
  document.getElementById("cart-count").innerText = cart.length;

  if (cart.length === 0) {
    cartDiv.innerHTML = `
      <h2 class='text-2xl font-bold mb-4'>🛒 Your Cart</h2>
      <p class='text-gray-600'>No items in cart yet.</p>`;
    return;
  }

  let html = `<h2 class='text-2xl font-bold mb-4'>🛒 Your Cart</h2><ul class="space-y-4">`;

  cart.forEach((item, index) => {
    html += `
      <li class="flex justify-between items-center border-b pb-2">
        <div>
          <p class="font-semibold">${item.name}</p>
          <div class="text-sm text-gray-600 flex items-center space-x-1">
            <button onclick="changeCartQty(${index}, -1)" class="px-2 bg-gray-200 rounded leading-none">−</button>
            <span>${item.quantity}</span>
            <button onclick="changeCartQty(${index}, 1)" class="px-2 bg-gray-200 rounded leading-none">+</button>
            <span class="ml-1">× ₹${item.price}</span>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <p class="text-green-700 font-bold">₹${item.total}</p>
          <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 text-sm">🗑 Remove</button>
        </div>
      </li>`;
  });

  const grandTotal = cart.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2);
  html += `</ul><div class="mt-4 text-right font-bold text-lg text-green-700">Total: ₹${grandTotal}</div>`;

  html += `
    <div class="mt-6">
      <form onsubmit="submitUser(event)" class="border-t pt-4">
        <h3 class="text-lg font-semibold mb-2">Enter Your Details</h3>
        <div class="mb-2">
          <label class="block text-sm">Name:</label>
          <input type="text" id="user-name" class="w-full p-2 border rounded" required>
        </div>
        <div class="mb-2">
          <label class="block text-sm">Phone Number:</label>
          <input type="tel" id="user-phone" class="w-full p-2 border rounded" required>
        </div>
        <div class="mb-2">
          <label class="block text-sm">Order Date:</label>
          <input type="date" id="user-date" class="w-full p-2 border rounded" required>
        </div>
      </form>
    </div>
    <div class="mt-4 text-right">
      <button onclick="orderNow()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        🛒 Order Now
      </button>
    </div>
  `;

  cartDiv.innerHTML = html;
}
    function scrollToCart() {
      document.getElementById("cart-items").scrollIntoView({ behavior: "smooth" });
    }

    function showUserForm() {
      renderCart();
    }