async function orderNow() {
      const name = document.getElementById("user-name").value;
      const phone = document.getElementById("user-phone").value;
      const date = document.getElementById("user-date").value;
      if (!name || !phone || !date) {
        alert("Please fill out all fields correctly, including the date.");
        return;
      }

      if (cart.length === 0) {
        alert("Please add at least one item to the cart.");
        return;
      }

      const total = cart.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2);
      const orderData = {
        name,
        phone,
        date,
        orderTime: new Date().toISOString(),
        items: cart,
        total
      };

      try {
        const userRef = window.ref(window.firebaseDB, `bananaOrders/${phone}/${date}`);
        const newOrderRef = window.push(userRef);
        await window.set(newOrderRef, orderData);

        await generatePDFInvoice(name, phone, cart, total, date);

        alert("✅ Order placed and full invoice downloaded!");
      } catch (err) {
        console.error("❌ Firebase Error:", err);
        alert("Failed to place order.");
      }
      await sendOrderSMS(name, phone, cart);
    }

    async function generatePDFInvoice(name, phone, cart, total, date) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm" });

  /* 0️⃣ Page border */
  doc.setLineWidth(0.4);
  doc.rect(10, 10, 190, 277);           // A4 portrait

  /* 1️⃣ Logo (if present) */
  const logoEl = document.getElementById("companyLogo");
  if (logoEl) {
    const canvas = document.createElement("canvas");
    canvas.width  = logoEl.naturalWidth;
    canvas.height = logoEl.naturalHeight;
    canvas.getContext("2d").drawImage(logoEl, 0, 0);
    const logoURL = canvas.toDataURL("image/png");

    const logoW = 24;
    const logoH = logoW * (logoEl.naturalHeight / logoEl.naturalWidth);
    const logoX = 20;
    const logoY = 18;
    doc.addImage(logoURL, "PNG", logoX, logoY, logoW, logoH);
  }

  /* 2️⃣ Company name */
  const textX = 20 + (logoEl ? 24 + 5 : 0);     // shift right if logo drawn
  const textY = 32;                             // eye‑tested baseline

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(34, 139, 34);
  doc.text("BALAJI BANANA LEAFS", textX, textY);

  doc.setFontSize(14);
  doc.text("Invoice", textX, textY + 9);

  /* 3️⃣ Customer info in caps */
  const infoStartY = textY + 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  doc.text(`Customer Name: ${name.toUpperCase()}`, 20, infoStartY);
  doc.text(`Phone Number: ${phone}`,               20, infoStartY + 7);
  doc.text(`Date: ${date}`,                        20, infoStartY + 14);

  /* 4️⃣ Items table (requires AutoTable) */
  const tableStartY = infoStartY + 24;

  const head = [["No", "Item", "Qty", "Rate (Rs.)", "Total (Rs.)"]];
  const body = cart.map((item, i) => [
    i + 1,
    item.name,
    item.quantity,
    item.price.toFixed(2),
    (item.quantity * item.price).toFixed(2)
  ]);

  body.push([
    { content: "Grand Total", colSpan: 4, styles: { halign: "right", fontStyle: "bold" } },
    { content: parseFloat(total).toFixed(2), styles: { fontStyle: "bold" } }
  ]);

  doc.autoTable({
    head,
    body,
    startY: tableStartY,
    theme: "grid",
    headStyles: { fillColor: [34, 139, 34], halign: "center", valign: "middle" },
    bodyStyles: { halign: "center" },
    styles: { lineWidth: 0.1, cellPadding: 2 }
  });

  /* 5️⃣ Footer */
  const afterTableY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Thank you for your order!", 20, afterTableY);

  /* 6️⃣ Download */
  doc.save(`Invoice_${name}_${date}_${Date.now()}.pdf`);
}

async function sendOrderSMS(name, phone, cart) {
  if (!window.firebaseFunctions || !window.httpsCallable) {
    console.error("Firebase Functions SDK not initialised.");
    return;
  }

  const sendSMS = window.httpsCallable(
    window.firebaseFunctions,
    "sendSMS"          // <-- name exactly as deployed in Cloud Functions
  );

  try {
    await sendSMS({ name, phone, items: cart });
    console.log("📲 SMS sent to customer and admin.");
  } catch (err) {
    console.error("❌ Failed to send SMS:", err);
  }
}
