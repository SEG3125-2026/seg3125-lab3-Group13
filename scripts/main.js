"use strict";

/**
- Tab navigation (Customer / Products / Cart)
- Read customer preferences (vegetarian, gluten intolerance, organic preference)
- Filter + sort products by price (low -> high)
- Render products with price
- Build cart summary + total
- Product categories + filters (category, search, price slider)
- New navigation pattern: Breadcrumbs (clickable)
*/

function $(id) {
  return document.getElementById(id);
}

function formatPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "$0.00";
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(num);
}

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

    // Vegetarian: hide meats/fish
    if (prefs.vegetarian && p.vegetarian !== true) return false;

    // Gluten intolerance: avoid wheat products
    if (prefs.glutenIntolerance) {
      const hasWheatField = Object.prototype.hasOwnProperty.call(p, "containsWheat");
      if (hasWheatField) {
        if (p.containsWheat === true) return false;
      } else {
        if (p.glutenFree !== true) return false;
      }
    }

    // Lactose intolerance: avoid dairy products
    if (prefs.lactoseIntolerance) {
      const hasLactoseField = Object.prototype.hasOwnProperty.call(p, "lactoseIntolerant");
      if (hasLactoseField && p.lactoseIntolerant !== true) return false;
    }

    // Diabetic friendly: avoid high-sugar products
    if (prefs.diabeticFriendly) {
      const hasDiabeticField = Object.prototype.hasOwnProperty.call(p, "diabetic");
      if (hasDiabeticField && p.diabetic !== true) return false;
    }

    // Organic preference
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


function getPriorityCategoryOrder() {
  return ["Vegetables", "Fruits", "Dairy", "Meats"];
}

function getAllCategories(allProducts) {
  const set = new Set();
  for (const p of Array.isArray(allProducts) ? allProducts : []) {
    if (p && typeof p.category === "string" && p.category.trim()) set.add(p.category.trim());
  }
  const list = Array.from(set);

  const priority = getPriorityCategoryOrder();
  const prioritySet = new Set(priority);

  const head = priority.filter((c) => set.has(c));
  const tail = list.filter((c) => !prioritySet.has(c)).sort((a, b) => a.localeCompare(b));

  return head.concat(tail);
}

function getMaxProductPrice(allProducts) {
  let max = 0;
  for (const p of Array.isArray(allProducts) ? allProducts : []) {
    const price = Number(p?.price);
    if (Number.isFinite(price)) max = Math.max(max, price);
  }
  return Math.max(1, Math.ceil(max));
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function getProductPageFilters() {
  const search = String($("productSearch")?.value ?? "").trim().toLowerCase();

  const categorySelect = $("categorySelect");
  const selectedCategory = categorySelect ? String(categorySelect.value) : "All";

  const maxPriceEl = $("maxPrice");
  const maxPrice = maxPriceEl ? Number(maxPriceEl.value) : Infinity;

  const groupByCategory = !!$("toggleGroupBy")?.checked;

  return { search, selectedCategory, maxPrice, groupByCategory };
}

function applyProductPageFilters(list) {
  const { search, selectedCategory, maxPrice } = getProductPageFilters();

  return list.filter((p) => {
    const name = String(p?.name ?? "").toLowerCase();
    const category = String(p?.category ?? "").trim();

    if (selectedCategory !== "All" && category !== selectedCategory) return false;
    if (search && !name.includes(search)) return false;

    const price = Number(p?.price);
    if (Number.isFinite(maxPrice) && Number.isFinite(price) && price > maxPrice) return false;

    return true;
  });
}

function getCheckedProductNames() {
  const checked = new Set();
  const ele = document.getElementsByName("product");
  for (let i = 0; i < ele.length; i++) {
    if (ele[i].checked) checked.add(String(ele[i].value));
  }
  return checked;
}

function updateCategorySelection(newCategory) {
  const select = $("categorySelect");
  if (select) select.value = newCategory;

  const buttons = document.querySelectorAll(".category-btn");
  buttons.forEach((btn) => {
    const cat = btn.getAttribute("data-category");
    btn.classList.toggle("active", cat === newCategory);
    btn.setAttribute("aria-current", cat === newCategory ? "page" : "false");
  });

  renderProductsList();
}

function initCategoryUI() {
  const select = $("categorySelect");
  const menu = $("categoryMenu");
  if (!select || !menu) return;

  select.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "All";
  optAll.textContent = "All categories";
  select.appendChild(optAll);

  const categories = getAllCategories(window.products);
  for (const c of categories) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  }

  menu.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "category-btn active";
  allBtn.textContent = "All";
  allBtn.setAttribute("data-category", "All");
  allBtn.addEventListener("click", () => updateCategorySelection("All"));
  menu.appendChild(allBtn);

  for (const c of categories) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-btn";
    btn.textContent = c;
    btn.setAttribute("data-category", c);
    btn.addEventListener("click", () => updateCategorySelection(c));
    menu.appendChild(btn);
  }

  updateCategorySelection("All");
}

function initPriceSlider() {
  const slider = $("maxPrice");
  if (!slider) return;

  const max = getMaxProductPrice(window.products);
  slider.min = "0";
  slider.max = String(max);
  slider.step = "0.5";
  slider.value = String(max);

  setText("maxPriceValue", formatPrice(max));
}

function initProductFiltersEvents() {
  const search = $("productSearch");
  const select = $("categorySelect");
  const slider = $("maxPrice");
  const toggleGroup = $("toggleGroupBy");

  if (search) search.addEventListener("input", () => renderProductsList());

  if (select) {
    select.addEventListener("change", () => updateCategorySelection(String(select.value)));
  }

  if (slider) {
    slider.addEventListener("input", () => {
      const val = Number(slider.value);
      setText("maxPriceValue", formatPrice(val));
      renderProductsList();
    });
  }

  if (toggleGroup) toggleGroup.addEventListener("change", () => renderProductsList());
}

function renderProductRow(p, checkedSet) {
  const name = String(p.name ?? "Unnamed");
  const priceText = formatPrice(p.price);
  const imageSrc = p.image;
  const category = String(p.category ?? "Other").trim() || "Other";

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

  if (checkedSet && checkedSet.has(name)) checkbox.checked = true;

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;

  let suffix = ` — ${priceText}`;
  if (Object.prototype.hasOwnProperty.call(p, "organic")) {
    suffix += p.organic ? " (Organic)" : " (Non-organic)";
  }
  label.appendChild(document.createTextNode(name + suffix));

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = category;

  row.appendChild(img);
  row.appendChild(checkbox);
  row.appendChild(label);
  row.appendChild(badge);

  return row;
}

function renderProductsList() {
  const container = $("displayProduct");
  if (!container) return;

  const checkedSet = getCheckedProductNames();
  container.innerHTML = "";

  const prefs = getUserPreferences();
  const baseList = filterAndSortProducts(window.products, prefs);
  const list = applyProductPageFilters(baseList);

  const countEl = $("resultsCount");
  if (countEl) countEl.textContent = `${list.length} item(s) shown`;

  if (!list.length) {
    const msg = document.createElement("p");
    msg.textContent = "No products match your filters. Try changing your preferences or filters.";
    container.appendChild(msg);
    return;
  }

  const { selectedCategory, groupByCategory } = getProductPageFilters();

  if (groupByCategory && selectedCategory === "All") {
    const categories = getAllCategories(list);

    for (const cat of categories) {
      const items = list.filter((p) => String(p.category ?? "").trim() === cat);
      if (!items.length) continue;

      const h = document.createElement("h3");
      h.className = "category-heading";
      h.textContent = cat;
      container.appendChild(h);

      for (const p of items) {
        container.appendChild(renderProductRow(p, checkedSet));
      }
    }
    return;
  }

  for (const p of list) {
    container.appendChild(renderProductRow(p, checkedSet));
  }
}

function updateBreadcrumb(activeTab) {
  const crumbs = document.querySelectorAll(".crumb");
  crumbs.forEach((c) => {
    const tab = c.getAttribute("data-tab");
    const isActive = tab === activeTab;
    c.classList.toggle("active", isActive);
    c.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function navigateTo(tabName) {
  const btn =
    tabName === "Customer" ? $("defaultOpen") :
    tabName === "Products" ? $("productsTab") :
    tabName === "Cart" ? $("cartTab") :
    null;

  if (btn) {
    openInfo({ currentTarget: btn }, tabName);
  } else {
    openInfo(null, tabName);
  }
}
window.navigateTo = navigateTo;

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

  updateBreadcrumb(tabName);

  if (tabName === "Products") {
    renderProductsList();
  } else if (tabName === "Cart") {
    selectedItems();
  }
}
window.openInfo = openInfo;

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

  const ul = document.createElement("ul");

  const map = new Map();
  if (Array.isArray(window.products)) {
    for (const p of window.products) map.set(String(p.name), p);
  }

  for (const name of chosenNames) {
    const p = map.get(String(name));
    const li = document.createElement("li");
    li.textContent = p ? `${name} — ${formatPrice(p.price)}` : name;
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
      const productsTab = $("Products");
      if (productsTab && productsTab.style.display === "block") {
        renderProductsList();
      }
    });
  }

  initCategoryUI();
  initPriceSlider();
  initProductFiltersEvents();

  updateBreadcrumb("Customer");
});
