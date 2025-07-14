import { get, child } from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
  document.getElementById('search-form')
    .addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const phone = document.getElementById('s-phone').value.trim();
      const out   = document.getElementById('results');
      if (!phone) {              
        out.innerHTML = 'Please enter a phone number.'; 
        return;
      }
      out.innerHTML = 'Searching…';
      try {
        const snap = await get(
          child(window.ref(window.firebaseDB), `bananaOrders/${phone}`)
        );

        if (!snap.exists()) {
          out.innerHTML = 'No bookings found for that number.';
          return;
        }
        const rows = [];
        Object.entries(snap.val()).forEach(([date, orders]) => {
          Object.values(orders).forEach(order =>
            rows.push({ date, ...order })
          );
        });
        rows.sort((a, b) => (b.date > a.date ? 1 : -1));
        out.innerHTML = rows.map(r => `
          <div class="border-b py-2">
            <div><strong>${r.date}</strong></div>
            <div>${r.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</div>
            <div class="text-green-700 font-semibold">₹${r.total}</div>
          </div>`).join('');

      } catch (err) {
        console.error(err);
        out.innerHTML = 'Error while querying database.';
      }
    });