"use strict";

const products = [
  {
    name: "Broccoli",
    category: "Vegetables",
    vegetarian: true,
    glutenFree: true,
    lactoseIntolerant: true,
    diabetic: true,
    organic: true,
    containsWheat: false,
    price: 0.5,
    image: "images/broccoli.svg",
  },
  {
    name: "Carrots",
    category: "Vegetables",
    vegetarian: true,
    glutenFree: true,
    lactoseIntolerant: true,
    diabetic: true,
    organic: false,
    containsWheat: false,
    price: 1.0,
    image: "images/carrot.png",
  },
  {
    name: "Lettuce",
    category: "Vegetables",
    vegetarian: true,
    glutenFree: true,
    lactoseIntolerant: true,
    diabetic: true,
    organic: true,
    containsWheat: false,
    price: 1.0,
    image: "images/lettuce.png",
  },
  {
    name: "Apples",
    category: "Fruits",
    vegetarian: true,
    glutenFree: true,
    lactoseIntolerant: true,
    diabetic: true,
    organic: true,
    containsWheat: false,
    price: 1.5,
    image: "images/apples.png",
  },
  {
    name: "Bananas",
    category: "Fruits",
    vegetarian: true,
    glutenFree: true,
    lactoseIntolerant: true,
    diabetic: true,
    organic: false,
    containsWheat: false,
    price: 2.0,
    image: "images/banana.png",
  },
  {
    name: "Strawberries",
    category: "Fruits",
    vegetarian: true,
    glutenFree: true,
    lactoseIntolerant: true,
    diabetic: true,
    organic: true,
    containsWheat: false,
    price: 2.0,
    image: "images/strawberry.jpg",
  },
  {
    name: "Bread",
    category: "Bakery",
    vegetarian: true,
    glutenFree: false,
    lactoseIntolerant: true,
    diabetic: true,
    organic: false,
    containsWheat: true, // wheat-based product
    price: 2.0,
    image: "images/bread.png",
  },
  {
    name: "Yogurt",
    category: "Dairy",
    vegetarian: true,
    glutenFree: true,
    lactoseIntolerant: false,
    diabetic: false,
    organic: false,
    containsWheat: false,
    price: 4.0,
    image: "images/yogurt.svg",
  },
  {
    name: "Pork Chops",
    category: "Meats",
    vegetarian: false, // meat
    glutenFree: true,
    lactoseIntolerant: true,
    diabetic: true,
    organic: false,
    containsWheat: false,
    price: 4.0,
    image: "images/Pork Chops.png",
  },
  {
    name: "Salmon",
    category: "Meats",
    vegetarian: false, // fish
    glutenFree: true,
    lactoseIntolerant: true,
    diabetic: true,
    organic: false,
    containsWheat: false,
    price: 6.0,
    image: "images/salmon.svg",
  },
];

window.products = products;

function restrictListProducts(restriction) {
  const out = [];
  for (const p of products) {
    if (!p) continue;

    if (restriction === "Vegetarian") {
      if (p.vegetarian) out.push(p.name);
    } else if (restriction === "GlutenFree") {
      if (p.glutenFree) out.push(p.name);
    } else if (restriction === "lactoseIntolerant") {
      if (p.lactoseIntolerant) out.push(p.name);
    } else if (restriction === "diabetic") {
      if (p.diabetic) out.push(p.name);
    } else {
      out.push(p.name);
    }
  }
  return out;
}
window.restrictListProducts = restrictListProducts;

function getTotalPrice(chosenNames) {
  if (!Array.isArray(chosenNames) || chosenNames.length === 0) return 0;

  const map = new Map();
  for (const p of products) map.set(String(p.name), p);

  let total = 0;
  for (const n of chosenNames) {
    const p = map.get(String(n));
    if (p && Number.isFinite(Number(p.price))) total += Number(p.price);
  }
  return total;
}
window.getTotalPrice = getTotalPrice;
