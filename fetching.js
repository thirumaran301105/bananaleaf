document.addEventListener('DOMContentLoaded', () => {
      const modal     = document.getElementById('admin-modal');
      const modalBox  = document.getElementById('modal-box');
      const openBtn   = document.getElementById('admin-btn');
      const closeBtn  = document.getElementById('close-modal');
      const resultsEl = document.getElementById('results');
      const phoneIn   = document.getElementById('s-phone');
      const openModal = () => { modal.classList.remove('hidden'); phoneIn.focus(); };
      const closeModal = () => {
        modal.classList.add('hidden'); 
        resultsEl.innerHTML = '';
        document.getElementById('search-form').reset();
      };
      openBtn?.addEventListener('click', openModal);
      closeBtn?.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      
      document.getElementById('search-form').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const phone = phoneIn.value.trim();
        if (!phone) { resultsEl.textContent = 'Please enter a phone number.'; return; }
        resultsEl.textContent = 'Searching…';

        try {
          const snap = await window.get(window.child(window.ref(window.firebaseDB), `bananaOrders/${phone}`));
          if (!snap.exists()) { resultsEl.textContent = 'No bookings found for that number.'; return; }

          const rows = [];
          Object.entries(snap.val()).forEach(([date, orders]) => {
            Object.values(orders).forEach(order => rows.push({ date, ...order }));
          });
          rows.sort((a,b)=> (b.date> a.date ? 1 : -1));

          resultsEl.innerHTML = rows.map(r => `
            <div class="border-b py-2">
              <div><strong>${r.date}</strong></div>
              <div>${r.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</div>
              <div class="text-green-700 font-semibold">₹${r.total}</div>
            </div>`).join('');
        } catch (err) {
          console.error(err);
          resultsEl.textContent = 'Error while querying database.';
        }
      });
    });