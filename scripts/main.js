"use strict";

/**
- Tab navigation (Customer / Products / Cart)
- Read customer preferences (vegetarian, gluten intolerance, organic preference)
- Filter + sort products by price (low -> high)
- Render products with price
- Build cart summary + total
*/

function $(id) {
  return document.getElementById(id);
}

function formatPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "$0.00";
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(num);
}


/** Read preferences from Customer form */
function getUserPreferences() {
  const vegetarian = !!$("prefVegetarian")?.checked;
  const glutenIntolerance = !!$("prefGlutenFree")?.checked;
  const lactoseIntolerance = !!$("prefLactoseFree")?.checked;
  const diabeticFriendly = !!$("prefDiabeticFriendly")?.checked;

  let organicPref = "any"; // any | organic | nonOrganic
  const organicRadio = document.querySelector('input[name="prefOrganic"]:checked');
  if (organicRadio && typeof organicRadio.value === "string") organicPref = organicRadio.value;

  return { vegetarian, glutenIntolerance, lactoseIntolerance, diabeticFriendly, organicPref };
}



/** Filter products based on preferences and sort by price ascending. */
function filterAndSortProducts(allProducts, prefs) {
  const safeList = Array.isArray(allProducts) ? allProducts.slice() : [];

  const filtered = safeList.filter((p) => {
    if (!p || typeof p !== "object") return false;

    // Vegetarian: hide meats/fish (your dataset uses vegetarian boolean)
    if (prefs.vegetarian && p.vegetarian !== true) return false;

    // Gluten intolerance: avoid wheat products (prefer containsWheat if exists)
    if (prefs.glutenIntolerance) {
      const hasWheatField = Object.prototype.hasOwnProperty.call(p, "containsWheat");
      if (hasWheatField) {
        if (p.containsWheat === true) return false; // contains wheat -> hide
      } else {
        // fallback for older datasets
        if (p.glutenFree !== true) return false;
      }
    }

    // Lactose intolerance: avoid dairy products (prefer containsDairy if exists)
    if (prefs.lactoseIntolerance) {
      const hasDairyField = Object.prototype.hasOwnProperty.call(p, "lactoseIntolerant");
      if (hasDairyField && p.lactoseIntolerant !== true) return false;
    }

    // Diabetic friendly: avoid high-sugar products (prefer highSugar if exists)
    if (prefs.diabeticFriendly) {
      const hasHighSugarField = Object.prototype.hasOwnProperty.call(p, "diabetic");
      if (hasHighSugarField && p.diabetic !== true) return false;
    }

    // Organic preference: only filter if the field exists
    const hasOrganicField = Object.prototype.hasOwnProperty.call(p, "organic");
    if (hasOrganicField) {
      if (prefs.organicPref === "organic" && p.organic !== true) return false;
      if (prefs.organicPref === "nonOrganic" && p.organic !== false) return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    const pa = Number(a.price);
    const pb = Number(b.price);
    const aOk = Number.isFinite(pa);
    const bOk = Number.isFinite(pb);
    if (aOk && bOk) return pa - pb;
    if (aOk && !bOk) return -1;
    if (!aOk && bOk) return 1;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  return filtered;
}



/** Render products into #displayProduct (checkbox list with price) */
function renderProductsList() {
  const container = $("displayProduct");
  if (!container) return;

  container.innerHTML = "";

  // `products` comes from groceries.js
  const prefs = getUserPreferences();
  const list = filterAndSortProducts(window.products, prefs);

  if (!list.length) {
    const msg = document.createElement("p");
    msg.textContent = "No products match your preferences. Try changing your filters on the Customer page.";
    container.appendChild(msg);
    return;
  }

  for (const p of list) {
    const name = String(p.name ?? "Unnamed");
    const priceText = formatPrice(p.price);
    const imageSrc = p.image; 

    const row = document.createElement("div");
    row.className = "product-row";

    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = name;
    img.className = "product-image"; 

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "product";
    checkbox.value = name;
    checkbox.id = `prod_${name.replace(/\s+/g, "_")}`;

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;

    // Label text: "Name — $X.XX" (+ optional organic tag if available)
    let suffix = ` — ${priceText}`;
    if (Object.prototype.hasOwnProperty.call(p, "organic")) {
      suffix += p.organic ? " (Organic)" : " (Non-organic)";
    }

    label.appendChild(document.createTextNode(name + suffix));

    row.appendChild(img);
    row.appendChild(checkbox);
    row.appendChild(label);

    container.appendChild(row);
  }
}

/** Tab switching */
function openInfo(evt, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = "none";

  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  const current = $(tabName);
  if (current) current.style.display = "block";

  if (evt && evt.currentTarget) evt.currentTarget.className += " active";

  // Auto-refresh content when switching tabs
  if (tabName === "Products") {
    renderProductsList();
  } else if (tabName === "Cart") {
    selectedItems();
  }
}

/** Cart builder (writes into #displayCart) */
function selectedItems() {
  const c = $("displayCart");
  if (!c) return;

  const ele = document.getElementsByName("product");
  const chosenNames = [];

  for (let i = 0; i < ele.length; i++) {
    if (ele[i].checked) chosenNames.push(ele[i].value);
  }

  c.innerHTML = "";

  const title = document.createElement("p");
  title.textContent = chosenNames.length ? "You selected:" : "Your cart is empty.";
  c.appendChild(title);

  if (!chosenNames.length) return;

  // Build list + total
  const ul = document.createElement("ul");

  // Map for quick lookup (name -> product)
  const map = new Map();
  if (Array.isArray(window.products)) {
    for (const p of window.products) map.set(String(p.name), p);
  }

  for (const name of chosenNames) {
    const p = map.get(String(name));
    const li = document.createElement("li");
    if (p) {
      li.textContent = `${name} — ${formatPrice(p.price)}`;
    } else {
      li.textContent = name;
    }
    ul.appendChild(li);
  }

  c.appendChild(ul);

  let total = 0;
  if (typeof window.getTotalPrice === "function") {
    total = window.getTotalPrice(chosenNames);
  } else {
    for (const name of chosenNames) {
      const p = map.get(String(name));
      if (p && Number.isFinite(Number(p.price))) total += Number(p.price);
    }
  }

  const totalLine = document.createElement("p");
  totalLine.textContent = `Total Price: ${formatPrice(total)}`;
  c.appendChild(totalLine);
}


document.addEventListener("DOMContentLoaded", () => {
  const form = $("customerForm");
  if (form) {
    form.addEventListener("change", () => {
      // Refresh product list only if Products tab is visible
      const productsTab = $("Products");
      if (productsTab && productsTab.style.display === "block") {
        renderProductsList();
      }
    });
  }
});