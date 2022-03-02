import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { CartItem, Product } from "./shared/shareddtypes";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Shopping from "./components/Shopping";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Checkout from "./components/Checkout";

import "./App.css";

import "bootstrap/dist/css/bootstrap.css";

function App(): JSX.Element {
  const [productsCart, setProductsCart] = useState<CartItem[]>([]);
  const [totalUnitsInCart, setTotalUnitsInCart] = useState<number>(Number());

  const handleAddCart = (product: Product) => {
    const products = productsCart.slice();
    let found: number = -1;
    products.forEach((cartItem, index) => {
      if (cartItem.product.code == product.code) {
        found = index;
      }
    });

    if (found >= 0) {
      products[found].amount += 1;
    } else {
      products.push({ product: product, amount: 1 });
    }
    setProductsCart(products);
    setTotalUnitsInCart(totalUnitsInCart + 1);
  };

  const handleDecrementUnit = (product: Product) => {
    const products = productsCart.slice();
    let found: number = -1;
    products.forEach((cartItem, index) => {
      if (cartItem.product.code == product.code) {
        found = index;
      }
    });

    products[found].amount -= 1;
    if (products[found].amount == 0) {
      delete products[found];
    }
    setProductsCart(products);
    setTotalUnitsInCart(totalUnitsInCart - 1);
  };

  return (
    <Router>
      <NavBar isAuthenticated={false} totalUnitsInCart={totalUnitsInCart} />
      <Routes>
        <Route index element={<Home onAdd={handleAddCart} />} />
        <Route
          path="cart"
          element={
            <Shopping
              products={productsCart}
              onDecrementUnit={handleDecrementUnit}
              onIncrementUnit={handleAddCart}
            />
          }
        />
        <Route
          path="checkout"
          element={<Checkout productsCart={productsCart.slice()} />}
        />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
