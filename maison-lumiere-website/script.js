const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();

const reservationForm = document.querySelector(".reservation-form");
if (reservationForm) {
  const dateInput = reservationForm.elements.date;
  const today = new Date();
  dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);

  reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    reservationForm.querySelector(".form-note").textContent =
      "Merci! This demo form is ready to connect to your reservation service.";
  });
}

const menuGrid = document.querySelector(".menu-grid");
const orderDialog = document.querySelector("#order-dialog");
if (menuGrid && orderDialog) {
  const cartButton = document.querySelector(".order-cart-toggle");
  const countDisplay = cartButton.querySelector(".order-count");
  const cartTotalDisplay = cartButton.querySelector(".order-cart-total");
  const itemList = orderDialog.querySelector(".order-items");
  const emptyMessage = orderDialog.querySelector(".order-empty");
  const totalDisplay = orderDialog.querySelector(".order-total strong");
  const statusMessage = orderDialog.querySelector(".order-status");
  const clearButton = orderDialog.querySelector(".order-clear");
  const submitButton = orderDialog.querySelector(".order-submit");
  const cart = new Map();

  const formatPrice = (price) => `₱${price.toLocaleString("en-PH")}`;
  const getItemCount = () =>
    [...cart.values()].reduce((total, item) => total + item.quantity, 0);
  const getOrderTotal = () =>
    [...cart.values()].reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

  const renderOrder = () => {
    const itemCount = getItemCount();
    const orderTotal = getOrderTotal();
    countDisplay.textContent = String(itemCount);
    cartTotalDisplay.textContent = formatPrice(orderTotal);
    cartButton.setAttribute(
      "aria-label",
      `Open your order, ${itemCount} ${itemCount === 1 ? "item" : "items"}, ${formatPrice(orderTotal)}`,
    );
    emptyMessage.hidden = itemCount > 0;
    itemList.replaceChildren();

    for (const [name, item] of cart) {
      const row = document.createElement("li");
      const itemName = document.createElement("span");
      itemName.className = "order-item-name";
      itemName.textContent = name;

      const subtotal = document.createElement("span");
      subtotal.className = "order-item-subtotal";
      subtotal.textContent = formatPrice(item.price * item.quantity);

      const controls = document.createElement("div");
      controls.className = "order-quantity-controls";
      controls.setAttribute("aria-label", `Quantity for ${name}`);

      const decreaseButton = document.createElement("button");
      decreaseButton.type = "button";
      decreaseButton.dataset.orderAction = "decrease";
      decreaseButton.dataset.itemName = name;
      decreaseButton.setAttribute("aria-label", `Remove one ${name}`);
      decreaseButton.textContent = "−";

      const quantity = document.createElement("span");
      quantity.className = "order-quantity";
      quantity.textContent = String(item.quantity);
      quantity.setAttribute("aria-label", "Quantity");

      const increaseButton = document.createElement("button");
      increaseButton.type = "button";
      increaseButton.dataset.orderAction = "increase";
      increaseButton.dataset.itemName = name;
      increaseButton.setAttribute("aria-label", `Add one ${name}`);
      increaseButton.textContent = "+";

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "order-remove";
      removeButton.dataset.orderAction = "remove";
      removeButton.dataset.itemName = name;
      removeButton.textContent = "Remove";
      removeButton.setAttribute("aria-label", `Remove ${name} from your order`);

      controls.append(
        decreaseButton,
        quantity,
        increaseButton,
        removeButton,
      );
      row.append(itemName, subtotal, controls);
      itemList.append(row);
    }

    totalDisplay.textContent = formatPrice(orderTotal);
    clearButton.disabled = itemCount === 0;
    submitButton.disabled = itemCount === 0;
  };

  menuGrid.querySelectorAll(".menu-list li").forEach((menuItem) => {
    const name = menuItem.querySelector("h4").textContent.trim();
    const priceText = menuItem.querySelector(".menu-price").textContent;
    const price = Number(priceText.replace(/[^\d]/g, ""));
    const details = menuItem.querySelector("div");
    const addButton = document.createElement("button");

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Invalid menu price for "${name}": ${priceText}`);
    }

    addButton.type = "button";
    addButton.className = "add-to-order";
    addButton.setAttribute("aria-label", `Add ${name} to your order`);
    addButton.append(document.createTextNode("Add to order "));
    const addIcon = document.createElement("span");
    addIcon.setAttribute("aria-hidden", "true");
    addIcon.textContent = "+";
    addButton.append(addIcon);
    addButton.addEventListener("click", () => {
      const item = cart.get(name) || { price, quantity: 0 };
      item.quantity += 1;
      cart.set(name, item);
      statusMessage.textContent = `${name} added to your order.`;
      renderOrder();
    });
    details.append(addButton);
  });

  cartButton.addEventListener("click", () => {
    statusMessage.textContent = "";
    orderDialog.showModal();
  });

  itemList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-order-action]");
    if (!button) return;

    const item = cart.get(button.dataset.itemName);
    if (!item) return;

    if (button.dataset.orderAction === "increase") {
      item.quantity += 1;
    } else if (button.dataset.orderAction === "decrease") {
      item.quantity -= 1;
      if (item.quantity <= 0) cart.delete(button.dataset.itemName);
    } else if (button.dataset.orderAction === "remove") {
      cart.delete(button.dataset.itemName);
    }

    statusMessage.textContent = "";
    renderOrder();
  });

  clearButton.addEventListener("click", () => {
    cart.clear();
    statusMessage.textContent = "Your order has been cleared.";
    renderOrder();
  });

  submitButton.addEventListener("click", () => {
    statusMessage.textContent =
      "Your demo order is ready, but it has not been sent to the restaurant.";
  });

  orderDialog.addEventListener("click", (event) => {
    if (event.target === orderDialog) orderDialog.close();
  });
  renderOrder();
}
