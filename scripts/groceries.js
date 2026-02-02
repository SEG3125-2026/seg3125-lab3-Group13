"use strict";

const products = [
  {
    name: "Broccoli",
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
      // For wheat-based filtering, you could also use: if (!p.containsWheat) out.push(p.name);
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

/** Compute total price from an array of product names. */
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